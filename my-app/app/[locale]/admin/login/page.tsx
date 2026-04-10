"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getAdminAccessToken, setAdminAccessToken, ADMIN_THEME_KEY } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const t = useTranslations("adminLogin");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    try {
      if (getAdminAccessToken()) {
        router.replace("/admin");
      }
    } catch {
      /* ignore */
    }
  }, [router]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADMIN_THEME_KEY);
      if (saved === "dark") setIsDark(true);
      else if (saved === "light") setIsDark(false);
      else setIsDark(document.documentElement.classList.contains("dark"));
    } catch {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.classList.toggle("dark", isDark);
    try {
      window.localStorage.setItem(ADMIN_THEME_KEY, isDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [isDark, themeReady]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    if (!email.trim() || !password.trim()) {
      setError(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        detail?: unknown;
      };
      if (!res.ok || !data.access_token) {
        setError(true);
        return;
      }
      try {
        setAdminAccessToken(data.access_token);
      } catch {
        setError(true);
        return;
      }
      router.replace("/admin");
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[var(--design-btn)]/15 blur-3xl dark:bg-[var(--design-btn)]/20" />
        <div className="absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-[var(--design-accent)]/20 blur-3xl dark:bg-[var(--design-accent)]/10" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/main-page"
            className="text-sm font-medium text-[var(--design-muted)] transition-colors hover:text-[var(--foreground)]"
          >
            ← {t("backToSite")}
          </Link>
          <button
            type="button"
            onClick={() => setIsDark((v) => !v)}
            className={`relative flex h-10 w-20 items-center rounded-full p-1 transition-colors ${
              isDark ? "bg-indigo-300" : "bg-amber-200"
            }`}
            aria-label={isDark ? t("themeDark") : t("themeLight")}
            aria-pressed={isDark}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-lg transition-all duration-300 ${
                isDark
                  ? "translate-x-10 bg-zinc-900 text-indigo-300"
                  : "translate-x-0 bg-zinc-900 text-amber-200"
              }`}
            >
              {isDark ? "☾" : "☼"}
            </span>
          </button>
        </header>

        <main className="flex flex-1 flex-col justify-center">
          <div className="rounded-3xl border border-[color:var(--foreground)]/10 bg-[var(--header-bg)] p-6 shadow-sm sm:p-8 dark:border-white/10">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--design-muted)]">
                Marketing
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
                {t("title")}
              </h1>
              <p className="mt-2 text-sm text-[var(--design-muted)]">{t("subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  {t("email")}
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-2xl border border-[color:var(--foreground)]/12 bg-[var(--card-input-bg)] px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--design-muted)] focus:border-[var(--design-btn)] focus:ring-2 focus:ring-[var(--design-btn)]/30 disabled:opacity-60 dark:border-white/10"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  {t("password")}
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-2xl border border-[color:var(--foreground)]/12 bg-[var(--card-input-bg)] px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--design-muted)] focus:border-[var(--design-btn)] focus:ring-2 focus:ring-[var(--design-btn)]/30 disabled:opacity-60 dark:border-white/10"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {t("error")}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-[var(--design-btn)] px-4 py-3 text-base font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--design-btn-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--design-btn)] disabled:opacity-60"
              >
                {submitting ? "…" : t("submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[var(--design-muted)]">{t("hint")}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
