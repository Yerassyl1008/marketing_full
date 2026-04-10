import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { BoardResponse, LeadRow, LeadStatus } from "./types.js";
import { STATUSES } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.join(__dirname, "..", "data", "leads.sqlite");

export function openDb(filePath = process.env.SQLITE_PATH?.trim() || defaultPath): Database.Database {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      contact_type TEXT NOT NULL CHECK (contact_type IN ('telegram', 'whatsapp')),
      contact TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'success', 'rejected')) DEFAULT 'new',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  `);
  return db;
}

function rowToLead(r: Record<string, unknown>): LeadRow {
  return {
    id: r.id as number,
    name: r.name as string,
    email: r.email as string,
    contact_type: r.contact_type as "telegram" | "whatsapp",
    contact: r.contact as string,
    message: (r.message as string | null) ?? null,
    status: r.status as LeadStatus,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  };
}

export function insertLead(
  db: Database.Database,
  data: {
    name: string;
    email: string;
    contact_type: "telegram" | "whatsapp";
    contact: string;
    message: string | null;
  }
): LeadRow {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO leads (name, email, contact_type, contact, message, status, created_at, updated_at)
    VALUES (@name, @email, @contact_type, @contact, @message, 'new', @created_at, @updated_at)
  `);
  const info = stmt.run({
    ...data,
    created_at: now,
    updated_at: now,
  });
  const id = Number(info.lastInsertRowid);
  return getLeadById(db, id)!;
}

export function getLeadById(db: Database.Database, id: number): LeadRow | null {
  const r = db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return r ? rowToLead(r) : null;
}

/** Список лидов для защищённого GET /leads (как в FastAPI CRM). */
export function listLeadsDesc(db: Database.Database, limit: number): LeadRow[] {
  const cap = Math.min(Math.max(limit, 1), 5000);
  const rows = db
    .prepare(`SELECT * FROM leads ORDER BY datetime(created_at) DESC LIMIT ?`)
    .all(cap) as Record<string, unknown>[];
  return rows.map((r) => rowToLead(r));
}

export function getBoard(db: Database.Database, limit = 1000): BoardResponse {
  const board: BoardResponse = {
    new: [],
    in_progress: [],
    success: [],
    rejected: [],
  };
  const rows = db
    .prepare(
      `SELECT * FROM leads ORDER BY datetime(created_at) DESC LIMIT ?`
    )
    .all(Math.min(Math.max(limit, 1), 5000)) as Record<string, unknown>[];

  for (const r of rows) {
    const lead = rowToLead(r);
    if (STATUSES.includes(lead.status)) {
      board[lead.status].push(lead);
    }
  }
  return board;
}

export function updateLeadStatus(db: Database.Database, id: number, status: LeadStatus): LeadRow | null {
  const now = new Date().toISOString();
  const info = db.prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ?").run(status, now, id);
  if (info.changes === 0) return null;
  return getLeadById(db, id);
}

export function updateLeadFields(
  db: Database.Database,
  id: number,
  patch: Partial<{
    name: string;
    email: string;
    contact_type: "telegram" | "whatsapp";
    contact: string;
    message: string | null;
    status: LeadStatus;
  }>
): LeadRow | null {
  const current = getLeadById(db, id);
  if (!current) return null;
  const next = {
    name: patch.name ?? current.name,
    email: patch.email ?? current.email,
    contact_type: patch.contact_type ?? current.contact_type,
    contact: patch.contact ?? current.contact,
    message: patch.message !== undefined ? patch.message : current.message,
    status: patch.status ?? current.status,
  };
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE leads SET name = ?, email = ?, contact_type = ?, contact = ?, message = ?, status = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    next.name,
    next.email,
    next.contact_type,
    next.contact,
    next.message,
    next.status,
    now,
    id
  );
  return getLeadById(db, id);
}

export function deleteLead(db: Database.Database, id: number): boolean {
  const info = db.prepare("DELETE FROM leads WHERE id = ?").run(id);
  return info.changes > 0;
}
