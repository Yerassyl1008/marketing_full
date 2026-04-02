"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const workerDefs = [
  {
    id: "anastasia",
    image: "/img/workers/beautifull-caucasian-woman-with-curly-hair-smiles-isolated 1.jpg",
  },
  {
    id: "alexey",
    image: "/img/workers/man-with-curly-hair-smiles-isolated 1.jpg",
  },
  {
    id: "maria",
    image: "/img/workers/beautifuan-woman-with-curly-hair-smiles-isolated 1.jpg",
  },
  {
    id: "arina",
    image: "/img/workers/dawda.jpg",
  },
  {
    id: "vyacheslav",
    image: "/img/workers/beautifull-caucasiany-hair-smiles-isolated 1.jpg",
  },
  {
    id: "ivan",
    image: "/img/workers/man-with-curly-hair-smiles-isolated 1.jpg",
  },
  {
    id: "elizaveta",
    image: "/img/workers/beautifuan-woman-with-curly-hair-smiles-isolated 1.jpg",
  },
];

function countFullCards(rowWidthPx: number, cardW: number, gap: number): number {
  if (rowWidthPx <= 0 || cardW <= 0) return 1;
  const row = (n: number) => (n > 0 ? n * cardW + (n - 1) * gap : 0);
  let n = Math.max(1, Math.floor((rowWidthPx + gap) / (cardW + gap)));
  while (n > 1 && row(n) > rowWidthPx + 0.5) {
    n -= 1;
  }
  return Math.max(1, n);
}

type WorkerItem = {
  id: string;
  image: string;
  name: string;
  role: string;
  experience: string;
};

function WorkerCard({
  worker,
  className,
  imageSizes,
  compact = false,
}: {
  worker: WorkerItem;
  className: string;
  imageSizes: string;
  /** Узкая сетка 2×N (мобилка до ~1024px): мельче типографика. */
  compact?: boolean;
}) {
  const t = useTranslations("workers");
  const photoShell = compact
    ? "relative min-h-0 flex-[2] overflow-hidden bg-[var(--workers-bg)] rounded-t-[1rem] rounded-b-[0.85rem] min-[360px]:rounded-b-[0.95rem] sm:rounded-b-[1rem]"
    : "relative min-h-0 flex-[2] overflow-hidden bg-[var(--workers-bg)] rounded-t-[1.25rem] rounded-b-[1rem] sm:rounded-b-[1.1rem]";

  return (
    <article className={className}>
      <div className={photoShell}>
        <Image
          src={worker.image}
          alt={worker.name}
          fill
          sizes={imageSizes}
          className="object-cover object-top"
        />
        <span
          className={
            compact
              ? "absolute right-1 top-1 z-[1] rounded-full bg-zinc-900 px-1.5 py-0.5 text-[8px] font-semibold leading-none text-white min-[360px]:right-2 min-[360px]:top-2 min-[360px]:text-[9px] sm:text-[10px]"
              : "absolute right-2 top-2 z-[1] rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white sm:right-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs"
          }
        >
          {worker.experience}
        </span>
      </div>

      <div
        className={
          compact
            ? "flex min-h-0 flex-[1] flex-col justify-end bg-[var(--workers-bg)] px-1.5 pb-2 pt-1 min-[360px]:px-2 sm:px-2.5 sm:pb-2.5"
            : "flex min-h-0 flex-[1] flex-col justify-end bg-[var(--workers-bg)] px-3 pb-3 pt-1 sm:px-3.5 sm:pb-3.5"
        }
      >
        <div
          className={
            compact
              ? "flex min-h-[2.75rem] items-center justify-between gap-2 min-[360px]:min-h-12 sm:min-h-14"
              : "flex min-h-[3.25rem] items-center justify-between gap-3 sm:min-h-16"
          }
        >
          <div className="min-w-0 flex-1">
            <p
              className={
                compact
                  ? "text-[9px] leading-tight text-zinc-500 min-[360px]:text-[10px] sm:text-[11px]"
                  : "text-[11px] leading-tight text-zinc-500 sm:text-xs"
              }
            >
              {worker.name}
            </p>
            <p
              className={
                compact
                  ? "mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-[var(--workers-text)] min-[360px]:text-xs min-[400px]:text-sm sm:text-base"
                  : "mt-0.5 line-clamp-2 text-base font-semibold leading-tight text-[var(--workers-text)] sm:text-lg md:text-xl"
              }
            >
              {worker.role}
            </p>
          </div>
          <button
            type="button"
            className={
              compact
                ? "grid h-6 w-6 shrink-0 place-items-center self-center rounded-full bg-[#acc2fd] text-xs text-zinc-800 transition-shadow hover:shadow-md min-[360px]:h-7 min-[360px]:w-7"
                : "grid h-7 w-7 shrink-0 place-items-center self-center rounded-full bg-[#acc2fd] text-sm text-zinc-800 transition-shadow hover:shadow-md sm:h-8 sm:w-8 sm:text-base"
            }
            aria-label={t("openProfile")}
          >
            ↗
          </button>
        </div>
      </div>
    </article>
  );
}

