/**
 * Однократный импорт статей из my-app/data/articles.json в CRM SQLite.
 * Запуск из корня репозитория: node servers/google-sheets-crm/scripts/seed-articles-from-json.mjs
 *
 * Путь к JSON: первый аргумент или my-app/data/articles.json рядом с marketing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..", "..");
const jsonPath = process.argv[2] || path.join(root, "my-app", "data", "articles.json");
const sqlitePath =
  process.env.ARTICLES_SQLITE_PATH?.trim() ||
  path.join(__dirname, "..", "data", "articles.sqlite");

if (!fs.existsSync(jsonPath)) {
  console.error("Нет файла:", jsonPath);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
if (!Array.isArray(raw)) {
  console.error("Ожидался массив статей");
  process.exit(1);
}

const dir = path.dirname(sqlitePath);
fs.mkdirSync(dir, { recursive: true });
const db = new Database(sqlitePath);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    i18n_json TEXT
  );
`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO articles (id, slug, title, excerpt, body, published, created_at, updated_at, i18n_json)
  VALUES (@id, @slug, @title, @excerpt, @body, @published, @created_at, @updated_at, @i18n_json)
`);

let n = 0;
for (const a of raw) {
  if (!a || typeof a.id !== "string" || typeof a.slug !== "string") continue;
  insert.run({
    id: a.id,
    slug: a.slug,
    title: String(a.title ?? ""),
    excerpt: String(a.excerpt ?? ""),
    body: String(a.body ?? ""),
    published: a.published ? 1 : 0,
    created_at: String(a.createdAt ?? new Date().toISOString()),
    updated_at: String(a.updatedAt ?? new Date().toISOString()),
    i18n_json: a.i18n ? JSON.stringify(a.i18n) : null,
  });
  n += 1;
}

console.info("Импортировано статей:", n, "→", sqlitePath);
db.close();
