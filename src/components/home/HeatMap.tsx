"use client";

import { useRef, useState, type PointerEvent } from "react";
import { useInView } from "framer-motion";
import type { Contributions, Day } from "@/lib/github";

// Cold ink to white-hot. Level 0 is a day the forge stayed cold.
const HEAT = ["#1a1916", "#6b2205", "#d2440a", "#ff8a4c", "#fff6ec"];
const GLOW = [
  "none",
  "none",
  "0 0 6px rgba(210,68,10,0.35)",
  "0 0 8px rgba(255,138,76,0.5)",
  "0 0 12px 1px rgba(244,87,13,0.85)",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// How many recent weeks fit: phones, tablets, then everything.
const PHONE = 20;
const TABLET = 36;

function visibility(i: number, total: number) {
  if (i < total - TABLET) return "max-lg:hidden";
  if (i < total - PHONE) return "max-sm:hidden";
  return "";
}

function fmt(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * A year of commits as a heat map. When it scrolls in, the year ignites from
 * the oldest week to the newest — each day flashes white and settles to how
 * hot it actually ran.
 */
export function HeatMap({ data }: { data: Contributions }) {
  const ref = useRef<HTMLDivElement>(null);
  const lit = useInView(ref, { once: true, amount: 0.35 });
  const [tip, setTip] = useState<{ day: Day; x: number; y: number; align: "left" | "center" | "right" } | null>(null);
  const W = data.weeks.length;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-date]");
    const box = ref.current;
    if (!cell || !box) return setTip(null);
    const day = data.weeks[Number(cell.dataset.w)]?.[Number(cell.dataset.d)];
    if (!day) return setTip(null);
    const r = cell.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const x = r.left - b.left + r.width / 2;
    // Keep the tooltip inside the map at either edge.
    const align = x < 90 ? "left" : x > b.width - 90 ? "right" : "center";
    setTip({ day, x, y: r.top - b.top, align });
  };

  // Month labels: on the first week whose opening day is in a new month.
  const months = data.weeks.map((week, i) => {
    const first = week.find(Boolean)?.date.slice(5, 7);
    const prev = data.weeks[i - 1]?.find(Boolean)?.date.slice(5, 7);
    return first && first !== prev ? MONTHS[Number(first) - 1] : "";
  });

  const s = data.stats;
  const stats = [
    { label: "Contributions · last year", value: data.total.toLocaleString("en-IN") },
    { label: "Days at the anvil", value: String(s.activeDays) },
    { label: "Longest streak", value: `${s.longestStreak}d` },
    { label: "Hottest day", value: s.best ? String(s.best.count) : "—", sub: s.best ? fmt(s.best.date) : undefined },
  ];

  return (
    <div>
      <dl className="mb-10 grid grid-cols-2 border-l border-t border-ink-700 md:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="border-b border-r border-ink-700 px-4 py-4 md:px-6 md:py-5">
            <dt className="micro-label text-cream-faint">{st.label}</dt>
            <dd className="font-stamp mt-2 text-[2rem] leading-none text-cream md:text-[2.6rem]">
              {st.value}
              {st.sub ? <span className="index-label ml-2 align-middle text-cream-faint">{st.sub}</span> : null}
            </dd>
          </div>
        ))}
      </dl>

      <div
        ref={ref}
        className="relative"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setTip(null)}
        role="img"
        aria-label={`${data.total} GitHub contributions in the last year, across ${s.activeDays} active days. Longest streak ${s.longestStreak} days.`}
      >
        {/* Months — the same column grid as the cells, one row tall. */}
        <div aria-hidden className="mb-2 grid grid-flow-col auto-cols-fr gap-x-[3px] sm:grid-cols-[2rem]">
          <span className="hidden sm:block" />
          {months.map((m, i) => (
            <span key={i} className={`micro-label h-4 min-w-0 overflow-visible whitespace-nowrap text-cream-faint ${visibility(i, W)}`}>
              {m}
            </span>
          ))}
        </div>

        {/* Days: seven rows, filled column by column, so labels and cells share rows. */}
        <div aria-hidden className="grid grid-flow-col grid-rows-7 auto-cols-fr gap-[3px] sm:grid-cols-[2rem]">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
            <span key={`l${i}`} className="micro-label hidden items-center leading-none text-cream-faint sm:flex">
              {d}
            </span>
          ))}
          {data.weeks.flatMap((week, w) =>
            Array.from({ length: 7 }, (_, d) => {
              const day = week[d];
              const vis = visibility(w, W);
              if (!day) return <span key={`${w}-${d}`} className={`aspect-square ${vis}`} />;
              const hot = day.level > 0;
              return (
                <span
                  key={`${w}-${d}`}
                  data-date={day.date}
                  data-w={w}
                  data-d={d}
                  data-level={day.level}
                  className={`aspect-square rounded-[2px] bg-ink-800 transition-transform duration-200 hover:scale-125 ${vis} ${
                    lit && hot ? "ignite" : ""
                  }`}
                  style={
                    lit && hot
                      ? ({
                          "--c": HEAT[day.level],
                          "--g": GLOW[day.level],
                          animationDelay: `${w * 14 + d * 6}ms`,
                        } as React.CSSProperties)
                      : undefined
                  }
                />
              );
            }),
          )}
        </div>

        {/* Tooltip */}
        {tip ? (
          <div
            className={`pointer-events-none absolute z-10 -translate-y-[calc(100%+10px)] ${tip.align === "left" ? "-translate-x-3" : tip.align === "right" ? "-translate-x-[calc(100%-12px)]" : "-translate-x-1/2"} whitespace-nowrap rounded-sm border border-ink-600 bg-ink-900 px-3 py-2 shadow-xl`}
            style={{ left: tip.x, top: tip.y }}
          >
            <p className="font-stamp text-[1.1rem] leading-none text-cream">
              {tip.day.count} {tip.day.count === 1 ? "contribution" : "contributions"}
            </p>
            <p className="index-label mt-1 text-cream-faint">{fmt(tip.day.date)}</p>
          </div>
        ) : null}

        {/* Legend */}
        <div aria-hidden className="mt-5 flex items-center justify-between gap-4">
          <a
            href={`https://github.com/${data.user}`}
            target="_blank"
            rel="noopener noreferrer"
            className="index-label tap u-draw text-cream-dim hover:text-cream"
          >
            github.com/{data.user} ↗
          </a>
          <span className="micro-label flex items-center gap-2 text-cream-faint">
            Cold
            {HEAT.map((c, i) => (
              <span key={c} className="h-3 w-3 rounded-[2px]" style={{ background: c, boxShadow: GLOW[i] }} />
            ))}
            White-hot
          </span>
        </div>
      </div>
    </div>
  );
}
