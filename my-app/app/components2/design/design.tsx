"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSocialIconSrc } from "@/lib/social-icons";

export default function Design() {
  const t = useTranslations("design");
  const icons = useSocialIconSrc();

  return (
    <section className="relative pb-12 pt-6 md:pb-16">
      <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:gap-8">
        <div className="flex w-full justify-start md:w-[40%] md:flex-shrink-0">
          <Image
            src="/img/beautifull-caucasian-woman-with-curly-hair-smiles-isolated 1 (2) 1.png"
            alt={t("imageAlt")}
            width={600}
            height={600}
            className="h-auto w-full max-w-[360px] md:max-w-[500px]"
          />
        </div>

        <div className="w-full min-w-0 md:w-[46%] md:max-w-[800px]">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[var(--design-muted)]">
            <span aria-hidden>⌂</span>
            <span aria-hidden>›</span>
            <span>{t("breadcrumbTeam")}</span>
            <span aria-hidden>›</span>
            <span className="font-semibold text-[var(--foreground)]">
              {t("breadcrumbName")}
            </span>
          </div>

          <h2 className="mb-3 text-3xl font-extrabold leading-[1.15] text-[var(--foreground)] sm:text-4xl lg:text-5xl">
            <span className="inline-block whitespace-nowrap rounded-full bg-[var(--hero-span)] py-1 pl-3 pr-4 text-[var(--design-title)] -ml-3 sm:pl-4 sm:pr-4 sm:-ml-4">
              {t("titleHighlight")}
            </span>
            <br />
            {t("titleSecondLine")}
          </h2>

          <p className="mb-5 max-w-[520px] text-sm leading-6 text-[var(--design-text)] md:text-base">
            {t("description")}
          </p>

          <Link
            href="/connect"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--design-btn)] px-6 py-3 text-base text-zinc-900 transition-colors duration-300 hover:bg-[var(--design-btn-hover)] dark:text-zinc-100"
          >
            <Image
              src="/svg/solar_calculator-broken.svg"
              alt={t("calculatorAlt")}
              width={20}
              height={20}
              className="dark:invert"
            />
            {t("contactButton")}
          </Link>
        </div>
      </div>

      <div className="mt-4 flex justify-end md:absolute md:bottom-4 md:right-0 md:mt-0">
        <div className="flex items-center gap-2">
          <Link
            href="#"
            aria-label={t("socialInstagram")}
            className="grid place-items-center rounded-full text-[10px] text-white"
          >
            <Image src={icons.instagram} alt="" width={30} height={30} />
          </Link>
          <Link
            href="#"
            aria-label={t("socialTelegram")}
            className="grid place-items-center rounded-full text-[10px] text-white"
          >
            <Image src={icons.telegram} alt="" width={30} height={30} />
          </Link>
          <Link
            href="#"
            aria-label={t("socialViber")}
            className="grid place-items-center rounded-full text-[10px] text-white"
          >
            <Image src={icons.viber} alt="" width={30} height={30} />
          </Link>
        </div>
      </div>
    </section>
  );
}
