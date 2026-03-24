"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const CARD_COUNT = 4;

export default function Projects() {
  const t = useTranslations("portfolio");
  const project = {
    title: t("items.silpo.title"),
    category: t("items.silpo.category"),
    description: t("items.silpo.description"),
    price: t("items.silpo.price"),
  };

  return (
    <section className="mt-8 px-4 py-6 lg:px-8 lg:py-8">
      <h2 className="text-3xl font-bold text-zinc-800 lg:text-4xl">{t("title")}</h2>
      <div className="mb-6 flex items-center justify-center lg:mb-8 lg:justify-end">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full bg-[#f2d48c] px-5 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-[#ebc873] lg:inline-flex"
        >
          <span aria-hidden>↗</span>
          {t("allProjects")}
        </button>
      </div>

      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {Array.from({ length: CARD_COUNT }, (_, index) => (
            <article
              key={index}
              className="min-w-[260px] snap-start rounded-3xl bg-(var(--workers-bg)) shadow lg:min-w-0"
            >
              <div className="relative h-44 w-full  rounded-b-3xl rounded-t-3xl">
                <Image
                  src="/img/beautifull-caucasian-woman-with-curly-hair-smiles-isolated 1.png"
                  alt={project.title}
                  fill
                  className="object-cover rounded-t-3xl"
                />
                <span className="absolute right-2 top-0 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#1e1e1e] px-3 py-1.5 text-xs font-semibold  lg:right-3 lg:px-4 lg:py-2 lg:text-sm">
                  {project.category}
                </span>
              </div>

              <div className="p-4 lg:p-5">
                <h3 className="mb-2 text-xl font-bold text-[var(--foreground)] lg:text-2xl">
                  {project.title}
                </h3>
                <p className="mb-4 text-lg text-zinc-500 lg:mb-5 font-medium leading-9 ">
                  {project.description}
                </p>

                <div className="flex items-end justify-between gap-2">
                  <div className="flex items-center gap-2 rounded-2xlpx-4 py-2 bg-(var(--projects-span-bg))">
                    <p className="text-sm text-zinc-400 lg:text-sm">{t("priceLabel")}</p>
                    <p className="text-xl font-medium text-(var(--foreground)) lg:text-2xl">
                      {project.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="grid h-12 w-12 place-items-center rounded-full bg-[#9ab5f6] text-4xl text-zinc-800 lg:h-10 lg:w-10 lg:text-2xl"
                    aria-label={t("openProject")}
                  >
                    <span aria-hidden>↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          aria-label={t("prevSlide")}
          className="absolute -left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow lg:grid"
        >
          <span aria-hidden>←</span>
        </button>
        <button
          type="button"
          aria-label={t("nextSlide")}
          className="absolute -right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow lg:grid"
        >
          <span aria-hidden>→</span>
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="h-3 w-8 rounded-full bg-zinc-900" />
        <span className="h-3 w-3 rounded-full border-2 border-zinc-900" />
        <span className="h-3 w-3 rounded-full border-2 border-zinc-900" />
      </div>
    </section>
  );
}
