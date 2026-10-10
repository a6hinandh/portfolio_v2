"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { m } from "framer-motion";
import { Reveal } from "@/components/motion";

/**
 * Every section opens the same way: a stamped mono code, a heavy stamped title,
 * and at most one line of context. Consistency is what lets the motion be loud.
 */
export function SectionHead({
  code,
  title,
  hot,
  aside,
  href,
  hrefLabel,
}: {
  code: string;
  title: string;
  /** Optional trailing word rendered molten — the one hot word in the header. */
  hot?: string;
  aside?: ReactNode;
  href?: string;
  hrefLabel?: string;
}) {
  const words = [
    ...title.split(" ").map((text) => ({ text, hot: false })),
    ...(hot ? hot.split(" ").map((text) => ({ text, hot: true })) : []),
  ];
  return (
    <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <Reveal>
          <p className="index-label mb-5 flex items-center gap-3 text-ember-500">
            <span aria-hidden className="h-px w-8 bg-ember-500/70" />
            {code}
          </p>
        </Reveal>
        {/* Words rise out of their own masks. The observer is on the heading —
            a fully clipped word never registers as in view on its own. */}
        <m.h2
          className="font-stamp text-stamp-lg text-cream"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ staggerChildren: 0.06, delayChildren: 0.05 }}
        >
          {words.map((w, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                <m.span
                  className={`inline-block ${w.hot ? "text-molten" : ""}`}
                  variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w.text}
                </m.span>
              </span>
              {/* The space sits outside the mask so lines can still wrap. */}
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </m.h2>
        {aside ? (
          <Reveal delay={0.1}>
            <div className="mt-5 max-w-[52ch] text-cream-dim">{aside}</div>
          </Reveal>
        ) : null}
      </div>
      {href && hrefLabel ? (
        <Reveal delay={0.12}>
          <Link
            href={href}
            className="group/link index-label tap gap-2 text-cream-dim transition-colors hover:text-cream"
          >
            <span className="u-draw pb-1">{hrefLabel}</span>
            <span aria-hidden className="text-ember-500 transition-transform duration-300 group-hover/link:translate-x-1">
              →
            </span>
          </Link>
        </Reveal>
      ) : null}
    </header>
  );
}
