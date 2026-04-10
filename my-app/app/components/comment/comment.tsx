"use client";

import { useTranslations } from "next-intl";

const REVIEW_KEYS = ["first", "second"] as const;

function CommentReviewCard({
  itemKey,
  variant,
}: {
  itemKey: (typeof REVIEW_KEYS)[number];
  variant: "grid" | "carousel";
}) {
  const t = useTranslations("commentSection");
  const strip = variant === "carousel";

  return (
    <article
      className={
        strip
          ? "relative w-full shrink-0 rounded-3xl bg-[var(--team-surface)] p-4 shadow transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] sm:w-[calc((100%-1rem)/2)] sm:p-5 lg:p-6"
          : "relative min-w-0 rounded-3xl bg-[var(--team-surface)] p-4 shadow transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] sm:p-5 lg:p-6"
      }
    >
      <span
        className={
          strip
            ? "hidden sm:block absolute right-4 top-0 max-w-none -translate-y-1/2 rounded-full bg-zinc-900 px-3 py-1 text-sm font-semibold text-[#f2d48c]"
            : "hidden sm:block absolute right-3 top-3 max-w-[min(100%,9rem)] truncate rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-[#f2d48c] sm:right-4 sm:top-0 sm:max-w-none sm:-translate-y-1/2 sm:px-3 sm:py-1 sm:text-sm"
        }
      >
        {t(`items.${itemKey}.badge`)}
      </span>

      <div className={strip ? "mb-4 flex min-w-0 items-center gap-3" : "mb-3 flex min-w-0 items-center gap-2 sm:mb-4 sm:gap-3"}>
        <div
          className={
            strip
              ? "h-16 w-16 shrink-0 rounded-full bg-zinc-300"
              : "h-12 w-12 shrink-0 rounded-full bg-zinc-300 sm:h-16 sm:w-16"
          }
        />
        <div className="min-w-0">
          <p
            className={
              strip
                ? "text-lg font-semibold text-[var(--foreground)] lg:text-base"
                : "truncate text-sm font-semibold text-[var(--foreground)] sm:text-lg lg:text-base"
            }
          >
            {t(`items.${itemKey}.name`)}
          </p>
          <p
            className={
              strip
                ? "text-base text-[var(--foreground)] lg:text-sm"
                : "truncate text-xs text-[var(--foreground)] sm:text-base lg:text-sm"
            }
          >
            {t(`items.${itemKey}.subtitle`)}
          </p>
        </div>
      </div>

      <h3
        className={
          strip
            ? "mb-2 text-xl font-bold text-[var(--foreground)] lg:text-2xl"
            : "mb-2 text-base font-bold leading-snug text-[var(--foreground)] sm:text-xl lg:text-2xl"
        }
      >
        {t(`items.${itemKey}.title`)}
      </h3>
      <p
        className={
          strip
            ? "text-base font-medium leading-relaxed text-[var(--foreground)] lg:text-lg lg:leading-relaxed"
            : "line-clamp-4 text-xs font-medium leading-relaxed text-[var(--foreground)] sm:line-clamp-none sm:text-base lg:text-lg lg:leading-relaxed"
        }
      >
        {t(`items.${itemKey}.body`)}
      </p>

      <div className={strip ? "mt-4 flex items-center gap-2" : "mt-3 flex flex-wrap items-center gap-1 sm:mt-4 sm:gap-2"}>
        <span
          className={
            strip
              ? "text-3xl font-bold text-[var(--foreground)] lg:text-4xl"
              : "text-xl font-bold text-[var(--foreground)] sm:text-3xl lg:text-4xl"
          }
        >
          {t(`items.${itemKey}.rating`)}
        </span>
        <span
          className={
            strip ? "text-2xl text-[#f2d48c] lg:text-3xl" : "text-sm text-[#f2d48c] sm:text-2xl lg:text-3xl"
          }
        >
          ★ ★ ★ ★ ★
        </span>
      </div>
    </article>
  );
}

export default function Comment() {
  useTranslations("commentSection");

  return (
    <section className="mt-8 min-w-0 px-2 py-6 lg:px-6 lg:py-8">
      <div className="relative w-full min-w-0">
        {/* Один адаптивный ряд карточек */}
        <div className="scrollbar-none overflow-x-auto pb-2 pt-2 sm:pt-4">
          <div className="flex gap-2 sm:gap-4">
            {REVIEW_KEYS.map((itemKey) => (
              <CommentReviewCard key={itemKey} itemKey={itemKey} variant="carousel" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
