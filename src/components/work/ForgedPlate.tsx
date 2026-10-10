"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { m, useInView, useMotionTemplate, useMotionValue } from "framer-motion";
import { strikeAt } from "@/components/forge/Sparks";
import type { ProjectCard } from "@/lib/content";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * A featured build, presented as a worked plate. At rest it is cold steel with
 * the project's name scratched in outline; hover puts it back in the fire —
 * heat climbs from the bottom edge and the outline fills.
 */
export function ForgedPlate({ entry, wide = false }: { entry: ProjectCard; wide?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  // Touch screens have no hover, so a plate heats up while it crosses the middle of the screen.
  const centred = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const light = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(255,138,76,0.13), transparent 60%)`;

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  // Drawn-steel grain, at an angle unique to each project and stable across renders.
  const rand = hash(entry.title);
  const grain = Math.round(-8 + rand() * 16);
  const heatX = Math.round(20 + rand() * 60);
  const short = entry.title.split(/\s+/).slice(0, 2).join(" ");
  // A write-up gets its own page; otherwise the plate goes straight to the build.
  const href = entry.hasPage ? `/work/${entry.slug}` : (entry.live ?? entry.repo);
  const external = !entry.hasPage;
  const cta = entry.hasPage ? "Read the build" : entry.live ? "Live" : "Source";

  return (
    <a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(-999);
        my.set(-999);
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") strikeAt(ref.current?.querySelector("[data-anvil]") ?? null, { count: 8, power: 0.6 });
      }}
      data-hot={touch && centred ? "true" : undefined}
      className="group/plate plate relative flex h-full flex-col overflow-hidden rounded-md transition-colors duration-500 hover:border-ember-700/70"
    >
      <m.span aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ background: light }} />

      {/* The face of the plate */}
      <div className={`relative overflow-hidden border-b border-ink-700 bg-ink-950 ${wide ? "aspect-[16/9] md:aspect-[5/2]" : "aspect-[16/10]"}`}>
        {entry.media.cover ? (
          <Image
            src={entry.media.cover}
            alt={`${entry.title} screenshot`}
            fill
            sizes={wide ? "(min-width: 1024px) 80rem, 100vw" : "(min-width: 1024px) 40rem, 100vw"}
            className="object-cover object-top opacity-80 grayscale-[0.4] transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/plate:scale-[1.03] group-data-[hot=true]/plate:scale-[1.03] group-hover/plate:opacity-100 group-data-[hot=true]/plate:opacity-100 group-hover/plate:grayscale-0 group-data-[hot=true]/plate:grayscale-0"
          />
        ) : (
          <>
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(${grain}deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 6px), radial-gradient(70% 90% at ${heatX}% 115%, rgba(244,87,13,0.16), transparent 60%), radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.035), transparent 70%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <p
                aria-hidden
                className={`font-stamp grid text-center leading-[0.85] [&>span]:col-start-1 [&>span]:row-start-1 ${
                  wide ? "text-[clamp(3.5rem,11vw,10rem)]" : "text-[clamp(3rem,7vw,6rem)]"
                }`}
              >
                <span className="text-sketch">{short}</span>
                <span className="text-molten opacity-0 transition-[clip-path,opacity] duration-700 ease-[cubic-bezier(0.6,0,0.3,1)] [clip-path:inset(100%_0_0_0)] group-hover/plate:opacity-100 group-data-[hot=true]/plate:opacity-100 group-hover/plate:[clip-path:inset(0_0_0_0)] group-data-[hot=true]/plate:[clip-path:inset(0_0_0_0)]">
                  {short}
                </span>
              </p>
            </div>
          </>
        )}

        {/* Heat rising from the bottom edge */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 translate-y-1/3 opacity-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/plate:translate-y-0 group-data-[hot=true]/plate:translate-y-0 group-hover/plate:opacity-100 group-data-[hot=true]/plate:opacity-100"
          style={{ background: "linear-gradient(0deg, rgba(244,87,13,0.38), rgba(244,87,13,0.06) 55%, transparent)" }}
        />
        <span data-anvil aria-hidden className="absolute bottom-0 left-1/2 h-px w-px" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="index-label rounded-sm bg-ink-950/80 px-2 py-1 text-cream-dim backdrop-blur">
            {entry.code}
          </span>
          {entry.hallmark ? (
            <span className="index-label rounded-sm border border-ember-600/50 bg-ink-950/80 px-2 py-1 text-ember-300 backdrop-blur">
              {entry.hallmark}
            </span>
          ) : null}
        </div>
      </div>

      {/* The spec */}
      <div className="relative z-20 flex flex-1 flex-col p-5 md:p-7">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-stamp text-stamp-md text-cream transition-colors duration-300 group-hover/plate:text-white-hot group-data-[hot=true]/plate:text-white-hot">
            {entry.title}
          </h3>
          <span className="index-label shrink-0 text-cream-faint">
            {entry.type} · {entry.year}
          </span>
        </div>
        <p className={`mt-3 text-[0.95rem] leading-relaxed text-cream-dim ${wide ? "max-w-[72ch]" : ""}`}>{entry.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6">
          <p className="font-mono text-[0.75rem] leading-relaxed text-cream-faint">{entry.stack.join(" · ")}</p>
          <span className="index-label ml-auto flex items-center gap-2 text-cream-dim transition-colors group-hover/plate:text-ember-400 group-data-[hot=true]/plate:text-ember-400">
            {cta}
            <span aria-hidden className="transition-transform duration-300 group-hover/plate:-translate-y-0.5 group-data-[hot=true]/plate:-translate-y-0.5 group-hover/plate:translate-x-0.5 group-data-[hot=true]/plate:translate-x-0.5">
              ↗
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}
