"use client";

import { useTranslations } from "next-intl";

const INFO_ITEM_IDS = [1, 2, 3, 4] as const;

export default function Info() {
  const t = useTranslations("info");

  return (
    <section className="mt-8 p-4 md:p-6">
      <h2 className="mb-6 text-center text-3xl font-bold text-[var(--design-title)] md:mb-10 md:text-4xl">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {INFO_ITEM_IDS.map((id) => (
          <article key={id} className="border-l border-zinc-500 pl-3 md:pl-4">
            <h3 className="mb-3 text-xl font-bold text-[var(--design-title)] md:text-2xl">
              {t(`items.${id}.title`)}
            </h3>
            <p className="text-base leading-7 text-[var(--design-title)] md:text-lg md:leading-8">
              {t(`items.${id}.body`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
