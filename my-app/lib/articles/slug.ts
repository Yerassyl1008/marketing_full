/** Сегмент пути из URL и slug в JSON — в одном виде (decode %D0…, NFC). */
export function normalizeArticleSlugSegment(raw: string): string {
  try {
    return decodeURIComponent(raw).normalize("NFC").trim();
  } catch {
    return raw.normalize("NFC").trim();
  }
}

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
