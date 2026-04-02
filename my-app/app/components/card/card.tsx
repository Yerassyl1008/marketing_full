"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { PUBLIC_LEADS_PROXY_BASE } from "@/lib/public-leads-proxy";
import { socialIconSrc, useIsDarkTheme } from "@/lib/social-icons";

const CARD_ILLUSTRATION_LIGHT = "/img/Frame189(1)1.png";
const CARD_ILLUSTRATION_DARK = `/img/${encodeURIComponent("Frame 189 (1) 1 (1).png")}`;

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
  const isDarkTheme = useIsDarkTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactType, setContactType] = useState<"telegram" | "whatsapp">("telegram");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

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
      const response = await fetch(PUBLIC_LEADS_PROXY_BASE, {
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
          : "mt-8 rounded-[28px] bg-[var(--card-bg)] p-3 shadow-sm sm:p-5 lg:p-8 lg:py-12"
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
              </span>
              <br />{t("left.titleBottom")}
            </h3>
            <p className="max-w-md text-lg font-medium leading-7 text-[var(--foreground)]">
              {t("left.description")}{" "}
              <span className="font-semibold text-[var(--foreground)]">{t("left.free")}</span>
            </p>

            <div className="mt-8 rounded-2xl  p-4">
              <div className="mb-4 grid h-[250px] place-items-center rounded-xl">
                <Image
                  src={isDarkTheme ? CARD_ILLUSTRATION_DARK : CARD_ILLUSTRATION_LIGHT}
                  alt={t("left.illustrationAlt")}
                  width={500}
                  height={380}
                  className="mb-6 h-auto max-h-[500px] w-auto max-w-[500px] object-contain"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {tagIds.map((tagId) => (
                  <span
                    key={tagId}
                    className="rounded-full bg-[var(--card-spawn-bg)] px-3 py-1 text-xs text-[var(--card-spawn-text)]"
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

            <label
              className="mb-2 block text-base text-[var(--design-muted)] sm:text-lg"
              htmlFor="name"
            >
              {t("form.nameLabel")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mb-4 w-full rounded-2xl border border-[color:var(--foreground)]/20 bg-[var(--card-input-bg)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--design-muted)] focus:border-[var(--design-btn)] sm:px-4 sm:text-lg"
            />

            <label
              className="mb-2 block text-base text-[var(--design-muted)] sm:text-lg"
              htmlFor="email"
            >
              {t("form.emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
              className="mb-4 w-full rounded-2xl border border-[color:var(--foreground)]/20 bg-[var(--card-input-bg)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--design-muted)] focus:border-[var(--design-btn)] sm:px-4 sm:text-lg"
            />

            <p className="mb-2 text-base text-[var(--design-muted)] sm:text-lg">
              {t("form.contactMethodLabel")}
            </p>
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setContactType("telegram")}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition sm:text-base ${
                  contactType === "telegram"
                    ? "border-[var(--design-btn)] bg-[var(--design-btn)]/18 font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-[var(--design-btn)]/35 dark:bg-[var(--design-btn)]/25"
                    : "border-[color:var(--foreground)]/22 bg-[var(--card-input-bg)] font-medium text-[var(--foreground)]/90 hover:border-[color:var(--foreground)]/40"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Image
                    src={socialIconSrc(isDarkTheme, "telegram")}
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span className="truncate">{t("form.telegramOption")}</span>
                </span>
                <span
                  className={`ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    contactType === "telegram"
                      ? "border-[var(--design-btn)] bg-[var(--design-btn)]"
                      : "border-[color:var(--foreground)]/35 bg-transparent"
                  }`}
                  aria-hidden
                >
                  {contactType === "telegram" ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setContactType("whatsapp")}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition sm:text-base ${
                  contactType === "whatsapp"
                    ? "border-[var(--design-btn)] bg-[var(--design-btn)]/18 font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-[var(--design-btn)]/35 dark:bg-[var(--design-btn)]/25"
                    : "border-[color:var(--foreground)]/22 bg-[var(--card-input-bg)] font-medium text-[var(--foreground)]/90 hover:border-[color:var(--foreground)]/40"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Image
                    src={socialIconSrc(isDarkTheme, "viber")}
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span className="truncate">{t("form.whatsappOption")}</span>
                </span>
                <span
                  className={`ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    contactType === "whatsapp"
                      ? "border-[var(--design-btn)] bg-[var(--design-btn)]"
                      : "border-[color:var(--foreground)]/35 bg-transparent"
                  }`}
                  aria-hidden
                >
                  {contactType === "whatsapp" ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
            </div>

            <div className="mb-1 flex flex-col items-start justify-between gap-1 sm:flex-row sm:items-center sm:gap-3">
              <label
                className="block text-base text-[var(--design-muted)] sm:text-lg"
                htmlFor="tg"
              >
                {contactType === "telegram"
                  ? t("form.contactValueLabelTelegram")
                  : t("form.contactValueLabelWhatsapp")}
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
              placeholder={
                contactType === "telegram"
                  ? t("form.contactPlaceholderTelegram")
                  : t("form.contactPlaceholderWhatsapp")
              }
              className={`mb-4 w-full rounded-2xl border bg-[var(--card-input-bg)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--design-muted)] sm:px-4 sm:text-lg ${
                submitError
                  ? "border-[#ff8f8f] focus:border-[#ff6f6f]"
                  : "border-[color:var(--foreground)]/20 focus:border-[var(--design-btn)]"
              }`}
            />

            {submitSuccess ? (
              <p className="mb-4 text-sm text-emerald-600">{submitSuccess}</p>
            ) : null}

            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full max-w-md items-center justify-center gap-3 rounded-full border-b-8 border-zinc-900 bg-[#a9bffd] px-4 py-3 text-xl font-medium text-zinc-900 transition-colors hover:bg-[#98b1fb] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:max-w-none sm:px-6 sm:text-2xl"
              >
                <span className="text-xl sm:text-2xl">→</span>
                {isSubmitting ? t("form.submitting") : t("form.submit")}
              </button>

              <div className="flex items-center justify-center gap-3">
                <Link href="#" aria-label={t("social.telegram")} className="grid place-items-center">
                  <Image
                    src={socialIconSrc(isDarkTheme, "telegram")}
                    alt={t("social.telegram")}
                    width={30}
                    height={30}
                  />
                </Link>
                <Link href="#" aria-label={t("social.viber")} className="grid place-items-center">
                  <Image
                    src={socialIconSrc(isDarkTheme, "viber")}
                    alt={t("social.viber")}
                    width={30}
                    height={30}
                  />
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}