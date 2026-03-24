"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Hero() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const t = useTranslations("hero");

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDarkTheme(root.classList.contains("dark"));

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-w-0 max-w-full pb-8 sm:pb-12 sm:pt-6 lg:pb-14">
      <div className="mx-auto flex min-w-0 max-w-full flex-col-reverse gap-4 sm:gap-6 lg:flex-row lg:items-center">
        <div className="flex w-full justify-center lg:w-1/2 lg:flex-shrink-0">
          <Image
            src={
              isDarkTheme
                ? "/img/Mask group (1).png"
                : "/img/Mask group.png"
            }
            alt="hero"
            width={550}
            height={550}
            className="h-auto w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[450px]"
          />
        </div>

        <div className="w-full min-w-0 lg:w-1/2 lg:max-w-[36rem]">
          <h2 className="mb-2 text-[26px] font-extrabold leading-[1.15] sm:mb-3 sm:text-3xl sm:leading-tight lg:text-4xl">
            {t("title")}{" "}
            <span className="inline-block rounded-full bg-[var(--hero-span)] px-2 py-0.5 sm:py-0 lg:px-4">
              {t("span")}
            </span>
          </h2>
          <p className="mb-3 text-sm leading-snug text-[var(--design-text)] sm:mb-4 sm:text-base">{t("text")}</p>
          <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#acc2fd] px-4 py-2.5 text-base text-[var(--hero-button)] hover:bg-[#9fb8fc] sm:w-auto sm:px-5 sm:py-3 sm:text-lg lg:px-4 lg:text-base">
            <Image
              src="/svg/solar_calculator-broken.svg"
              alt="calculator"
              width={20}
              height={20}
            />
            {t("button")}
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-center sm:justify-end lg:absolute lg:bottom-4 lg:right-8 lg:mt-0">
        <div className="flex items-center gap-2">
          <Link
            href="#"
            aria-label="Instagram"
            className="grid place-items-center rounded-full text-[10px] text-white"
          >
            <Image
              src={
                isDarkTheme
                  ? "/svg/dark/Instagram_black%20(1).svg"
                  : "/svg/Instagram_black.svg"
              }
              alt="Instagram"
              width={30}
              height={30}
            />
          </Link>
          <Link
            href="#"
            aria-label="Telegram"
            className="grid place-items-center rounded-full text-[10px] text-white"
          >
            <Image
              src={
                isDarkTheme
                  ? "/svg/dark/Telegram_black%20(1).svg"
                  : "/svg/Telegram_black.svg"
              }
              alt="Telegram"
              width={30}
              height={30}
            />
          </Link>
          <Link
            href="#"
            aria-label="Viber"
            className="grid place-items-center rounded-full text-[10px] text-white"
          >
            <Image
              src={
                isDarkTheme
                  ? "/svg/dark/Viber_black%20(1).svg"
                  : "/svg/Viber_black.svg"
              }
              alt="Viber"
              width={30}
              height={30}
            />
          </Link>
          
        </div>
      </div>
    </section>
  );
}