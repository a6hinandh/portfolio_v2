"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { m } from "framer-motion";
import { Counter, EASE, Seam, WordReveal } from "@/components/motion";

/* ---------------------------------------------------------------------------
   IndexLabel — the mono code that runs through the whole site. Every section,
   every entity, every row carries one. It is the connective tissue.
------------------------------------------------------------------------- */

export function IndexLabel({
  code,
  suffix,
  active = true,
  className = "",
}: {
  code: string;
  suffix?: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <span className={`index-label ${className}`}>
      <span className={active ? "text-ember-500" : "text-cream-faint"}>{code}</span>
      {suffix ? <span className="text-cream-faint"> · {suffix}</span> : null}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   SectionHeader — repeated on every section of every page. The repetition is
   the design system announcing itself.
------------------------------------------------------------------------- */

export function SectionHeader({
  code,
  title,
  subtitle,
  href,
  hrefLabel,
  className = "",
}: {
  code: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={`mb-12 md:mb-16 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="max-w-2xl">
          <m.p
            className="index-label mb-4 flex items-center gap-3 text-ember-500"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span aria-hidden className="h-px w-6 bg-ember-500/60" />
            {code}
          </m.p>

          <h2 className="font-display text-display-lg font-medium text-cream">
            <WordReveal trigger="view" segments={[{ text: title }]} stagger={0.05} />
          </h2>

          {subtitle ? (
            <m.p
              className="mt-4 text-balance text-cream-dim"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            >
              {subtitle}
            </m.p>
          ) : null}
        </div>

        {href ? (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          >
            <Link
              href={href}
              className="group/all index-label tap gap-2 text-cream-dim transition-colors hover:text-cream"
            >
              <span className="u-draw pb-1">{hrefLabel ?? "View all"}</span>
              <span
                aria-hidden
                className="inline-block text-ember-500 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/all:translate-x-1"
              >
                →
              </span>
            </Link>
          </m.div>
        ) : null}
      </div>

      <Seam className="mt-8" delay={0.25} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Tag — a stack chip. Crisp corners, hairline border, no fill.
------------------------------------------------------------------------- */

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-[2px] border border-ink-700 bg-ink-850/60 px-2 py-1 font-mono text-[0.6875rem] tracking-wide text-cream-dim transition-colors duration-300 group-hover/card:border-ink-600">
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   MetaGrid — the label/value grammar shared by every entity on the site:
   a project, a job, and a degree are all described the same way.
------------------------------------------------------------------------- */

export function MetaGrid({
  items,
  columns = 4,
}: {
  items: { label: string; value: ReactNode }[];
  columns?: 2 | 3 | 4;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-6 ${cols}`}>
      {items.map((item, i) => (
        <m.div
          key={item.label}
          className="border-t border-ink-700 pt-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE, delay: i * 0.06 }}
        >
          <dt className="index-label mb-1.5 text-cream-faint">{item.label}</dt>
          <dd className="text-[0.9375rem] leading-snug text-cream">{item.value}</dd>
        </m.div>
      ))}
    </dl>
  );
}

/* ---------------------------------------------------------------------------
   StatBlock — results before story. Numbers count up once, in view.
------------------------------------------------------------------------- */

export function StatBlock({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-700 bg-ink-700 md:grid-cols-4">
      {stats.map((s, i) => (
        <m.div
          key={s.label}
          className="group/stat relative overflow-hidden bg-ink-900 p-5 transition-colors duration-500 hover:bg-ink-850 md:p-6"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
        >
          <span
            aria-hidden
            className="seam-hot absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover/stat:opacity-100"
          />
          <p className="font-display text-display-md font-medium tabular-nums text-ember-400">
            <Counter value={s.value} />
          </p>
          <p className="index-label mt-2 text-cream-faint">{s.label}</p>
        </m.div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CoverArt — deterministic abstract art for projects with no screenshot.
   A billet cross-section: forge grid, a pool of heat, structural strikes.
   Generated from a seed so a given project always looks the same, and costs
   no image request at all.
------------------------------------------------------------------------- */

export function CoverArt({ seed, className = "" }: { seed: number; className?: string }) {
  const heatX = 20 + ((seed * 31) % 60);
  const heatY = 30 + ((seed * 53) % 45);
  const strikeCount = 3 + (seed % 3);
  const rotation = ((seed * 17) % 40) - 20;

  return (
    <div
      aria-hidden
      className={`relative overflow-hidden bg-ink-950 ${className}`}
    >
      {/* Forge floor */}
      <div
        className="forge-grid absolute inset-0 opacity-60 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-105"
        style={{
          maskImage: `linear-gradient(${rotation + 120}deg, black 10%, transparent 80%)`,
          WebkitMaskImage: `linear-gradient(${rotation + 120}deg, black 10%, transparent 80%)`,
        }}
      />

      {/* The pool of heat */}
      <div
        className="absolute inset-0 opacity-70 transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-110 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(46% 52% at ${heatX}% ${heatY}%, rgba(244,87,13,0.32) 0%, rgba(210,68,10,0.12) 40%, transparent 72%)`,
        }}
      />

      {/* Billet outline — the mark motif, repeated as composition */}
      <svg
        viewBox="0 0 200 120"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          transform={`translate(${100 + ((seed * 7) % 30) - 15} ${60 + ((seed * 11) % 20) - 10}) rotate(${rotation})`}
          className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:rotate-[6deg]"
          style={{ transformOrigin: "center" }}
        >
          <path
            d="M0 -34 L29 -17 L29 17 L0 34 L-29 17 L-29 -17 Z"
            fill="none"
            stroke="rgba(244,87,13,0.28)"
            strokeWidth="0.75"
          />
          <path
            d="M0 -20 L17 -10 L17 10 L0 20 L-17 10 L-17 -10 Z"
            fill="rgba(244,87,13,0.06)"
            stroke="rgba(255,176,122,0.2)"
            strokeWidth="0.5"
          />
        </g>

        {/* Strike marks */}
        {Array.from({ length: strikeCount }).map((_, i) => {
          const y = 18 + ((seed * (13 + i * 23)) % 84);
          const x = 8 + ((seed * (7 + i * 17)) % 60);
          const w = 22 + ((seed * (11 + i * 5)) % 55);
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x + w}
              y2={y}
              stroke="rgba(244,87,13,0.35)"
              strokeWidth="0.5"
              opacity={0.35 + i * 0.16}
            />
          );
        })}
      </svg>

      {/* Cool the edges so the art never fights the card border */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PageHeader — the masthead every inner page opens with.
------------------------------------------------------------------------- */

export function PageHeader({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative pb-14 pt-32 md:pb-20 md:pt-44">
      <m.p
        className="index-label mb-5 flex items-center gap-3 text-ember-500"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span aria-hidden className="h-px w-8 bg-ember-500/60" />
        {kicker}
      </m.p>

      <h1 className="max-w-4xl font-display text-display-xl font-medium text-cream">
        <WordReveal segments={[{ text: title }]} delay={0.1} stagger={0.05} />
      </h1>

      {intro ? (
        <m.p
          className="mt-6 max-w-2xl text-lg text-balance text-cream-dim"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
        >
          {intro}
        </m.p>
      ) : null}

      {children ? (
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
        >
          {children}
        </m.div>
      ) : null}
    </header>
  );
}
