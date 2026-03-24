"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Ручная раскладка шагов — меняйте только здесь.
 *
 * angleDeg — угол от оси X (3 часа), против часовой, как в Math.cos/sin.
 *   Примеры: 90° = 12 часов, 0° = 3 ч, -90° = 6 ч, 180° = 9 ч.
 * offsetXPx / offsetYPx — доп. сдвиг центра карточки от точки на орбите (px), по желанию.
 * badgeOffsetXPx / badgeOffsetYPx — сдвиг бейджа «шаг N» относительно позиции на лучу (px).
 */
export type WorkStepManualConfig = {
  id: 1 | 2 | 3 | 4 | 5;
  color: "yellow" | "blue";
  angleDeg: number;
  offsetXPx?: number;
  offsetYPx?: number;
  badgeOffsetXPx?: number;
  badgeOffsetYPx?: number;
};

const WORK_STEPS_CONFIG: readonly WorkStepManualConfig[] = [
  { id: 1, color: "yellow", angleDeg: 60 },
  { id: 2, color: "blue", angleDeg: 0 },
  { id: 3, color: "yellow", angleDeg: -60 },
  { id: 4, color: "yellow", angleDeg: -120 },
  { id: 5, color: "blue", angleDeg: 150 },
];

/** Смещение точки на окружности радиуса radiusPx (центр сцены = 0,0). Y вниз. */
function offsetFromAngle(angleDeg: number, radiusPx: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: radiusPx * Math.cos(rad),
    y: -radiusPx * Math.sin(rad),
  };
}

/** Середина короткой дуги a→b (для стрелок на орбите). */
function midAngleOnArc(a: number, b: number) {
  let d = b - a;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return a + d / 2;
}

function StepBlock({
  color,
  title,
  text,
  badge,
  config,
  orbitR,
  badgeInset,
}: {
  color: "blue" | "yellow";
  title: string;
  text: string;
  badge: string;
  config: WorkStepManualConfig;
  orbitR: number;
  badgeInset: number;
}) {
  const bgClass = color === "blue" ? "bg-[#9ab5f6]" : "bg-[#f2d48c]";
  const base = offsetFromAngle(config.angleDeg, orbitR);
  const cardCenter = {
    x: base.x + (config.offsetXPx ?? 0),
    y: base.y + (config.offsetYPx ?? 0),
  };
  const badgeR = Math.max(orbitR - badgeInset, 48);
  const badgeBase = offsetFromAngle(config.angleDeg, badgeR);
  const badgePos = {
    x: badgeBase.x + (config.badgeOffsetXPx ?? 0),
    y: badgeBase.y + (config.badgeOffsetYPx ?? 0),
  };

  return (
    <>
      {/* «Шаг N» — на лучу (или со сдвигом из config) */}
      <div
        className="pointer-events-none absolute z-[18]"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${badgePos.x}px), calc(-50% + ${badgePos.y}px))`,
        }}
      >
        <span className="inline-block whitespace-nowrap rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm md:px-2.5 md:py-1 md:text-xs">
          {badge}
        </span>
      </div>

      {/* Центр карточки: орбита + offsetXPx/offsetYPx */}
      <article
        className={`absolute z-20 w-[min(42vw,180px)] rounded-2xl p-3 shadow-sm sm:w-[200px] md:w-[230px] md:p-4 ${bgClass}`}
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${cardCenter.x}px), calc(-50% + ${cardCenter.y}px))`,
        }}
      >
        <p className="mb-1 text-xs font-semibold text-zinc-800 md:text-sm">{title}</p>
        <p className="text-[11px] leading-4 text-zinc-800 md:text-sm md:leading-5">
          {text}
        </p>
      </article>
    </>
  );
}

export default function Work() {
  const t = useTranslations("work");
  const sceneRef = useRef<HTMLDivElement>(null);
  const [orbitR, setOrbitR] = useState(200);
  const [badgeInset, setBadgeInset] = useState(48);

  useLayoutEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const m = Math.min(w, h);
      /** Радиус круга = расстояние до центра карточки. */
      const R = Math.round(Math.min(240, Math.max(140, m * 0.35)));
      setOrbitR(R);
      /** Бейдж чуть ближе к центру по лучу. */
      setBadgeInset(Math.round(Math.min(58, Math.max(38, R * 0.24))));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Стрелки на дуге между соседними шагами (порядок как в WORK_STEPS_CONFIG) */
  const arrowR = orbitR * 0.98;
  const arrowAngles = WORK_STEPS_CONFIG.map((_, i) =>
    midAngleOnArc(
      WORK_STEPS_CONFIG[i].angleDeg,
      WORK_STEPS_CONFIG[(i + 1) % WORK_STEPS_CONFIG.length].angleDeg,
    ),
  );

  /** Касательная по часовой (к следующему шагу). */
  const tangentRotateDeg = (angleDeg: number) => angleDeg - 90;

  return (
    <section className="mt-8 rounded-[28px] px-2 py-6 shadow-sm md:px-6 md:py-10 lg:px-8">
      <h2 className="mb-6 text-center text-3xl font-bold text-zinc-800 md:mb-8 md:text-4xl">
        {t("title")}
      </h2>

      <div
        ref={sceneRef}
        className="relative mx-auto h-[620px] w-full max-w-[950px] md:h-[700px]"
      >
        {/* Пунктир: проходит через центры карточек */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 rounded-full border border-dashed border-zinc-400 bg-transparent"
          style={{
            width: orbitR * 2,
            height: orbitR * 2,
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden
        />

        {/* Стрелки на круге, между шагами, направление по часовой к следующей карточке */}
        {arrowAngles.map((angleDeg, i) => {
          const { x, y } = offsetFromAngle(angleDeg, arrowR);
          return (
            <span
              key={`arrow-${i}`}
              className="absolute z-[8] select-none text-sm text-zinc-500 md:text-base"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${tangentRotateDeg(angleDeg)}deg)`,
              }}
              aria-hidden
            >
              →
            </span>
          );
        })}

        {/* Центр: иллюстрация */}
        <div className="absolute left-1/2 top-1/2 z-10 w-[min(46%,210px)] -translate-x-1/2 -translate-y-1/2 md:w-[350px]">
          <Image
            src="/img/Group%2076%20(1)%201.png"
            alt={t("illustrationAlt")}
            width={512}
            height={768}
            className="h-auto w-full"
            priority
          />
        </div>

        {WORK_STEPS_CONFIG.map((step) => (
          <StepBlock
            key={step.id}
            color={step.color}
            title={t(`steps.${step.id}.title`)}
            text={t(`steps.${step.id}.text`)}
            badge={t("stepBadge", { step: step.id })}
            config={step}
            orbitR={orbitR}
            badgeInset={badgeInset}
          />
        ))}
      </div>
    </section>
  );
}
