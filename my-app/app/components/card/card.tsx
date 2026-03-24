"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { getPublicApiBaseUrl } from "@/lib/public-api-url";

const API_BASE_URL = getPublicApiBaseUrl();
const tagIds = [
  "designBranding",
  "websiteCreation",
  "smm",
  "copywriting",
  "emailMarketing",
  "seoPromotion",
  "targetedAds",
  "googleYandexAds",
  "andMore",
] as const;

type CardProps = {
  /** Внутри уже окрашенной секции (connect): без второго слоя team-surface и тени */
  embedded?: boolean;
};

export default function Card({ embedded = false }: CardProps) {
  const t = useTranslations("cardSection");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactType, setContactType] = useState<"telegram" | "whatsapp">("telegram");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDarkTheme(root.classList.contains("dark"));

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!name.trim() || !email.trim() || !contact.trim()) {
      setSubmitError(t("errors.requiredFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          contact_type: contactType,
          contact: contact.trim(),
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const detail =
          typeof errorPayload?.detail === "string"
            ? errorPayload.detail
            : t("errors.submitFailed");
        throw new Error(detail);
      }

      setSubmitSuccess(t("success.submitted"));
      setName("");
      setEmail("");
      setContact("");
      setContactType("telegram");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("errors.unknown"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={
        embedded
          ? "mt-4 w-full sm:mt-6"
          : "mt-8 rounded-[28px] bg-[var(--team-surface)] p-3 shadow-sm sm:p-5 lg:p-8 lg:py-12"
      }
    >
      <div
        className={
          embedded
            ? "mx-auto max-w-6xl"
            : "mx-auto max-w-6xl rounded-[28px] p-3 sm:p-4 lg:p-6"
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="hidden border-r border-dashed border-zinc-300 pr-6 lg:block">
            <h3 className="mb-3 text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl">
              <span className="rounded-full bg-[var(--hero-span)]">
                {t("left.titleTop")}
              </span >
              <br />{t("left.titleBottom")}
            </h3>
            <p className="max-w-md text-lg font-medium leading-7 text-[var(--foreground)]">
              {t("left.description")}{" "}
              <span className="font-semibold text-[var(--foreground)]">{t("left.free")}</span>
            </p>

            <div className="mt-8 rounded-2xl  p-4">
              <div className="mb-4 grid h-[210px] place-items-center rounded-xl">
                <Image
                  src={
                    isDarkTheme
                      ? "/img/Frame%20189%20(1)%201.jpg"
                      : "/img/Frame189(1)1.png"
                  }
                  alt={t("left.illustrationAlt")}
                  width={380}
                  height={380}
                  className={isDarkTheme ? "mb-6 opacity-[0.28]" : "mb-6"}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {tagIds.map((tagId) => (
                  <span
                    key={tagId}
                    className="rounded-full bg-white px-3 py-1 text-xs text-zinc-500"
                  >
                    {t(`left.tags.${tagId}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form className="rounded-3xl p-1 lg:p-0" onSubmit={handleSubmit}>
            <h3 className="mb-4 text-2xl leading-tight font-bold text-[var(--foreground)] sm:mb-5 sm:text-3xl">
              {t("form.title")}
            </h3>

            <label className="mb-2 block text-base text-zinc-600 sm:text-lg" htmlFor="name">
              {t("form.nameLabel")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mb-4 w-full rounded-2xl border border-zinc-500 bg-[var(--card-input-bg)] px-3 py-2.5 text-base outline-none transition focus:border-zinc-700 sm:px-4 sm:text-lg"
            />

            <label className="mb-2 block text-base text-zinc-600 sm:text-lg" htmlFor="email">
              {t("form.emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
              className="mb-4 w-full rounded-2xl border border-zinc-300 bg-[var(--card-input-bg)] px-3 py-2.5 text-base outline-none transition focus:border-zinc-500 sm:px-4 sm:text-lg"
            />

            <p className="mb-2 text-base text-zinc-600 sm:text-lg">{t("form.contactMethodLabel")}</p>
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setContactType("telegram")}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-sm sm:text-base ${
                  contactType === "telegram"
                    ? "border-zinc-500 text-zinc-800"
                    : "border-zinc-300 text-zinc-500"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Image
                    src="/svg/Telegram_black.svg"
                    alt={t("social.telegram")}
                    width={20}
                    height={20}
                  />
                  {t("form.telegramOption")}
                </span>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    contactType === "telegram" ? "border-zinc-500 bg-zinc-900" : "border-zinc-400"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setContactType("whatsapp")}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-sm sm:text-base ${
                  contactType === "whatsapp"
                    ? "border-zinc-500 text-zinc-800"
                    : "border-zinc-300 text-zinc-500"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Image src="/svg/Viber_black.svg" alt={t("social.viber")} width={20} height={20} />
                  {t("form.whatsappOption")}
                </span>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    contactType === "whatsapp" ? "border-zinc-500 bg-zinc-900" : "border-zinc-400"
                  }`}
                />
              </button>
            </div>

            <div className="mb-1 flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center sm:gap-3">
              <label className="block text-base text-zinc-600 sm:text-lg" htmlFor="tg">
                {t("form.contactValueLabel")}
              </label>
              <span className="text-xs leading-tight text-[#ff6f6f] sm:text-sm">
                {submitError || ""}
              </span>
            </div>
            <input
              id="tg"
              type="text"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder={t("form.contactPlaceholder")}
              className={`mb-4 w-full rounded-2xl border bg-[var(--card-input-bg)] px-3 py-2.5 text-base text-zinc-500 outline-none transition sm:px-4 sm:text-lg ${
                submitError ? "border-[#ff8f8f] focus:border-[#ff6f6f]" : "border-zinc-300 focus:border-zinc-500"
              }`}
            />

            {submitSuccess ? (
              <p className="mb-4 text-sm text-emerald-600">{submitSuccess}</p>
            ) : null}

            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border-b-8 border-zinc-900 bg-[#a9bffd] px-4 py-3 text-xl font-medium text-zinc-900 transition-colors hover:bg-[#98b1fb] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:justify-start sm:px-6 sm:text-2xl"
              >
                <span className="text-xl sm:text-2xl">→</span>
                {isSubmitting ? t("form.submitting") : t("form.submit")}
              </button>

              <div className="flex items-center justify-center gap-2 self-end text-center sm:self-auto">
                <Link href="#" aria-label={t("social.telegram")}>
                  <Image
                    src="/svg/Telegram_black.svg"
                    alt={t("social.telegram")}
                    width={30}
                    height={30}
                  />
                </Link>
                <Link href="#" aria-label={t("social.viber")}>
                  <Image src="/svg/Viber_black.svg" alt={t("social.viber")} width={30} height={30} />
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}