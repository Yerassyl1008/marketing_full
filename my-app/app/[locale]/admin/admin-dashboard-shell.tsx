"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { Sidebar } from "@/app/components2/sidebar/sidebar";
import { SecondHeader } from "@/app/components2/second-header/second-header";
import type { User } from "@/app/components2/second-header/second-header";
import { ADMIN_ACCESS_TOKEN_KEY, ADMIN_THEME_KEY } from "@/lib/admin-auth";

export default function AdminDashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authGate, setAuthGate] = useState<"loading" | "ok">("loading");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [user] = useState<User>({
    id: "1",
    name: "Aibek",
    avatar: "/img/Mask group.png",
    role: "Student",
    rank: 1,
    solved: 100,
  });

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)?.trim()) {
        router.replace("/admin/login");
        return;
      }
      setAuthGate("ok");
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(ADMIN_THEME_KEY);
      if (savedTheme === "dark") {
        setIsDark(true);
        return;
      }
      if (savedTheme === "light") {
        setIsDark(false);
        return;
      }
      setIsDark(document.documentElement.classList.contains("dark"));
    } catch {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      window.localStorage.setItem(ADMIN_THEME_KEY, isDark ? "dark" : "light");
    } catch {
      // Ignore localStorage errors.
    }
  }, [isDark]);

  if (authGate !== "ok") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--design-btn)] border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1400px] bg-[var(--background)]">
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
        onLogout={() => {
          try {
            sessionStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
          } catch {
            /* ignore */
          }
          router.replace("/admin/login");
        }}
      />

      <div className="min-h-screen min-w-0 lg:pl-64">
        <SecondHeader
          user={user}
          toggleTheme={() => setIsDark((prev) => !prev)}
          isDark={isDark}
          toggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
        />

        <main className="px-3 pb-6 pt-3 sm:px-4 md:px-6 md:pb-8 md:pt-4">{children}</main>
      </div>
    </div>
  );
}
