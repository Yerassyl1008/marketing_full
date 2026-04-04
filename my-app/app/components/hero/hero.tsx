"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { socialIconSrc, useIsDarkTheme } from "@/lib/social-icons";

const HERO_VIDEO_LIGHT_FILE = "Untitled design (2).mp4";

const HERO_VIDEO_LIGHT_SRC = `/video/${encodeURIComponent(HERO_VIDEO_LIGHT_FILE)}`;
/** Тёмная тема: MP4/WebM — в <video>; GIF — только в <img>/<Image> (в <video> не воспроизводится). */
const HERO_MEDIA_DARK_SRC = "/video/gif_not_lotte.gif";
const HERO_DARK_IS_GIF = /\.gif$/i.test(HERO_MEDIA_DARK_SRC);

const HERO_MEDIA_OUTER =
  "mx-auto w-full max-w-[380px] sm:max-w-[520px] lg:max-w-[min(100%,700px)]";
const HERO_MEDIA_FRAME =
  "relative aspect-square w-full max-h-[min(70vh,600px)] overflow-hidden rounded-2xl bg-[var(--team-surface)]";
const HERO_IMAGE_SIZES = "(max-width: 700px) 90vw, 600px";

export default function Hero() {
  const isDarkTheme = useIsDarkTheme();
  const [videoBroken, setVideoBroken] = useState(false);
  const [muted, setMuted] = useState(false);
  /** Браузер запретил автозвук — нужен клик пользователя. */
  const [needsSoundGesture, setNeedsSoundGesture] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = useTranslations("hero");

  /** Постеры для fallback-картинки и атрибута poster у видео. */
  const posterSrc = isDarkTheme
    ? `/img/${encodeURIComponent("Mask group (1).png")}`
    : `/img/${encodeURIComponent("Mask group.png")}`;

  const heroVideoSrc = isDarkTheme ? HERO_MEDIA_DARK_SRC : HERO_VIDEO_LIGHT_SRC;

  
  const enableSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    setNeedsSoundGesture(false);
    v.play().catch(() => {
      /* ignore */
    });
  }, []);

  const handleVideoClick = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (needsSoundGesture) {
      enableSound();
      return;
    }
    v.muted = !v.muted;
    setMuted(v.muted);
  }, [needsSoundGesture, enableSound]);

  useEffect(() => {
    if (videoBroken || (isDarkTheme && HERO_DARK_IS_GIF)) return;
    const v = videoRef.current;
    if (!v) return;
    let cancelled = false;
    (async () => {
      v.muted = false;
      setMuted(false);
      try {
        await v.play();
      } catch {
        if (cancelled) return;
        v.muted = true;
        setMuted(true);
        setNeedsSoundGesture(true);
        try {
          await v.play();
        } catch {
          /* decode / policy */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoBroken, isDarkTheme]);

  /** Светлая тема снова показывает видео — сбрасываем ошибку после тёмной/падения. */
  useEffect(() => {
    if (!isDarkTheme) setVideoBroken(false);
  }, [isDarkTheme]);

  return (
    <section className="relative min-w-0 max-w-full pb-8 sm:pb-12 sm:pt-6 lg:pb-14">
      <div className="mx-auto flex min-w-0 max-w-full flex-col-reverse gap-4 sm:gap-6 lg:flex-row lg:items-center">
        <div
          className="flex w-full justify-center lg:w-1/2 lg:flex-shrink-0"
        >
          <div className={HERO_MEDIA_OUTER}>
            <div className={HERO_MEDIA_FRAME}>
              {videoBroken ? (
                <Image
                  src={posterSrc}
                  alt={t("videoAria")}
                  fill
                  sizes={HERO_IMAGE_SIZES}
                  className="object-contain"
                  priority
                />
              ) : isDarkTheme && HERO_DARK_IS_GIF ? (
                <Image
                  src={HERO_MEDIA_DARK_SRC}
                  alt={t("videoAria")}
                  fill
                  sizes={HERO_IMAGE_SIZES}
                  className="object-contain"
                  unoptimized
                  priority
                  onError={() => setVideoBroken(true)}
                />
              ) : (
                <div
                  className={`absolute inset-0 ${needsSoundGesture ? "cursor-pointer" : ""}`}
                  onClick={handleVideoClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleVideoClick();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    needsSoundGesture
                      ? t("enableSound")
                      : muted
                        ? t("videoUnmuteHint")
                        : t("videoMuteHint")
                  }
                >
                  <video
                    key={heroVideoSrc}
                    ref={videoRef}
                    className="pointer-events-none h-full w-full object-contain"
                    aria-hidden
                    poster={posterSrc}
                    src={heroVideoSrc}
                    muted={muted}
                    playsInline
                    loop
                    preload="auto"
                    autoPlay
                    onError={() => setVideoBroken(true)}
                  />
                  {needsSoundGesture ? (
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3 sm:pb-4">
                      <button
                        type="button"
                        className="pointer-events-auto rounded-full bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-white shadow-md backdrop-blur-sm sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          enableSound();
                        }}
                      >
                        {t("enableSound")}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 lg:w-1/2 lg:max-w-[36rem]">
          <h2 className="mb-2 text-[26px] font-extrabold leading-[1.15] sm:mb-3 sm:text-3xl sm:leading-tight lg:text-4xl">
            {t("title")}{" "}
            <span className="inline-block rounded-full bg-[#f5c765] px-2 py-0.5 sm:py-0 lg:px-4">
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
              src={socialIconSrc(isDarkTheme, "instagram")}
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
              src={socialIconSrc(isDarkTheme, "telegram")}
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
              src={socialIconSrc(isDarkTheme, "viber")}
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
