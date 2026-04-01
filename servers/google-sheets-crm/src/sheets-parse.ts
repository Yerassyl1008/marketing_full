import type { BoardResponse, LeadRow, LeadStatus } from "./types.js";
import { STATUSES } from "./types.js";

/** Англ. значения API + русские подписи из таблицы / ручной ввод */
function normalizeStatus(raw: string): LeadStatus {
  const t = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (STATUSES.includes(t as LeadStatus)) return t as LeadStatus;
  if (t === "in_proggress" || t === "in-progress" || t === "progress") return "in_progress";

  const ru: Record<string, LeadStatus> = {
    новая: "new",
    новые: "new",
    новый: "new",
    "1._новые": "new",
    "1_новые": "new",
    в_работе: "in_progress",
    работе: "in_progress",
    работа: "in_progress",
    успех: "success",
    согласился: "success",
    согласен: "success",
    клиент: "success",
    отказ: "rejected",
    отклонено: "rejected",
    отклонен: "rejected",
    нет: "rejected",
  };
  if (ru[t]) return ru[t];

  return "new";
}

function normalizeContactType(raw: string): "telegram" | "whatsapp" {
  const t = raw.trim().toLowerCase();
  if (t === "whatsapp" || t === "wa") return "whatsapp";
  return "telegram";
}

/** Строки листа начиная с A2 (без заголовка). */
export function parseSheetRows(values: string[][]): LeadRow[] {
  const out: LeadRow[] = [];
  for (const row of values) {
    const idCell = row[0];
    if (idCell === undefined || idCell === "") continue;
    const id = Number(String(idCell).trim());
    if (!Number.isInteger(id) || id < 1) continue;

    const name = String(row[1] ?? "").trim() || "—";
    const email = String(row[2] ?? "").trim() || "—";
    const contact_type = normalizeContactType(String(row[3] ?? "telegram"));
    const contact = String(row[4] ?? "").trim() || "—";
    const messageRaw = row[5];
    const message =
      messageRaw === undefined || messageRaw === "" ? null : String(messageRaw);
    const status = normalizeStatus(String(row[6] ?? "new"));
    const created_at = String(row[7] ?? "").trim() || new Date().toISOString();
    const updated_at = String(row[8] ?? "").trim() || created_at;

    out.push({
      id,
      name,
      email,
      contact_type,
      contact,
      message,
      status,
      created_at,
      updated_at,
    });
  }
  return out;
}

export function buildBoard(leads: LeadRow[], limit: number): BoardResponse {
  const cap = Math.min(Math.max(limit, 1), 5000);
  const sorted = [...leads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const board: BoardResponse = {
    new: [],
    in_progress: [],
    success: [],
    rejected: [],
  };

  let count = 0;
  for (const lead of sorted) {
    if (count >= cap) break;
    const st = STATUSES.includes(lead.status) ? lead.status : "new";
    board[st].push(st === lead.status ? lead : { ...lead, status: st });
    count++;
  }
  return board;
}

export function nextLeadId(leads: LeadRow[]): number {
  if (leads.length === 0) return 1;
  return Math.max(...leads.map((l) => l.id)) + 1;
}
