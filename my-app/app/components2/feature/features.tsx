"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const FEATURE_ITEM_IDS = [1, 2, 3, 4] as const;

export default function Features() {
  const t = useTranslations("features");
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDarkTheme(root.classList.contains("dark"));

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="mt-8 p-4 [--card-radius:1.25rem] [--card-pad:1rem] [--title-size:1.5rem] [--title-lh:2rem] [--text-size:1.0625rem] [--text-lh:1.65rem] [--icon-size:1.5rem] md:p-6 md:[--card-pad:1.125rem] md:[--title-size:1.375rem] md:[--title-lh:1.85rem] md:[--text-size:0.9375rem] md:[--text-lh:1.55rem] md:[--icon-size:1.75rem]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {FEATURE_ITEM_IDS.map((id) => (
          <article
            key={id}
            className="relative rounded-[var(--card-radius)] bg-[var(--background)] p-[var(--card-pad)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-[var(--design-text)]"
          >
            <span className="absolute right-3 top-0 -translate-y-1/2 rounded-full bg-zinc-900 px-3 py-1 text-sm font-semibold text-[#f5d58d] dark:bg-zinc-100 dark:text-zinc-900 text-[var(--design-accent)] ">
              {t(`items.${id}.badge`)}
            </span>

            <div className="mb-4">
              <Image
                src={isDarkTheme ? "/svg/graph-dark.svg" : "/svg/graph.svg"}
                alt={t("iconAlt")}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>

            <h3 className="font-['Manrope'] text-[length:var(--title-size)] font-bold leading-[var(--title-lh)] text-[var(--design-title)]">
              {t(`items.${id}.title`)}
            </h3>
            <p className="text-[length:var(--text-size)] leading-[var(--text-lh)] text-[var(--design-title)]">
              {t(`items.${id}.description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
