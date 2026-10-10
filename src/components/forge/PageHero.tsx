"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { EASE } from "@/components/motion";

/**
 * The top of every inner page. Same move as the home hero, at a smaller
 * scale: the title is drawn, heat pours through it, and it sets.
 */
export function PageHero({
  code,
  title,
  intro,
  children,
}: {
  code: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  const word = title;
  return (
    <header className="blueprint relative isolate overflow-hidden border-b border-ink-700">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3"
        style={{ background: "radial-gradient(50% 80% at 20% 110%, rgba(244,87,13,0.18), transparent 70%)" }}
      />
      <div className="rail pb-14 pt-32 md:pb-20 md:pt-40">
        <m.p
          className="index-label mb-6 flex items-center gap-3 text-ember-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span aria-hidden className="h-px w-8 bg-ember-500/70" />
          {code}
        </m.p>

        <h1 aria-label={title} className="font-stamp grid text-[clamp(4rem,1.5rem+10.5vw,11.5rem)] leading-[0.9] [&>span]:col-start-1 [&>span]:row-start-1">
          <span aria-hidden className="text-sketch">
            {word}
          </span>
          <m.span
            aria-hidden
            className="text-molten"
            initial={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 1 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: [1, 1, 0] }}
            transition={{
              clipPath: { duration: 0.8, delay: 0.15, ease: [0.6, 0, 0.3, 1] },
              opacity: { duration: 1.6, delay: 0.95, times: [0, 0.2, 1] },
            }}
          >
            {word}
          </m.span>
          <m.span
            aria-hidden
            className="text-forged"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.05, ease: EASE }}
          >
            {word}
          </m.span>
        </h1>

        {intro ? (
          <m.div
            className="mt-8 max-w-[56ch] text-[1.05rem] leading-relaxed text-cream-dim md:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          >
            {intro}
          </m.div>
        ) : null}
        {children}
      </div>
    </header>
  );
}
