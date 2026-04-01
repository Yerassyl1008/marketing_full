import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

loadEnv({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });

import type { Database } from "better-sqlite3";
import type { Response } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import PQueue from "p-queue";

import {
  deleteLead,
  getBoard,
  getLeadById,
  insertLead,
  openDb,
  updateLeadFields,
  updateLeadStatus,
} from "./db.js";
import { buildBoard, nextLeadId } from "./sheets-parse.js";
import { createSheetsClient, SheetsMirror } from "./sheets-sync.js";
import type { LeadRow } from "./types.js";
import {
  LeadCreateSchema,
  LeadStatusUpdateSchema,
  LeadUpdateSchema,
} from "./types.js";

function gaxiosMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { error?: { message?: string; status?: string } } } })
      .response?.data?.error;
    if (data?.message) {
      return data.status ? `${data.status}: ${data.message}` : data.message;
    }
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

const SHEETS_HINT =
  "Открой таблицу → «Настроить доступ» → добавь email сервисного аккаунта (из JSON) с правом «Редактор». В Google Cloud для проекта включи API «Google Sheets». Лист должен называться как GOOGLE_SHEETS_TAB (по умолчанию Leads).";

function sendSheetsError(res: Response, err: unknown, label: string): void {
  const msg = gaxiosMessage(err);
  console.error(`[sheets-err] ${label}:`, msg);
  if (process.env.SHEETS_DEBUG === "1") {
    console.error(err);
  }
  const detail =
    process.env.SHEETS_DEBUG === "1"
      ? `Google Sheets: ${msg}`
      : `Google Sheets недоступна. ${SHEETS_HINT}`;
  res.status(503).json({
    detail,
    ...(process.env.SHEETS_DEBUG === "1" ? { sheets_error: msg } : {}),
  });
}

const PORT = Number(process.env.PORT || 8010);

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || "";
const sheetName = process.env.GOOGLE_SHEETS_TAB?.trim() || "Leads";

let mirror: SheetsMirror | null = null;
let db: Database | null = null;

const sheetsQueue = new PQueue({
  concurrency: 1,
  interval: Number(process.env.SHEETS_MIN_INTERVAL_MS || 120),
  intervalCap: 1,
});

if (
  spreadsheetId &&
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim()
) {
  try {
    mirror = new SheetsMirror(createSheetsClient(), { spreadsheetId, sheetName });
    console.info("[sheets] Источник правды — таблица:", spreadsheetId, "/", sheetName);
  } catch (e) {
    console.error("[sheets] Init error:", e);
  }
} else {
  console.warn(
    "[sheets] Google не настроен — режим только SQLite (без синхронизации в лист)."
  );
}

if (!mirror) {
  db = openDb();
} else {
  console.info(
    "[crm] Доска читается из Google Sheets; правки менеджера в таблице видны на сайте (кэш BOARD_CACHE_MS)."
  );
  if (process.env.SHEETS_MANAGER_FORMAT !== "0") {
    void (async () => {
      try {
        await mirror!.applyManagerFormatting();
        console.info("[sheets] Лист: шапка, список статуса, цвета по статусу.");
      } catch (e) {
        console.warn("[sheets] applyManagerFormatting:", e);
      }
    })();
  }
}

const BOARD_CACHE_MS = Number(process.env.BOARD_CACHE_MS ?? 2500);
let boardCache: { at: number; board: ReturnType<typeof buildBoard> } | null = null;

function invalidateBoardCache(): void {
  boardCache = null;
}

function sheetsOp<T>(fn: () => Promise<T>): Promise<T> {
  return sheetsQueue.add(fn) as Promise<T>;
}

async function getBoardForResponse(limit: number) {
  if (!mirror) {
    if (!db) throw new Error("No database");
    return getBoard(db, limit);
  }
  if (
    BOARD_CACHE_MS > 0 &&
    boardCache &&
    Date.now() - boardCache.at < BOARD_CACHE_MS
  ) {
    return boardCache.board;
  }
  const leads = await sheetsOp(() => mirror!.loadAllLeadsParsed());
  const board = buildBoard(leads, limit);
  boardCache = { at: Date.now(), board };
  return board;
}

const formLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Too many requests — try again later." },
});

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    storage: mirror ? "google_sheet" : "sqlite",
    sheets: Boolean(mirror),
    boardCacheMs: mirror ? BOARD_CACHE_MS : null,
    queuePending: sheetsQueue.pending,
    queueSize: sheetsQueue.size,
    adminLoginConfigured: Boolean(
      process.env.ADMIN_EMAIL?.trim() && (process.env.ADMIN_PASSWORD ?? "").length > 0
    ),
    sheetsProbeUrl: mirror ? "/health/sheets" : null,
  });
});

/** Точная причина ошибок Google: открой с ПК где запущен CRM */
app.get("/health/sheets", async (_req, res) => {
  if (!mirror) {
    res.status(503).json({ ok: false, error: "Google Sheets не настроен в .env" });
    return;
  }
  try {
    const d = await mirror.diagnose();
    res.status(d.ok ? 200 : 503).json(d);
  } catch (e) {
    res.status(503).json({ ok: false, error: gaxiosMessage(e) });
  }
});

app.post("/auth/login", (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || adminPassword.length === 0) {
    console.warn("[auth] Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    res.status(503).json({
      detail:
        "CRM: не заданы ADMIN_EMAIL и ADMIN_PASSWORD (вход в админку сайта через этот сервер).",
    });
    return;
  }

  if (email !== adminEmail || password !== adminPassword) {
    res.status(401).json({ detail: "Invalid credentials" });
    return;
  }

  const stable = process.env.ADMIN_ACCESS_TOKEN?.trim();
  const access_token =
    stable && stable.length >= 16 ? stable : `gsheet-crm-${randomUUID()}`;
  res.json({ access_token, token_type: "bearer" });
});

const publicLeads = express.Router();

publicLeads.post("/", formLimiter, async (req, res) => {
  const parsed = LeadCreateSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    res.status(422).json({ detail: i ? `${i.path.join(".")}: ${i.message}` : "Invalid payload" });
    return;
  }

  if (!mirror) {
    if (!db) {
      res.status(503).json({ detail: "CRM: нет ни Google Sheets, ни SQLite." });
      return;
    }
    const row = insertLead(db, {
      name: parsed.data.name,
      email: parsed.data.email,
      contact_type: parsed.data.contact_type,
      contact: parsed.data.contact,
      message: parsed.data.message ?? null,
    });
    res.status(201).json(row);
    return;
  }

  try {
    const row = await sheetsOp(async () => {
      const leads = await mirror!.loadAllLeadsParsed();
      const id = nextLeadId(leads);
      const now = new Date().toISOString();
      const lead: LeadRow = {
        id,
        name: parsed.data.name,
        email: parsed.data.email,
        contact_type: parsed.data.contact_type,
        contact: parsed.data.contact,
        message: parsed.data.message ?? null,
        status: "new",
        created_at: now,
        updated_at: now,
      };
      await mirror!.appendLead(lead);
      return lead;
    });
    invalidateBoardCache();
    res.status(201).json(row);
  } catch (e) {
    sendSheetsError(res, e, "POST /public/leads");
  }
});

publicLeads.get("/board", async (req, res) => {
  const limit = Number(req.query.limit) || 1000;
  try {
    res.json(await getBoardForResponse(limit));
  } catch (e) {
    sendSheetsError(res, e, "GET /public/leads/board");
  }
});

