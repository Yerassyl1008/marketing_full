/**
 * Публичные запросы к CRM идут через Next.js (тот же origin на Vercel).
 * Сервер проксирует на Render по CRM_API_URL — CORS к API не нужен.
 */
export const PUBLIC_LEADS_PROXY_BASE = "/api/public/leads";
