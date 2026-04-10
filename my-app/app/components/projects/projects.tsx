"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const CARD_COUNT = 4;

function ProjectCard({
  size,
  project,
  t,
}: {
  size: "grid" | "carousel";
  project: { title: string; category: string; description: string; price: string };
  t: ReturnType<typeof useTranslations<"portfolio">>;
}) {
  const isGrid = size === "grid";

  return (
    <article
      className={
        isGrid
          ? "min-w-0 rounded-3xl bg-[var(--workers-bg)] shadow transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          : "w-full shrink-0 rounded-3xl bg-[var(--workers-bg)] shadow transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
      }
    >
      <div
        className={
          isGrid
            ? "relative h-36 w-full rounded-b-3xl rounded-t-3xl sm:h-40 lg:h-44"
            : "relative h-44 w-full rounded-b-3xl rounded-t-3xl"
        }
      >
        <Image
          src="/img/beautifull-caucasian-woman-with-curly-hair-smiles-isolated 1.png"
          alt={project.title}
          fill
          className="object-cover rounded-t-3xl"
        />
        <span
          className={
            isGrid
              ? "absolute right-1 top-0 max-w-[calc(100%-0.5rem)] -translate-y-1/2 truncate rounded-full bg-[#1e1e1e] px-1.5 py-0.5 text-[9px] font-semibold text-[#FDE3AC] sm:right-2 sm:px-3 sm:py-1 sm:text-xs lg:right-3 lg:px-4 lg:py-2 lg:text-sm"
              : "absolute right-2 top-0 max-w-[calc(100%-0.5rem)] -translate-y-1/2 truncate rounded-full bg-[#1e1e1e] px-3 py-1.5 text-xs font-semibold text-[#FDE3AC] lg:right-3 lg:px-4 lg:py-2 lg:text-sm"
          }
        >
          {project.category}
        </span>
      </div>

      <div className={isGrid ? "p-2.5 sm:p-4 lg:p-5" : "p-4 lg:p-5"}>
        <h3
          className={
            isGrid
              ? "mb-1 text-sm font-bold text-[var(--foreground)] sm:mb-2 sm:text-base lg:text-2xl"
              : "mb-2 text-base font-bold text-[var(--foreground)] lg:text-2xl"
          }
        >
          {project.title}
        </h3>
        <p
          className={
            isGrid
              ? "mb-3 line-clamp-3 text-xs font-medium leading-snug text-zinc-500 sm:mb-4 sm:line-clamp-none sm:text-sm sm:leading-relaxed lg:mb-5 lg:text-lg lg:leading-9"
              : "mb-4 text-sm leading-relaxed text-zinc-500 lg:mb-5 lg:text-lg lg:leading-9"
          }
        >
          {project.description}
        </p>

        <div
          className={
            isGrid
              ? "flex items-end justify-between gap-1.5 sm:gap-2"
              : "flex items-end justify-between gap-2"
          }
        >
          <div
            className={
              isGrid
                ? "flex min-w-0 max-w-[calc(100%-2.75rem)] flex-col gap-0 rounded-xl bg-[var(--projects-span-bg)] px-1.5 py-1 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2"
                : "flex min-w-0 flex-1 flex-wrap items-center gap-2 rounded-2xl bg-[var(--projects-span-bg)] px-4 py-2"
            }
          >
            <p
              className={
                isGrid
                  ? "text-[8px] leading-tight text-zinc-400 sm:text-sm"
                  : "text-sm text-zinc-400"
              }
            >
              {t("priceLabel")}
            </p>
            <p
              className={
                isGrid
                  ? "text-[11px] font-medium leading-tight text-[var(--foreground)] sm:text-xl lg:text-2xl"
                  : "text-xl font-medium text-[var(--foreground)] lg:text-2xl"
              }
            >
              {project.price}
            </p>
          </div>
          <button
            type="button"
            className={
              isGrid
                ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#acc2fd] shadow-sm transition-shadow hover:shadow-md min-[360px]:h-8 min-[360px]:w-8 sm:h-10 sm:w-10"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#acc2fd] shadow-sm transition-shadow hover:shadow-md"
            }
            aria-label={t("openProject")}
          >
            <Image
              src="/svg/arrow-up-right.svg"
              alt=""
              width={20}
              height={20}
              className={
                isGrid
                  ? "block h-2.5 w-2.5 shrink-0 object-contain min-[360px]:h-3 min-[360px]:w-3 sm:h-4 sm:w-4"
                  : "block h-4 w-4 shrink-0 object-contain"
              }
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const t = useTranslations("portfolio");
  const project = {
    title: t("items.silpo.title"),
    category: t("items.silpo.category"),
    description: t("items.silpo.description"),
    price: t("items.silpo.price"),
  };

  return (
    <section className="mt-8 min-w-0 px-4 py-6 lg:px-8 lg:py-8">
      <h2 className="text-3xl font-bold text-[var(--foreground)] lg:text-4xl">{t("title")}</h2>
      <div className="mb-6 flex items-center justify-center lg:mb-8 lg:justify-end">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full bg-[#f2d48c] px-5 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-[#ebc873] lg:inline-flex"
        >
          <span aria-hidden>↗</span>
          {t("allProjects")}
        </button>
      </div>

      <div className="relative w-full min-w-0">
        {/* Один адаптивный ряд карточек */}
        <div className="scrollbar-none overflow-x-auto pb-2 pt-1">
          <div className="flex gap-2 sm:gap-4">
            {Array.from({ length: CARD_COUNT }, (_, i) => (
              <ProjectCard key={`car-${i}`} size="carousel" project={project} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
