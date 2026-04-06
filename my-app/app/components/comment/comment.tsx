"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const REVIEW_KEYS = ["first", "second"] as const;
const REVIEW_COUNT = REVIEW_KEYS.length;

function countFullCards(rowWidthPx: number, cardW: number, gap: number): number {
  if (rowWidthPx <= 0 || cardW <= 0) return 1;
  const row = (n: number) => (n > 0 ? n * cardW + (n - 1) * gap : 0);
  let n = Math.max(1, Math.floor((rowWidthPx + gap) / (cardW + gap)));
  while (n > 1 && row(n) > rowWidthPx + 0.5) {
    n -= 1;
  }
  return Math.max(1, n);
}

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
          ? "relative w-[clamp(260px,min(38vw,360px),360px)] shrink-0 rounded-3xl bg-[var(--team-surface)] p-6 shadow transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          : "relative min-w-0 rounded-3xl bg-[var(--team-surface)] p-4 shadow transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] sm:p-5 lg:p-6"
      }
    >
      <span
        className={
          strip
            ? "absolute right-4 top-0 max-w-none -translate-y-1/2 rounded-full bg-zinc-900 px-3 py-1 text-sm font-semibold text-[#f2d48c]"
            : "absolute right-3 top-3 max-w-[min(100%,9rem)] truncate rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-[#f2d48c] sm:right-4 sm:top-0 sm:max-w-none sm:-translate-y-1/2 sm:px-3 sm:py-1 sm:text-sm"
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
  const t = useTranslations("commentSection");

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(300);
  const [maxIndex, setMaxIndex] = useState(0);

  const updateLayout = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const vw = viewport.getBoundingClientRect().width;
    if (vw < 1) return;
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) return;

    const cardW = first.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;
    const s = cardW + gap;
    const visible = countFullCards(vw, cardW, gap);
    const max = Math.max(0, REVIEW_COUNT - visible);

    setStep(s);
    setMaxIndex(max);
    setIndex((i) => Math.min(i, max));
  }, []);

  useLayoutEffect(() => {
    updateLayout();
    const ro = new ResizeObserver(() => updateLayout());
    const el = viewportRef.current;
    if (el) ro.observe(el);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => updateLayout();
    mq.addEventListener("change", onMq);
    window.addEventListener("orientationchange", updateLayout);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onMq);
      window.removeEventListener("orientationchange", updateLayout);
    };
  }, [updateLayout]);

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(maxIndex, i + 1));

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  return (
    <section className="mt-8 min-w-0 px-2 py-6 lg:px-6 lg:py-8">
      <div className="relative w-full min-w-0">
        {/* Мобилка: 1 колонка; с sm — 2 в ряд */}
        <div className="grid grid-cols-1 gap-3 px-2 sm:grid-cols-2 sm:gap-4 lg:hidden">
          {REVIEW_KEYS.map((itemKey) => (
            <CommentReviewCard key={itemKey} itemKey={itemKey} variant="grid" />
          ))}
        </div>

        {/* Десктоп: карусель с кнопками, как workers */}
        <div className="hidden min-w-0 items-center gap-2 md:gap-3 lg:flex">
          <button
            type="button"
            aria-label={t("prevReview")}
            disabled={!canPrev}
            onClick={goPrev}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-800 shadow-md transition-all hover:shadow-lg disabled:pointer-events-none disabled:opacity-30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            ←
          </button>

          <div
            ref={viewportRef}
            className="min-w-0 flex-1 overflow-hidden pb-2 pt-4"
            role="region"
            aria-label={t("reviewsRegion")}
          >
            <div
              ref={trackRef}
              className="flex gap-4 transition-[transform] duration-300 ease-out will-change-transform"
              style={{ transform: `translate3d(-${index * step}px, 0, 0)` }}
            >
              {REVIEW_KEYS.map((itemKey) => (
                <CommentReviewCard key={itemKey} itemKey={itemKey} variant="carousel" />
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label={t("nextReview")}
            disabled={!canNext}
            onClick={goNext}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-800 shadow-md transition-all hover:shadow-lg disabled:pointer-events-none disabled:opacity-30 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
