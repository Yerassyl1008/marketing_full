/** Токен от POST /auth/login CRM. Храним в localStorage (один origin, все вкладки); sessionStorage — миграция со старых сессий. */
export const ADMIN_ACCESS_TOKEN_KEY = "marketing-admin-access-token";
export const ADMIN_THEME_KEY = "marketing-admin-theme";

export function getAdminAccessToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const fromLocal = window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)?.trim();
    if (fromLocal) return fromLocal;
    const fromSession = window.sessionStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)?.trim();
    if (fromSession) {
      try {
        window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, fromSession);
      } catch {
        /* ignore */
      }
      return fromSession;
    }
  } catch {
    /* ignore */
  }
  return "";
}

export function setAdminAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
  window.sessionStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
}

export function clearAdminAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
