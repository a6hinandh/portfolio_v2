"use client";

import { useRef } from "react";
import { m, useScroll, useSpring, useTransform } from "framer-motion";
import type { TimelineEntry } from "@/lib/content";

const KIND: Record<TimelineEntry["kind"], string> = {
  education: "Education",
  role: "Role",
  milestone: "Milestone",
};

/**
 * The path, oldest at the top, read the way it happened. A line of molten
 * metal runs down as you scroll; each entry flares white-hot as the heat
 * reaches it and then cools — but keeps its mark. Nothing goes back to cold.
 */
export function HeatRecord({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const top = useTransform(p, (v) => `${v * 100}%`);

  return (
    <ol ref={ref} className="relative overflow-x-clip md:overflow-x-visible">
      {/* The rail: cold track, then the hot run with a bright leading bead. */}
      <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-ink-700 md:left-1/2" />
      <m.span
        aria-hidden
        className="absolute left-[6px] top-0 w-[3px] origin-top rounded-full md:left-[calc(50%-1px)]"
        style={{
          height: "100%",
          scaleY: p,
          background: "linear-gradient(180deg, #4d525a 0%, #8a919b 30%, #9a3208 70%, #f4570d 92%, #fff6ec 100%)",
        }}
      />
      <m.span
        aria-hidden
        className="absolute left-[8px] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white-hot md:left-1/2"
        style={{ top, boxShadow: "0 0 18px 6px rgba(244,87,13,0.7), 0 0 4px 1px #fff6ec" }}
      />

      {entries.map((e, i) => {
        const right = i % 2 === 1;
        return (
          <li key={e.code} className="relative grid pb-14 pl-10 last:pb-0 md:grid-cols-2 md:gap-16 md:pl-0 md:pb-20">
            {/* The mark: flares, then settles to a cooled ember ring. */}
            <m.span
              aria-hidden
              className="absolute left-[8px] top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 md:left-1/2"
              initial={{ backgroundColor: "#0e0d0c", borderColor: "#34312c", scale: 1 }}
              whileInView={{
                backgroundColor: ["#0e0d0c", "#fff6ec", "#f4570d", "#3a1203"],
                borderColor: ["#34312c", "#fff6ec", "#f4570d", "#9a3208"],
                scale: [1, 1.6, 1.1, 1],
              }}
              viewport={{ once: true, margin: "0px 0px -35% 0px" }}
              transition={{ duration: 1.4, times: [0, 0.12, 0.45, 1] }}
            />

            <m.div
              className={right ? "md:col-start-2" : "md:text-right"}
              initial={{ opacity: 0, x: right ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "0px 0px -30% 0px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className={`index-label flex flex-wrap items-center gap-x-3 gap-y-1 text-cream-faint ${right ? "" : "md:justify-end"}`}>
                <span className="text-ember-500">{e.period}</span>
                <span aria-hidden className="h-px w-4 bg-ink-600" />
                <span>{KIND[e.kind]}</span>
              </p>
              <h3 className="font-stamp mt-3 text-stamp-md text-cream">{e.title}</h3>
              <p className="mt-1 text-[0.95rem] text-cream-dim">{e.org}</p>
              <p className={`mt-4 max-w-[46ch] text-[0.95rem] leading-relaxed text-cream-dim ${right ? "" : "md:ml-auto"}`}>
                {e.summary}
              </p>
              {e.stack ? (
                <p className="mt-4 font-mono text-[0.72rem] text-cream-faint">{e.stack.join(" · ")}</p>
              ) : null}
            </m.div>
          </li>
        );
      })}
    </ol>
  );
}
