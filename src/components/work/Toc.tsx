"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { EASE } from "@/components/motion";

/**
 * The case-study rail. Sections are numbered, matching the index grammar used
 * everywhere else, and the active one is marked by a short ember tick rather
 * than a filled block — the same redline-annotation logic as the rest of the
 * site.
 */
export function Toc({ items }: { items: { id: string; title: string }[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Track the topmost heading currently inside the reading band, so
        // scrolling up selects the right section instead of the last one seen.
        const inBand = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (inBand[0]) setActiveId(inBand[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Case study sections">
      <p className="index-label mb-5 text-cream-faint">Sections</p>
      <ul className="space-y-0.5 border-l border-ink-700">
        {items.map((item, i) => {
          const active = activeId === item.id;
          return (
            <li key={item.id} className="relative">
              {active ? (
                <m.span
                  aria-hidden
                  className="absolute -left-px top-0 h-full w-px bg-ember-500"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              ) : null}
              <a
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                className={`flex items-baseline gap-3 py-1.5 pl-4 pr-2 text-[0.8125rem] leading-snug transition-colors duration-300 ${
                  active ? "text-cream" : "text-cream-faint hover:text-cream-dim"
                }`}
              >
                <span
                  className={`font-mono text-[0.625rem] tabular-nums transition-colors duration-300 ${
                    active ? "text-ember-500" : "text-cream-faint"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
