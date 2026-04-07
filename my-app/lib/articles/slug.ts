/** URL-slug из заголовка (кириллица и латиница сохраняются). */
export function slugifyTitle(title: string): string {
  const s = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
  return s || "post";
}
