import { Reveal } from "@/components/motion";
import type { SkillGroup } from "@/lib/content";

// The heat ramp, coolest to hottest. A tool picked up for more builds runs hotter.
const RAMP = ["#4a463f", "#6b2205", "#9a3208", "#d2440a", "#f4570d", "#ff8a4c", "#ffb07a", "#ffd4b0", "#fff6ec"];

/**
 * Tools on the wall, each showing its wear. The meter is the number of builds
 * it was used in — written out too, so colour never carries the claim alone.
 */
export function ToolWall({ groups }: { groups: SkillGroup[] }) {
  const max = Math.max(...groups.flatMap((g) => g.skills.map((s) => s.builds)));

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4">
      {groups.map((g, gi) => (
        <Reveal key={g.label} delay={(gi % 4) * 0.06} className="break-inside-avoid">
          <section className="plate rounded-md p-5">
            <header className="mb-4 flex items-center justify-between border-b border-ink-700 pb-3">
              <h3 className="index-label text-cream">{g.label}</h3>
              <span className="micro-label text-cream-faint">{g.skills.length} tools</span>
            </header>
            <ul className="space-y-2.5">
              {[...g.skills]
                .sort((a, b) => b.builds - a.builds)
                .map((s) => (
                  <li key={s.name} className="group/tool grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
                    <span className="truncate text-[0.9rem] text-cream-dim transition-colors group-hover/tool:text-cream">
                      {s.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span aria-hidden className="flex gap-[2px]">
                        {Array.from({ length: max }, (_, i) => (
                          <span
                            key={i}
                            className="h-2.5 w-[5px] rounded-[1px] transition-transform duration-300 group-hover/tool:scale-y-125"
                            style={{
                              background: i < s.builds ? RAMP[Math.min(RAMP.length - 1, i)] : "#1a1916",
                              transitionDelay: `${i * 18}ms`,
                            }}
                          />
                        ))}
                      </span>
                      <span className="w-7 text-right font-mono text-[0.72rem] tabular-nums text-cream-faint">
                        ×{s.builds}
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        </Reveal>
      ))}
    </div>
  );
}
