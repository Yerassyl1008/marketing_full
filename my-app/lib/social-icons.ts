"use client";

import { useEffect, useLayoutEffect, useState } from "react";

/** Синхронизация с `class="dark"` на `<html>` (как в hero). */
export function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = useState(false);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export type SocialIconKey = "instagram" | "telegram" | "viber";

export function socialIconSrc(isDark: boolean, key: SocialIconKey): string {
  const dark = {
    instagram: "/svg/dark/Instagram_black%20(1).svg",
    telegram: "/svg/dark/Telegram_black%20(1).svg",
    viber: "/svg/dark/Viber_black%20(1).svg",
  } as const;
  const light = {
    instagram: "/svg/Instagram_black.svg",
    telegram: "/svg/Telegram_black.svg",
    viber: "/svg/Viber_black.svg",
  } as const;
  return isDark ? dark[key] : light[key];
}

/** Если нет своего `isDark` (например из header), используй это. */
export function useSocialIconSrc() {
  const isDark = useIsDarkTheme();
  return {
    instagram: socialIconSrc(isDark, "instagram"),
    telegram: socialIconSrc(isDark, "telegram"),
    viber: socialIconSrc(isDark, "viber"),
  };
}
