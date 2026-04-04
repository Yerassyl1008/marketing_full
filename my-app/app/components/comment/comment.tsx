import { useTranslations } from "next-intl";

export default function Comment() {
  const t = useTranslations("commentSection");

  return (
    <section className="mt-8 min-w-0 px-2 py-6 lg:px-6 lg:py-8">
      <div className="relative w-full min-w-0">
        <div className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto  pb-2 pt-4 px-2 overflow-y-visible pb-2 overscroll-x-contain lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
          {["first", "second"].map((itemKey) => (
            <article
              key={itemKey}
              className="relative min-w-full shrink-0 snap-start rounded-3xl bg-[var(--team-surface)] p-4 shadow transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] lg:min-w-0 lg:shrink lg:p-6"
            >
              <span className="absolute right-3 top-3 translate-y-0 rounded-full bg-zinc-900 px-3 py-1 text-sm font-semibold text-[#f2d48c] lg:right-4 lg:top-0 lg:-translate-y-1/2">
                {t(`items.${itemKey}.badge`)}
              </span>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-zinc-300" />
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)] lg:text-base">
                    {t(`items.${itemKey}.name`)}
                  </p>
                  <p className="text-base text-[var(--foreground)] lg:text-sm">
                    {t(`items.${itemKey}.subtitle`)}
                  </p>
                </div>
              </div>

              <h3 className="mb-2 text-xl font-bold text-[var(--foreground)] lg:text-2xl">
                {t(`items.${itemKey}.title`)}
              </h3>
              <p className="text-base font-medium leading-relaxed text-[var(--foreground)] lg:text-lg lg:leading-relaxed">
                {t(`items.${itemKey}.body`)}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-3xl font-bold text-[var(--foreground)] lg:text-4xl">
                  {t(`items.${itemKey}.rating`)}
                </span>
                <span className="text-2xl text-[#f2d48c] lg:text-3xl">★ ★ ★ ★ ★</span>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          aria-label={t("prevReview")}
          className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow lg:grid"
        >
          ←
        </button>
        <button
          type="button"
          aria-label={t("nextReview")}
          className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow lg:grid"
        >
          →
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