"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const navLinks = [
  { key: "team" as const, href: "/team" },
  { key: "process" as const, href: "/main-page#work" },
  { key: "services" as const, href: "/services" },
  { key: "projects" as const, href: "/projects" },
  { key: "sitemap" as const, href: "/connect" },
];

const contacts = [
  { key: "writeUs" as const, href: "/connect" },
  { key: "phone" as const, href: "tel:+99999999999" },
  { key: "instagram" as const, href: "https://instagram.com", external: true },
  { key: "telegram" as const, href: "https://t.me", external: true },
  { key: "viber" as const, href: "viber://chat?number=%2B99999999999" },
];

const docs = [
  { key: "privacy" as const, href: "/privacy" },
  { key: "terms" as const, href: "#" },
  { key: "company" as const, href: "#" },
];

const linkClass =
  "group inline-flex items-center text-zinc-300 transition-all duration-300 hover:translate-x-1 hover:text-white";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-8 w-full rounded-t-[28px] bg-[var(--footer-bg-top)] px-3 pb-0 pt-3 md:px-6 md:pb-0 md:pt-6 lg:px-8">
      <div className="rounded-[28px] px-4 py-5 md:px-8 md:py-8 lg:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 md:max-w-[520px] lg:max-w-[580px]">
            <span className="text-3xl leading-none text-zinc-300 md:text-4xl">“</span>
            <p className="text-sm leading-relaxed text-zinc-500 md:text-base md:leading-relaxed lg:text-lg">
              <span className="font-semibold text-zinc-700">
                {t("quoteBold")}
              </span>{" "}
              {t("quoteRest")}
            </p>
          </div>

          <div className="order-2 flex items-center md:order-3">
            {[1, 2, 3, 4].map((item, idx) => (
              <div
                key={item}
                className={`relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#f5f5f5] md:h-14 md:w-14 ${
                  idx === 0 ? "" : "-ml-2 md:-ml-3"
                }`}
              >
                <Image
                  src="/img/beautifull-caucasian-woman-with-curly-hair-smiles-isolated 1.png"
                  alt={t("memberAlt")}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <Link
            href="/connect"
            className="order-3 inline-flex w-fit items-center gap-2 rounded-full bg-[#9ab5f6] px-5 py-2.5 text-sm font-medium text-zinc-900 shadow transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#89a9f5] md:order-2 md:px-8 md:py-3.5 md:text-base"
          >
            <span aria-hidden>→</span>
            {t("contactButton")}
          </Link>
        </div>
      </div>

      <div className="mt-4 -mx-3 bg-[#1d1d1f] text-zinc-200 md:-mx-6 lg:-mx-8">
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8 lg:px-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[2.2fr_1fr_1fr_1fr] md:gap-10">
            <div>
              <h3 className="mb-3 text-xl font-semibold md:text-2xl lg:text-3xl">
                {t("brandTitle")}
              </h3>
              <p className="max-w-md text-sm leading-6 text-zinc-400 md:text-lg md:leading-8">
                {t("about")}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs md:text-base">
                <span>{t("badges.google")}</span>
                <span>{t("badges.meta")}</span>
                <span>{t("badges.ssl")}</span>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm text-zinc-500 md:text-lg">
                {t("navTitle")}
              </p>
              <ul className="space-y-2 text-sm md:text-lg">
                {navLinks.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className={linkClass}>
                      <span className="border-b border-transparent transition-colors duration-300 group-hover:border-white/70">
                        {t(`navLinks.${item.key}`)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm text-zinc-500 md:text-lg">
                {t("contactsTitle")}
              </p>
              <ul className="space-y-2 text-sm md:text-lg">
                {contacts.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={linkClass}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer noopener" : undefined}
                    >
                      <span className="border-b border-transparent transition-colors duration-300 group-hover:border-white/70">
                        {t(`contacts.${item.key}`)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-sm text-zinc-500 md:text-lg">
                {t("docsTitle")}
              </p>
              <ul className="space-y-2 text-sm md:text-lg">
                {docs.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className={linkClass}>
                      <span className="border-b border-transparent transition-colors duration-300 group-hover:border-white/70">
                        {t(`docs.${item.key}`)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="my-6 h-px w-full border-t border-dashed border-zinc-600" />

          <div className="flex flex-col gap-2 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
            <p>{t("copyright")}</p>
            <p>{t("tagline")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
