"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import AdminDashboardShell from "../admin-dashboard-shell";
import { ADMIN_ACCESS_TOKEN_KEY } from "@/lib/admin-auth";

const LOCALES = ["ru", "en", "fr", "ar", "de"] as const;

type ArticleItem = {
  id: string;
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

function authHeader(): HeadersInit {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)?.trim() : "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminArticlesPage() {
  const [items, setItems] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>("ru");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/articles", { headers: authHeader() });
      const data = (await res.json().catch(() => ({}))) as { items?: ArticleItem[]; detail?: string };
      if (!res.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Не удалось загрузить");
        setItems([]);
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError("Сеть недоступна");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setSlug("");
    setTitle("");
    setExcerpt("");
    setBody("");
    setPublished(true);
    setLocale("ru");
  }

  function startEdit(a: ArticleItem) {
    setEditingId(a.id);
    setLocale(a.locale);
    setSlug(a.slug);
    setTitle(a.title);
    setExcerpt(a.excerpt);
    setBody(a.body ?? "");
    setPublished(a.published);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Укажите заголовок");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/articles/${encodeURIComponent(editingId)}`, {
          method: "PATCH",
          headers: authHeader(),
          body: JSON.stringify({
            locale,
            slug: slug.trim() || undefined,
            title: title.trim(),
            excerpt: excerpt.trim(),
            body,
            published,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        if (!res.ok) {
          setError(typeof data.detail === "string" ? data.detail : "Ошибка сохранения");
          return;
        }
      } else {
        const res = await fetch("/api/admin/articles", {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({
            locale,
            slug: slug.trim() || undefined,
            title: title.trim(),
            excerpt: excerpt.trim(),
            body,
            published,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        if (!res.ok) {
          setError(typeof data.detail === "string" ? data.detail : "Ошибка создания");
          return;
        }
      }
      resetForm();
      await load();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить статью?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        setError(typeof data.detail === "string" ? data.detail : "Не удалось удалить");
        return;
      }
      if (editingId === id) resetForm();
      await load();
    } catch {
      setError("Сеть недоступна");
    }
  }

  return (
    <AdminDashboardShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Статьи</h1>
            <p className="mt-1 text-sm text-[var(--design-muted)]">
              Публикация на сайте: раздел «Блог». Сохранение в{" "}
              <code className="rounded bg-[var(--team-surface)] px-1">data/articles.json</code>.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-sm font-medium text-[var(--design-btn)] hover:underline"
          >
            Открыть блог →
          </Link>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-300/50 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[color:var(--foreground)]/10 bg-[var(--header-bg)] p-4 shadow-sm dark:border-white/10 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {editingId ? "Редактировать" : "Новая статья"}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[var(--foreground)]">Язык</span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--foreground)]/15 bg-[var(--card-input-bg)] px-3 py-2 text-[var(--foreground)]"
              >
                {LOCALES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[var(--foreground)]">
                Slug (URL, необязательно)
              </span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="из заголовка"
                className="w-full rounded-xl border border-[color:var(--foreground)]/15 bg-[var(--card-input-bg)] px-3 py-2 text-[var(--foreground)]"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--foreground)]">Заголовок</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-[color:var(--foreground)]/15 bg-[var(--card-input-bg)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--foreground)]">Краткое описание</span>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--foreground)]/15 bg-[var(--card-input-bg)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--foreground)]">Текст</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-[color:var(--foreground)]/15 bg-[var(--card-input-bg)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-[color:var(--foreground)]/30"
            />
            Опубликовано (видно в блоге)
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--design-btn)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] disabled:opacity-50"
            >
              {saving ? "…" : editingId ? "Сохранить" : "Добавить"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[color:var(--foreground)]/20 px-5 py-2.5 text-sm font-medium text-[var(--foreground)]"
              >
                Отмена
              </button>
            ) : null}
          </div>
        </form>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Все статьи</h2>
          {loading ? (
            <p className="text-sm text-[var(--design-muted)]">Загрузка…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--design-muted)]">Пока пусто</p>
          ) : (
            <ul className="space-y-2">
              {items.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-col gap-2 rounded-xl border border-[color:var(--foreground)]/10 bg-[var(--header-bg)] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--foreground)]">{a.title}</p>
                    <p className="truncate text-xs text-[var(--design-muted)]">
                      {a.locale.toUpperCase()} · /blog/{a.slug}
                      {!a.published ? " · черновик" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      className="rounded-lg bg-[var(--design-btn)]/30 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminDashboardShell>
  );
}
