"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const FAQ_ITEM_IDS = [1, 2, 3, 4, 5, 6] as const;

export default function Faq() {
  const t = useTranslations("faq");
  const [openedIndex, setOpenedIndex] = useState(0);

  return (
    <section className="mt-8 p-2 md:p-6">
      <h2 className="mb-6 text-center text-3xl font-bold text-(var(--foreground)) md:mb-8 md:text-4xl">
        {t("title")}
      </h2>

      <div className="rounded-3xl  px-3 py-2 md:px-6 md:py-4">
        {FAQ_ITEM_IDS.map((id, index) => {
          const isOpen = openedIndex === index;

          return (
            <div
              key={id}
              className="border-b border-zinc-300 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpenedIndex((prev) => (prev === index ? -1 : index))}
                className="flex w-full items-center gap-3 py-3 text-left md:py-6"
                aria-expanded={isOpen}
              >
                <span className="w-4 text-xl text-(var(--foreground))" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
                <span className="text-xl font-medium text-(var(--foreground)) md:text-3xl">
                  {t(`items.${id}.question`)}
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] pb-4 md:pb-5" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden pl-7 pr-1">
                  <p className="max-w-3xl text-base font-medium leading-7 text-(var(--foreground)) md:text-lg md:leading-8">
                    {t(`items.${id}.answer`)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
