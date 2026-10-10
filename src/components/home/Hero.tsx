"use client";

import Link from "next/link";
import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ForgeBackdrop } from "@/components/forge/ForgeBackdrop";
import { HeatName } from "@/components/home/HeatName";
import { EASE } from "@/components/motion";
import type { Profile } from "@/lib/content";

const AFTER = 1.15; // when the supporting content follows the name in

type Readout = { label: string; value: string };

export function Hero({
  site,
  readouts,
}: {
  site: Pick<Profile, "name" | "fullName" | "shortRole" | "location">;
  readouts: Readout[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // On the way out, the name sinks back and the room dims — the forge scene takes over.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const nameY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const nameScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const glow = useTransform(scrollYProgress, [0, 0.8], [1, 1.6]);

  return (
    <section
      ref={sectionRef}
      data-stage="Sketch"
      className="blueprint relative isolate flex min-h-svh flex-col overflow-hidden"
    >
      <m.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[75%] origin-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.6 }}
        style={reduce ? undefined : { scaleY: glow }}
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(55% 70% at 50% 100%, rgba(244,87,13,0.26) 0%, rgba(154,50,8,0.11) 40%, transparent 72%)",
          }}
        />
      </m.div>
      <ForgeBackdrop density={0.7} intensity={0.85} source={{ x: 0.5, y: 1.02 }} className="-z-10" />

      <div className="rail flex flex-1 flex-col pb-6 pt-20 md:pb-8 md:pt-24">
        {/* Title block of a technical drawing. */}
        <m.div
          className="index-label grid grid-cols-2 gap-y-2 border-y border-ink-700 py-3 text-cream-faint sm:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span>{site.shortRole}</span>
          <span className="text-right sm:text-center">{site.location}</span>
          <span className="hidden sm:block sm:text-center">B.Tech · AI &amp; Data Science</span>
          <span className="hidden items-center justify-end gap-2 sm:flex">
            <span aria-hidden className="ember-breathe h-1.5 w-1.5 rounded-full bg-ember-500" />
            <span className="text-ember-400">At the anvil</span>
          </span>
        </m.div>

        {/* The name ------------------------------------------------------ */}
        <div className="flex flex-1 items-center py-12 md:py-8">
          <m.div className="w-full origin-bottom" style={reduce ? undefined : { y: nameY, scale: nameScale }}>
            <HeatName text={site.name} label={site.fullName} />
          </m.div>
        </div>

        {/* Who, what, and the instruments ------------------------------ */}
        <m.div
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-end lg:gap-10"
          style={reduce ? undefined : { opacity: fade }}
        >
          <m.p
            className="max-w-[30ch] font-display text-[1.2rem] font-medium leading-snug tracking-tight text-cream md:text-[1.45rem]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: AFTER, ease: EASE }}
          >
            I take ideas off the drawing board and{" "}
            <span className="text-ember-400">forge them into things that ship.</span>
          </m.p>

          <m.div
            className="flex flex-wrap items-center gap-3 lg:justify-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: AFTER + 0.1, ease: EASE }}
          >
            <Link
              href="/#work"
              className="group/cta index-label tap gap-3 rounded-full bg-ember-500 px-6 font-semibold text-ink-950 transition-colors hover:bg-ember-400"
            >
              See the work
              <span aria-hidden className="transition-transform duration-300 group-hover/cta:translate-y-0.5">
                ↓
              </span>
            </Link>
            <Link
              href="/resume"
              className="index-label tap rounded-full border border-ink-600 px-6 text-cream transition-colors hover:border-cream-faint"
            >
              Resume
            </Link>
          </m.div>

          <m.dl
            className="grid grid-cols-4 border-l border-t border-ink-700 lg:ml-auto lg:w-full lg:max-w-[30rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: AFTER + 0.2 }}
          >
            {readouts.map((r) => (
              <div key={r.label} className="border-b border-r border-ink-700 px-3 py-3 sm:px-4">
                <dt className="micro-label truncate text-cream-faint">{r.label}</dt>
                <dd className="font-stamp mt-1 text-[1.5rem] leading-none text-cream sm:text-[1.85rem]">{r.value}</dd>
              </div>
            ))}
          </m.dl>
        </m.div>

        {/* Scroll cue */}
        <m.div
          aria-hidden
          className="micro-label mt-8 hidden items-center justify-center gap-3 text-cream-faint md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: AFTER + 0.6 }}
        >
          <span className="relative h-8 w-px overflow-hidden bg-ink-700">
            <m.span
              className="absolute inset-x-0 top-0 h-1/2 bg-ember-500"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          Scroll — watch one get built
        </m.div>
      </div>
    </section>
  );
}
