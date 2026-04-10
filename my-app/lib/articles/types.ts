/** Поля статьи на одном языке. */
export type ArticleLocaleFields = {
  title: string;
  excerpt: string;
  body: string;
};

/**
 * Базовые title / excerpt / body — русский текст (единственный ввод в админке).
 * i18n — необязательные ручные переводы по коду локали (en, fr, …).
 */
export type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  i18n?: Partial<Record<string, Partial<ArticleLocaleFields>>>;
  /** @deprecated не используется; может остаться в старых JSON */
  locale?: string;
};
