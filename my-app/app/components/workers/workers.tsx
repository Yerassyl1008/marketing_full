"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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

export default function Workers() {
  const t = useTranslations("workers");
  const [desktopPage, setDesktopPage] = useState(0);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(6);
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

  const DESKTOP_PAGE_SIZE = 5;
  const desktopPageCount = Math.ceil(workers.length / DESKTOP_PAGE_SIZE);

  const desktopWorkers = useMemo(() => {
    const start = desktopPage * DESKTOP_PAGE_SIZE;
    return Array.from({ length: DESKTOP_PAGE_SIZE }, (_, index) => {
      const workerIndex = (start + index) % workers.length;
      return workers[workerIndex];
    });
  }, [desktopPage]);

  const mobileWorkers = workers.slice(0, mobileVisibleCount);
  const hasMoreMobileWorkers = mobileVisibleCount < workers.length;

  return (
    <section className="mt-6 px-3 py-6 md:px-6 md:py-8 lg:px-8">
      <h2 className="mb-6 text-center text-3xl font-extrabold text-[var(--workers-title)] md:mb-8 md:text-4xl">
        {t("title")}
      </h2>

      <div className="relative hidden lg:block">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {desktopWorkers.map((worker) => (
            <article
              key={worker.name}
              className="overflow-hidden rounded-2xl bg-[var(--workers-bg)] shadow-sm"
            >
              <div className="relative h-40 bg-zinc-200">
                <Image
                  src={worker.image}
                  alt={worker.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                  {worker.experience}
                </span>
              </div>

              <div className="flex min-h-26 flex-col bg-[var(--workers-bg)] p-4 pt-5">
                <div className="mt-auto">
                  <p className="text-sm leading-tight text-zinc-500">{worker.name}</p>
                  <div className="mt-1.5 flex items-end justify-between gap-2">
                    <p className="text-3xl leading-8 font-semibold text-[var(--workers-text)]">
                      {worker.role}
                    </p>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full bg-[#acc2fd] text-lg text-zinc-800"
                      aria-label={t("openProfile")}
                    >
                      ↗
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          aria-label={t("nextSlide")}
          onClick={() =>
            setDesktopPage((prev) => (prev + 1) % Math.max(desktopPageCount, 1))
          }
          className="absolute -right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-xl text-zinc-700 shadow"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:hidden">
        {mobileWorkers.map((worker) => (
          <article
            key={worker.name}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-[var(--workers-bg)] shadow-sm"
          >
            <div className="relative h-28 bg-zinc-200">
              <Image src={worker.image} alt={worker.name} fill className="object-cover object-top" />
              <span className="absolute right-2 top-2 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-semibold text-white">
                {worker.experience}
              </span>
            </div>
            <div className="flex min-h-26 flex-col bg-[var(--workers-bg)] p-3 pt-4">
              <div className="mt-auto">
                <p className="text-sm leading-tight text-zinc-500">{worker.name}</p>
                <div className="mt-1.5 flex items-end justify-between gap-2">
                  <p className="text-xl font-semibold text-[var(--workers-text)]">{worker.role}</p>
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#acc2fd] text-base text-zinc-800"
                    aria-label={t("openProfile")}
                  >
                    ↗
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {hasMoreMobileWorkers && (
        <div className="mt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileVisibleCount((prev) => Math.min(prev + 2, workers.length))}
            className="rounded-full bg-[#f5d58d] px-5 py-3 text-sm font-semibold text-zinc-800 shadow"
          >
            {t("showMore")}
          </button>
        </div>
      )}

      <div className="mt-6 hidden items-center justify-center gap-2 lg:flex">
        {Array.from({ length: desktopPageCount }).map((_, index) => (
          <span
            key={index}
            className={index === desktopPage ? "h-2.5 w-6 rounded-full bg-zinc-900" : "h-2.5 w-2.5 rounded-full bg-zinc-400"}
          />
        ))}
      </div>
    </section>
  );
}