publicLeads.patch("/:leadId/status", async (req, res) => {
  const id = Number(req.params.leadId);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ detail: "Invalid id" });
    return;
  }
  const parsed = LeadStatusUpdateSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    res.status(422).json({ detail: i ? `${i.path.join(".")}: ${i.message}` : "Invalid payload" });
    return;
  }

  if (!mirror) {
    if (!db) {
      res.status(503).json({ detail: "No storage" });
      return;
    }
    const updated = updateLeadStatus(db, id, parsed.data.status);
    if (!updated) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }
    res.json(updated);
    return;
  }

  try {
    const updated = await sheetsOp(async () => {
      const current = await mirror!.getLeadByIdParsed(id);
      if (!current) return null;
      const now = new Date().toISOString();
      const merged: LeadRow = {
        ...current,
        status: parsed.data.status,
        updated_at: now,
      };
      await mirror!.updateLeadRow(merged);
      return merged;
    });
    if (!updated) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }
    invalidateBoardCache();
    res.json(updated);
  } catch (e) {
    sendSheetsError(res, e, "PATCH /public/leads/:id/status");
  }
});

publicLeads.patch("/:leadId", async (req, res) => {
  const id = Number(req.params.leadId);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ detail: "Invalid id" });
    return;
  }
  const parsed = LeadUpdateSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    res.status(422).json({ detail: i ? `${i.path.join(".")}: ${i.message}` : "Invalid payload" });
    return;
  }
  const patch = parsed.data;

  if (!mirror) {
    if (!db) {
      res.status(503).json({ detail: "No storage" });
      return;
    }
    if (Object.keys(patch).length === 0) {
      const current = getLeadById(db, id);
      if (!current) {
        res.status(404).json({ detail: "Lead not found" });
        return;
      }
      res.json(current);
      return;
    }
    const updated = updateLeadFields(db, id, patch);
    if (!updated) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }
    res.json(updated);
    return;
  }

  try {
    if (Object.keys(patch).length === 0) {
      const current = await sheetsOp(() => mirror!.getLeadByIdParsed(id));
      if (!current) {
        res.status(404).json({ detail: "Lead not found" });
        return;
      }
      res.json(current);
      return;
    }

    const updated = await sheetsOp(async () => {
      const current = await mirror!.getLeadByIdParsed(id);
      if (!current) return null;
      const now = new Date().toISOString();
      const merged: LeadRow = {
        name: patch.name ?? current.name,
        email: patch.email ?? current.email,
        contact_type: patch.contact_type ?? current.contact_type,
        contact: patch.contact ?? current.contact,
        message: patch.message !== undefined ? patch.message : current.message,
        status: patch.status ?? current.status,
        id: current.id,
        created_at: current.created_at,
        updated_at: now,
      };
      await mirror!.updateLeadRow(merged);
      return merged;
    });
    if (!updated) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }
    invalidateBoardCache();
    res.json(updated);
  } catch (e) {
    sendSheetsError(res, e, "PATCH /public/leads/:id");
  }
});

async function deleteLeadHandler(req: express.Request, res: express.Response) {
  const id = Number(req.params.leadId);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ detail: "Invalid id" });
    return;
  }

  if (!mirror) {
    if (!db) {
      res.status(503).json({ detail: "No storage" });
      return;
    }
    const ok = deleteLead(db, id);
    if (!ok) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }
    res.json({ message: "Lead deleted" });
    return;
  }

  try {
    const ok = await sheetsOp(async () => {
      const ex = await mirror!.getLeadByIdParsed(id);
      if (!ex) return false;
      await mirror!.deleteLeadRow(id);
      return true;
    });
    if (!ok) {
      res.status(404).json({ detail: "Lead not found" });
      return;
    }
    invalidateBoardCache();
    res.json({ message: "Lead deleted" });
  } catch (e) {
    sendSheetsError(res, e, "DELETE /public/leads/delete/:id");
  }
}

publicLeads.delete("/delete/:leadId", (req, res) => void deleteLeadHandler(req, res));
publicLeads.post("/delete/:leadId", (req, res) => void deleteLeadHandler(req, res));

app.use("/public/leads", publicLeads);

const server = app.listen(PORT, () => {
  console.info(
    `[crm] http://127.0.0.1:${PORT}  (/auth/login, /public/leads, /public/leads/board)`
  );
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[crm] Порт ${PORT} уже занят (запущен другой экземпляр CRM?). Закрой тот процесс или в .env укажи другой PORT=8011 и обнови CRM_API_URL в Next.`
    );
    process.exit(1);
  }
  throw err;
});
