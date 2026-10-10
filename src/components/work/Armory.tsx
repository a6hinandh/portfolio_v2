"use client";

import { useMemo, useState } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import type { ProjectCard } from "@/lib/content";

/**
 * Every build, as a rack you can pull pieces off. A row heats from the left
 * when you're on it; opening it shows the spec. Filters only ever narrow.
 */
export function Armory({ entries }: { entries: ProjectCard[] }) {
  const types = useMemo(() => ["All", ...Array.from(new Set(entries.map((e) => e.type)))], [entries]);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const shown = filter === "All" ? entries : entries.filter((e) => e.type === filter);

  return (
    <div>
      <div role="group" aria-label="Filter by type" className="mb-6 flex flex-wrap gap-2">
        {types.map((t) => {
          const count = t === "All" ? entries.length : entries.filter((e) => e.type === t).length;
          const active = t === filter;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(t)}
              className={`index-label tap gap-2 rounded-sm border px-3.5 transition-colors duration-300 ${
                active
                  ? "border-ember-500 bg-ember-500/10 text-ember-300"
                  : "border-ink-700 text-cream-dim hover:border-ink-500 hover:text-cream"
              }`}
            >
              {t}
              <span className={active ? "text-ember-500" : "text-cream-faint"}>{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="border-t border-ink-700">
        {shown.map((e, i) => {
          const isOpen = open === e.code;
          return (
            <m.li
              key={`${filter}-${e.code}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.035, 0.3), ease: [0.22, 1, 0.36, 1] }}
              className="group/row relative border-b border-ink-700"
            >
              {/* Heat that runs in from the left edge */}
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-0 origin-left bg-gradient-to-r from-ember-500/[0.14] via-ember-500/[0.04] to-transparent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen ? "scale-x-100" : "scale-x-0 group-hover/row:scale-x-100"
                }`}
              />
              <span
                aria-hidden
                className={`absolute left-0 top-0 h-full w-[2px] bg-ember-500 transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
                }`}
              />

              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`spec-${e.code}`}
                onClick={() => setOpen(isOpen ? null : e.code)}
                className="relative grid w-full grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 py-5 text-left md:grid-cols-[5.5rem_minmax(0,1fr)_9rem_4rem_2rem] md:py-6"
              >
                <span className="index-label text-cream-faint transition-colors group-hover/row:text-ember-500">
                  {e.code.replace("LDG-", "#")}
                </span>
                <span className="font-stamp truncate text-[clamp(1.35rem,1rem+1.5vw,2.15rem)] leading-none text-cream transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/row:translate-x-2">
                  {e.title}
                </span>
                <span className="index-label hidden text-cream-dim md:block">{e.type}</span>
                <span className="index-label hidden text-cream-faint md:block">{e.year}</span>
                <span
                  aria-hidden
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm transition-all duration-300 ${
                    isOpen ? "rotate-45 border-ember-500 text-ember-400" : "border-ink-600 text-cream-dim"
                  }`}
                >
                  +
                </span>
              </button>

              <div
                id={`spec-${e.code}`}
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-5 pb-7 md:grid-cols-[5.5rem_minmax(0,1fr)_auto] md:gap-x-4">
                    <span className="hidden md:block" />
                    <div>
                      <p className="max-w-[68ch] leading-relaxed text-cream-dim">{e.summary}</p>
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {e.stack.map((s) => (
                          <li key={s} className="rounded-sm border border-ink-700 px-2 py-1 font-mono text-[0.72rem] text-cream-dim">
                            {s}
                          </li>
                        ))}
                      </ul>
                      <p className="index-label mt-4 text-cream-faint md:hidden">
                        {e.type} · {e.year}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      {e.live ? (
                        <a
                          href={e.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={isOpen ? 0 : -1}
                          className="index-label tap rounded-sm bg-ember-500 px-4 font-semibold text-ink-950 hover:bg-ember-400"
                        >
                          Live ↗
                        </a>
                      ) : null}
                      {e.hasPage ? (
                        <Link
                          href={`/work/${e.slug}`}
                          tabIndex={isOpen ? 0 : -1}
                          className="index-label tap rounded-sm bg-cream px-4 font-semibold text-ink-950 hover:bg-white-hot"
                        >
                          Read the build →
                        </Link>
                      ) : null}
                      {e.repo ? (
                        <a
                          href={e.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={isOpen ? 0 : -1}
                          className="index-label tap rounded-sm border border-ink-600 px-4 text-cream hover:border-ember-500"
                        >
                          Source ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </m.li>
          );
        })}
      </ul>
    </div>
  );
}
