/**
 * Публичный URL CRM API. На Vercel задай NEXT_PUBLIC_API_URL (например https://….onrender.com).
 * Без слеша в конце.
 */
export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = raw?.replace(/\/$/, "") || "http://localhost:8000";
  return base;
}
