import { getPublicApiBaseUrl } from "@/lib/public-api-url";

/** URL CRM на стороне Next (Vercel): серверные переменные, без CORS в браузере. */
export function getCrmServerBaseUrl(): string {
  const fromEnv = process.env.CRM_API_URL?.replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  return getPublicApiBaseUrl();
}

export function isLocalhostUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function vercelCrmHint(): string {
  if (process.env.VERCEL) {
    return (
      "В Vercel → Environment Variables задай CRM_API_URL=https://… (публичный HTTPS Render). localhost с Vercel недоступен."
    );
  }
  return "Локально: CRM должен быть запущен, CRM_API_URL — на него.";
}