/** Мобильные: 2 колонки, карточка на всю ячейку (вплоть до ~320px экрана). */
const CARD_MOBILE =
  "flex aspect-square w-full min-w-0 flex-col overflow-hidden rounded-[1.05rem] border border-zinc-200/80 bg-[var(--workers-bg)] shadow-sm transition-all duration-300 ease-out will-change-transform hover:z-[1] hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:border-zinc-600/50 dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] min-[360px]:rounded-[1.1rem] sm:rounded-[1.15rem]";

/** Десктоп — карусель. */
const CARD_DESKTOP =
  "flex aspect-square w-[clamp(200px,min(72vw,260px),260px)] max-w-[260px] shrink-0 flex-col overflow-hidden rounded-[1.25rem] border border-zinc-200/80 bg-[var(--workers-bg)] shadow-sm transition-all duration-300 ease-out will-change-transform hover:z-[1] hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:border-zinc-600/50 dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]";

export default function Workers() {
  const t = useTranslations("workers");
  const workers = useMemo(
    () =>
      workerDefs.map((worker) => ({
        ...worker,
        name: t(`items.${worker.id}.name`),
        role: t(`items.${worker.id}.role`),
        experience: t(`items.${worker.id}.experience`),
      })),
    [t]
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(276);
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
    const max = Math.max(0, workers.length - visible);

    setStep(s);
    setMaxIndex(max);
    setIndex((i) => Math.min(i, max));
  }, [workers.length]);

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
    <section className="mt-6 py-6 md:py-8">
      <h2 className="mb-6 px-3 text-center text-3xl font-extrabold text-[var(--workers-title)] md:mb-8 md:px-6 md:text-4xl lg:px-8">
        {t("title")}
      </h2>

      {/* До lg: сетка 2 колонки, адаптив от узких экранов (~320px+) */}
      <div className="mx-auto grid w-full max-w-[min(100%,42rem)] grid-cols-2 gap-2 px-2 min-[360px]:gap-3 min-[360px]:px-3 sm:gap-4 md:px-6 lg:hidden">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            className={CARD_MOBILE}
            compact
            imageSizes="(max-width: 1023px) 50vw, 260px"
          />
        ))}
      </div>

      {/* Десктоп: карусель */}
      <div className="hidden min-w-0 items-center gap-2 px-3 md:gap-3 md:px-6 lg:flex lg:px-8">
        <button
          type="button"
          aria-label={t("prevSlide")}
          disabled={!canPrev}
          onClick={goPrev}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-800 shadow-md transition-all hover:shadow-lg disabled:pointer-events-none disabled:opacity-30"
        >
          ←
        </button>

        <div
          ref={viewportRef}
          className="min-w-0 flex-1 overflow-hidden pb-2 pt-1"
          role="region"
          aria-label={t("title")}
        >
          <div
            ref={trackRef}
            className="flex gap-4 transition-[transform] duration-300 ease-out will-change-transform"
            style={{ transform: `translate3d(-${index * step}px, 0, 0)` }}
          >
            {workers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                className={CARD_DESKTOP}
                imageSizes="(max-width: 1280px) 260px, 280px"
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label={t("nextSlide")}
          disabled={!canNext}
          onClick={goNext}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-800 shadow-md transition-all hover:shadow-lg disabled:pointer-events-none disabled:opacity-30"
        >
          →
        </button>
      </div>
    </section>
  );
}
