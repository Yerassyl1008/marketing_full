import { NextResponse } from "next/server";

import { getPublicApiBaseUrl } from "@/lib/public-api-url";

export const dynamic = "force-dynamic";

function crmBase(): string {
  const fromEnv = process.env.CRM_API_URL?.replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  return getPublicApiBaseUrl();
}

function isLocalhostUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** На Vercel (и любом облаке) localhost ≠ твой компьютер */
function vercelCrmHint(): string {
  if (process.env.VERCEL) {
    return (
      "Деплой на Vercel: в Environment Variables задай CRM_API_URL и NEXT_PUBLIC_API_URL на публичный HTTPS URL твоего CRM (Railway, Render, Fly и т.д.). " +
      "localhost и 127.0.0.1 с Vercel недоступны — это не твой ПК."
    );
  }
  return (
    "Локально: CRM (uvicorn) должен быть запущен, CRM_API_URL — на него (или host.docker.internal из Docker)."
  );
}

/** Кэш JWT от /auth/login (сервер Next), чтобы не логиниться на каждый клик */
let loginTokenCache: { token: string; at: number } | null = null;
const LOGIN_CACHE_MS = 25 * 60 * 1000;

async function resolveBearerToken(): Promise<string | null> {
  const fromEnv = process.env.CRM_API_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  if (loginTokenCache && Date.now() - loginTokenCache.at < LOGIN_CACHE_MS) {
    return loginTokenCache.token;
  }

  const email = process.env.CRM_ADMIN_EMAIL?.trim();
  const password = process.env.CRM_ADMIN_PASSWORD?.trim();
  if (!email || !password) return null;

  const CRM = crmBase();
  const res = await fetch(`${CRM}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) return null;

  loginTokenCache = { token: data.access_token, at: Date.now() };
  return data.access_token;
}

type AttemptResult = { url: string; method: string; status: number; body: string };

/**
 * Удаление лида: сервер Next ходит в CRM.
 * 1) DELETE /leads/{id} + Bearer (CRM_API_TOKEN или логин CRM_ADMIN_*)
 * 2) публичные URL (если в CRM поднят lead_router с delete)
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || Number.isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const CRM = crmBase();
  const failures: AttemptResult[] = [];

  try {
    const token = await resolveBearerToken();

    const attempts: Array<{
      url: string;
      method: string;
      body?: string;
      auth?: boolean;
    }> = [];

    if (token) {
      attempts.push({ url: `${CRM}/leads/${id}`, method: "DELETE", auth: true });
    }
    attempts.push(
      { url: `${CRM}/public/leads/delete/${id}`, method: "POST", body: "{}" },
      { url: `${CRM}/public/leads/delete/${id}`, method: "DELETE" },
      { url: `${CRM}/public/leads/${id}/delete`, method: "POST", body: "{}" },
      { url: `${CRM}/public/leads/${id}`, method: "DELETE" }
    );

    for (const a of attempts) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (a.auth && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(a.url, {
        method: a.method,
        headers,
        body: a.body,
        cache: "no-store",
      });

      const bodyText = await res.text();

      if (res.ok) {
        try {
          const json = JSON.parse(bodyText) as unknown;
          return NextResponse.json(json);
        } catch {
          return NextResponse.json({ message: bodyText || "Lead deleted" });
        }
      }

      failures.push({
        url: a.url,
        method: a.method,
        status: res.status,
        body: bodyText.slice(0, 500),
      });
    }

    const hasCreds =
      Boolean(process.env.CRM_API_TOKEN?.trim()) ||
      (Boolean(process.env.CRM_ADMIN_EMAIL?.trim()) &&
        Boolean(process.env.CRM_ADMIN_PASSWORD?.trim()));

    const hint502 = !hasCreds
      ? process.env.VERCEL
        ? "В Vercel → Settings → Environment Variables: CRM_ADMIN_EMAIL, CRM_ADMIN_PASSWORD или CRM_API_TOKEN."
        : "В my-app/.env.local: CRM_ADMIN_EMAIL, CRM_ADMIN_PASSWORD или CRM_API_TOKEN. Перезапусти dev."
      : !token
        ? `Логин в CRM не удалился (email/пароль, доступность ${CRM}). ${vercelCrmHint()}`
        : `Проверь DELETE /leads/{id} и существование лида. ${isLocalhostUrl(CRM) && process.env.VERCEL ? vercelCrmHint() : ""}`;

    const userMessage502 = !hasCreds
      ? "Нет доступа к CRM: в настройках сервера задай CRM_ADMIN_EMAIL и CRM_ADMIN_PASSWORD (или CRM_API_TOKEN)."
      : !token
        ? "Не удалось войти в CRM. Проверь логин/пароль. На Vercel адрес CRM должен быть публичным (https://…), не localhost."
        : "CRM не выполнил удаление. Возможно, заявки уже нет или сбой API.";

    return NextResponse.json(
      {
        error: "Delete failed — CRM отклонил все варианты запроса",
        userMessage: userMessage502,
        crm: CRM,
        hadAuth: hasCreds && Boolean(token),
        loginFailed:
          !process.env.CRM_API_TOKEN?.trim() &&
          Boolean(process.env.CRM_ADMIN_EMAIL) &&
          Boolean(process.env.CRM_ADMIN_PASSWORD) &&
          !token,
        attempts: failures,
        hint: hint502,
      },
      { status: 502 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "CRM недоступен с сервера Next",
        userMessage:
          process.env.VERCEL
            ? "Сервер сайта не достучался до CRM. В Vercel укажи CRM_API_URL с публичным https:// адресом API (не localhost)."
            : "Не удаётся связаться с CRM. Запусти API (uvicorn) и проверь CRM_API_URL.",
        crm: CRM,
        detail: message,
        hint: vercelCrmHint(),
      },
      { status: 503 }
    );
  }
}
