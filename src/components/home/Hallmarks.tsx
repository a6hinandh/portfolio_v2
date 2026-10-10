"use client";

import { useId, useRef } from "react";
import { m, useReducedMotion } from "framer-motion";
import { strikeAt } from "@/components/forge/Sparks";
import type { Achievement } from "@/lib/content";

/**
 * Wins and roles as hallmarks — the stamp a smith strikes into finished work.
 * Each one is struck into the page as it scrolls in.
 */
export function Hallmarks({ entries }: { entries: Achievement[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-5">
      {entries.map((e, i) => (
        <Hallmark key={e.code} entry={e} index={i} />
      ))}
    </ul>
  );
}

function Hallmark({ entry, index }: { entry: Achievement; index: number }) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const year = entry.period.match(/\d{4}/)?.[0] ?? entry.period;
  const unit = `${entry.org} · ${year} · `.toUpperCase();
  // Short rings repeat so the text always closes the circle at a readable size.
  const ring = unit.length < 26 ? unit.repeat(2) : unit;
  const award = /1st|top|special/i.test(entry.mark);

  return (
    <li className="group/mark flex flex-col items-center text-center lg:items-start lg:text-left">
      <m.div
        ref={ref}
        className="relative h-36 w-36"
        initial={reduce ? false : { scale: 1.7, rotate: -18, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.45, delay: index * 0.12, ease: [0.7, 0, 0.2, 1] }}
        onAnimationComplete={() => strikeAt(ref.current, { count: 14, power: 0.8, spread: Math.PI * 2 })}
      >
        <svg viewBox="0 0 120 120" className="h-full w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/mark:rotate-[25deg]" aria-hidden>
          <defs>
            <path id={`${id}-ring`} d="M60 60 m -44 0 a 44 44 0 1 1 88 0 a 44 44 0 1 1 -88 0" />
          </defs>
          <circle cx="60" cy="60" r="56" fill="none" stroke={award ? "#f4570d" : "#8a919b"} strokeWidth="1.5" />
          <circle cx="60" cy="60" r="35" fill="none" stroke={award ? "#9a3208" : "#4d525a"} strokeWidth="1" strokeDasharray="1.5 2.5" />
          <text fill={award ? "#ff8a4c" : "#aaa59b"} fontSize="8.2" fontFamily="var(--font-jetbrains), monospace" letterSpacing="1.6">
            <textPath href={`#${id}-ring`} textLength="272" lengthAdjust="spacingAndGlyphs">
              {ring}
            </textPath>
          </text>
        </svg>
        <span
          className={`font-stamp absolute inset-0 flex items-center justify-center px-8 text-center uppercase leading-[0.9] ${
            entry.mark.length > 4 ? "text-[0.95rem] tracking-[0.02em]" : "text-[1.55rem] tracking-[-0.02em]"
          } ${award ? "text-molten" : "text-steel-200"}`}
        >
          {entry.mark}
        </span>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.12 + 0.35 }}
      >
        <h3 className="mt-6 font-display text-[1.05rem] font-semibold tracking-tight text-cream">{entry.title}</h3>
        <p className="index-label mt-1.5 text-cream-faint">
          {entry.org} · {entry.period}
        </p>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-cream-dim">{entry.summary}</p>
      </m.div>
    </li>
  );
}
