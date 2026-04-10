import { routing } from "@/i18n/routing";

import { isArticleMachineTranslateEnabled, machineTranslateText } from "./machine-translate";
import type { ArticleRecord } from "./types";

function isSupportedLocale(loc: string): boolean {
  return (routing.locales as readonly string[]).includes(loc);
}

async function pickField(
  ru: string,
  manual: string | undefined,
  locale: string,
): Promise<string> {
  if (manual !== undefined && manual.trim() !== "") return manual.trim();
  if (locale === "ru" || !isSupportedLocale(locale)) return ru;
  if (!isArticleMachineTranslateEnabled() || !ru.trim()) return ru;
  return machineTranslateText(ru, locale);
}

/**
 * Текст для отображения на сайте: ручной перевод из i18n, иначе автоперевод (если включён), иначе русский.
 */
export async function resolveArticleForLocale(
  article: ArticleRecord,
  locale: string,
): Promise<{ title: string; excerpt: string; body: string }> {
  const loc = locale.toLowerCase().slice(0, 8);
  const pack = article.i18n?.[loc];

  const [title, excerpt, body] = await Promise.all([
    pickField(article.title, pack?.title, loc),
    pickField(article.excerpt, pack?.excerpt, loc),
    pickField(article.body, pack?.body, loc),
  ]);

  return { title, excerpt, body };
}
