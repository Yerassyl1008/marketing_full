import { getCrmServerBaseUrl, isLocalhostUrl, vercelCrmHint } from "@/lib/crm-server";

/**
 * Проверка сессии админа: тот же JWT, что после логина в CRM.
 * Используется защищённый эндпоинт GET /leads?limit=1.
 */
export async function verifyAdminBearerToken(
  token: string,
): Promise<{ ok: true } | { ok: false; reason: string; detail?: string }> {
  const t = token.trim();
  if (!t) return { ok: false, reason: "missing_token" };

  const crm = getCrmServerBaseUrl();
  if (isLocalhostUrl(crm) && process.env.VERCEL) {
    return { ok: false, reason: "crm_unreachable", detail: vercelCrmHint() };
  }

  try {
    const res = await fetch(`${crm}/leads?limit=1`, {
      headers: { Authorization: `Bearer ${t}` },
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    return { ok: false, reason: res.status === 401 ? "unauthorized" : "crm_error" };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: "fetch_failed", detail: message };
  }
}

export function getBearerToken(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const v = h.slice(7).trim();
  return v || null;
}
