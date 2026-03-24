import type { ReactNode } from "react";

type TeamSurfaceHeaderSectionProps = {
  children: ReactNode;
  /** Доп. классы для внешней <section> (mt-6, и т.д.) */
  className?: string;
  /** Доп. классы для внутреннего контейнера (напр. flex flex-col gap-14 pb-6) */
  innerClassName?: string;
  /** Фон плашки (по умолчанию токен темы) */
  surfaceClassName?: string;
};

/**
 * Серая плашка на всю ширину вьюпорта + внутренний контейнер,
 * выровненный с блоками вроде Workers/Services (как на главной).
 */
export function TeamSurfaceHeaderSection({
  children,
  className = "",
  innerClassName = "",
  surfaceClassName = "bg-[var(--team-surface)]",
}: TeamSurfaceHeaderSectionProps) {
  return (
    <div className="relative left-1/2 w-[100dvw] max-w-[100dvw] -translate-x-1/2 overflow-x-clip">
      <section
        className={`mx-3 rounded-[24px] ${surfaceClassName} pb-8 pt-2 shadow-sm sm:mx-4 md:mx-6 md:rounded-[28px] md:pb-10 md:pt-2 lg:rounded-[32px] ${className}`}
      >
        <div
          className={`mx-auto w-full max-w-[1280px] px-6 pb-8 pt-2 sm:px-7 md:px-12 lg:max-w-[1400px] lg:px-14 ${innerClassName}`}
        >
          {children}
        </div>
      </section>
    </div>
  );
}
