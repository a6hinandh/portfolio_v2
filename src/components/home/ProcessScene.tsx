"use client";

import { useId, useRef, useState } from "react";
import {
  animate,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { strike } from "@/components/forge/Sparks";

const STAGES = [
  { word: "Idea", line: "Every build starts as a sketch. Cheap to draw, easy to admire." },
  { word: "Heat", line: "Then it meets reality — real users, real data, real limits." },
  { word: "Strike", line: "Something breaks. Fix it. Strike again. That's where the learning is." },
  { word: "Quench", line: "Whatever survives hardens into instinct. It stays with you." },
  { word: "Ship", line: "Then it leaves the workshop. Nothing is finished until it's out." },
] as const;

// Scroll positions (0–1 across the scene) where the hammer lands.
const IMPACTS = [0.45, 0.51, 0.57];
// Bar proportions after each blow — it gets longer and thinner as it's worked.
const SY = [1, 0.8, 0.66, 0.55];
const SX = [1, 1.18, 1.32, 1.45];
// Hammer angle at each impact: lower each time, because the bar is thinner.
const HIT_ANGLE = [0, -1.7, -3];
const RAISED = 30;

// Geometry of the scene, in viewBox units.
const BAR = { cx: 410, base: 280, w: 200, h: 46 };
const PIVOT = { x: 720, y: 210 };

export function ProcessScene() {
  const reduce = useReducedMotion();
  if (reduce) return <StaticProcess />;
  return <LiveProcess />;
}

function LiveProcess() {
  const uid = useId().replace(/:/g, "");
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<SVGGElement>(null);
  const hammerRef = useRef<SVGGElement>(null);
  const flashRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastP = useRef(0);
  const [stage, setStage] = useState(0);
  const [hits, setHits] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // A light spring takes the jitter out of wheel scrolling without feeling laggy.
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.4 });

  // --- Layer opacities ---------------------------------------------------
  const sketch = useTransform(p, [0, 0.14, 0.24], [1, 1, 0]);
  const dull = useTransform(p, [0.14, 0.22, 0.3, 0.64, 0.72], [0, 1, 1, 1, 0]);
  const hot = useTransform(p, [0.2, 0.32, 0.6, 0.7], [0, 1, 1, 0]);
  const glow = useTransform(p, [0.2, 0.34, 0.6, 0.72], [0, 0.9, 0.75, 0]);
  const steel = useTransform(p, [0.62, 0.76], [0, 1]);
  const hammer = useTransform(p, [0.37, 0.41, 0.61, 0.65], [0, 1, 1, 0]);
  const steam = useTransform(p, [0.62, 0.7, 0.8, 0.86], [0, 1, 0.6, 0]);
  const steamY = useTransform(p, [0.62, 0.86], [10, -60]);
  const anvil = useTransform(p, [0.8, 0.9], [1, 0.12]);
  const frame = useTransform(p, [0.84, 0.95], [0, 1]);
  const ui = useTransform(p, [0.9, 0.97], [0, 1]);
  const mark = useTransform(p, [0.93, 0.97], [0, 1]);
  const markScale = useTransform(p, [0.93, 0.97], [1.8, 1]);
  const dims = useTransform(p, [0, 0.16, 0.24], [1, 1, 0]);
  const sceneGlow = useTransform(p, [0.15, 0.35, 0.62, 0.75], [0, 1, 0.8, 0]);

  // --- Readouts -----------------------------------------------------------
  const temp = useTransform(
    p,
    [0, 0.14, 0.32, 0.4, 0.6, 0.64, 0.76, 1],
    [22, 22, 1250, 1190, 980, 900, 64, 24],
  );
  const tempText = useTransform(temp, (t) => `${Math.round(t).toString().padStart(4, "0")}°C`);
  const progressBar = useTransform(p, [0, 1], [0, 1]);

  function impact(i: number) {
    const svg = svgRef.current;
    if (svg) {
      // Where the hammer meets the bar, in viewport pixels.
      const r = svg.getBoundingClientRect();
      const scale = r.width / 800;
      const topY = BAR.base - BAR.h * SY[i];
      strike({ x: r.left + BAR.cx * scale, y: r.top + topY * scale, count: 26, power: 1.25, spread: Math.PI * 1.1 });
      strike({ x: r.left + (BAR.cx - 60) * scale, y: r.top + topY * scale, count: 10, power: 0.9, angle: -Math.PI * 0.8 });
      strike({ x: r.left + (BAR.cx + 60) * scale, y: r.top + topY * scale, count: 10, power: 0.9, angle: -Math.PI * 0.2 });
    }
    if (flashRef.current) {
      flashRef.current.setAttribute("cy", String(BAR.base - BAR.h * SY[i]));
      animate(flashRef.current, { opacity: [0.9, 0], r: [10, 120] }, { duration: 0.5, ease: "easeOut" });
    }
    if (stageRef.current) {
      animate(stageRef.current, { x: [0, -5, 4, -2, 0], y: [0, 3, -2, 1, 0] }, { duration: 0.28 });
    }
  }

  // --- Transforms the SVG needs about a precise pivot ---------------------
  useMotionValueEvent(p, "change", (v) => {
    // Bar: squash at each impact, then lift off the anvil at the end.
    const n = IMPACTS.filter((t) => v >= t).length;
    const sy = SY[n];
    const sx = SX[n];
    const lift = v < 0.8 ? 0 : -Math.min(1, (v - 0.8) / 0.1) * 110;
    barRef.current?.setAttribute(
      "transform",
      `translate(${BAR.cx} ${BAR.base + lift}) scale(${sx} ${sy}) translate(${-BAR.cx} ${-BAR.base})`,
    );

    // Hammer: raised, then a fast drop onto each impact and a slower recovery.
    let angle = RAISED;
    IMPACTS.forEach((t, i) => {
      const down = 0.018; // scroll distance of the drop
      const up = 0.03; // and of the recovery
      if (v > t - down && v <= t) angle = RAISED + (HIT_ANGLE[i] - RAISED) * easeIn((v - (t - down)) / down);
      else if (v > t && v < t + up) angle = HIT_ANGLE[i] + (RAISED - HIT_ANGLE[i]) * easeOut((v - t) / up);
    });
    hammerRef.current?.setAttribute("transform", `rotate(${angle} ${PIVOT.x} ${PIVOT.y})`);

    // Impacts fire whichever way you scroll through them.
    const prev = lastP.current;
    IMPACTS.forEach((t, i) => {
      if ((prev < t && v >= t) || (prev > t && v <= t)) impact(i);
    });
    lastP.current = v;

    const s = Math.min(STAGES.length - 1, Math.floor(v * STAGES.length));
    setStage((cur) => (cur === s ? cur : s));
    setHits((cur) => (cur === n ? cur : n));
  });

  return (
    <section
      ref={sectionRef}
      data-stage="Process"
      aria-label="How a build happens"
      className="relative h-[520vh]"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        {/* Heat on the room, not just the metal. */}
        <m.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: sceneGlow,
            background:
              "radial-gradient(55% 55% at 62% 62%, rgba(244,87,13,0.2) 0%, rgba(154,50,8,0.08) 45%, transparent 75%)",
          }}
        />
        <m.div aria-hidden className="blueprint pointer-events-none absolute inset-0" style={{ opacity: dims }} />

        <div className="rail relative grid flex-1 grid-rows-[auto_1fr] gap-4 pb-10 pt-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:grid-rows-1 lg:items-center lg:gap-12">
          {/* Words ----------------------------------------------------- */}
          <div className="relative z-10">
            <p className="index-label mb-5 flex items-center gap-3 text-cream-faint">
              <span aria-hidden className="h-px w-8 bg-ember-500/70" />
              The process · how every build here was made
            </p>

            <ol className="mb-6 flex gap-1.5" aria-label="Stages">
              {STAGES.map((s, i) => (
                <li key={s.word} className="flex-1">
                  <span className="sr-only">{s.word}</span>
                  <span
                    aria-hidden
                    className={`block h-[3px] rounded-full transition-colors duration-500 ${
                      i < stage ? "bg-steel-400" : i === stage ? "bg-ember-500" : "bg-ink-700"
                    }`}
                  />
                  <span
                    aria-hidden
                    className={`micro-label mt-2 hidden transition-colors duration-500 sm:block ${
                      i === stage ? "text-ember-400" : "text-cream-faint"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")} {s.word}
                  </span>
                </li>
              ))}
            </ol>

            <div className="relative h-[8.5rem] sm:h-[10rem] lg:h-[15rem]" aria-live="polite">
              {STAGES.map((s, i) => (
                <m.div
                  key={s.word}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: i === stage ? 1 : 0,
                    y: i === stage ? 0 : i < stage ? -24 : 24,
                  }}
                  // The outgoing stage clears quickly so two words never sit on top of each other.
                  transition={i === stage ? { duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] } : { duration: 0.18 }}
                  aria-hidden={i !== stage}
                >
                  <p
                    className={`font-stamp text-stamp-xl ${
                      i === 0 ? "text-sketch" : i === 4 ? "text-forged" : i === 3 ? "text-steel-200" : "text-molten"
                    }`}
                  >
                    {s.word}
                  </p>
                  <p className="mt-3 max-w-[36ch] text-[0.95rem] leading-relaxed text-cream-dim lg:mt-5 lg:text-[1.05rem]">
                    {s.line}
                  </p>
                </m.div>
              ))}
            </div>

            {/* Instruments */}
            <dl className="mt-4 hidden max-w-sm grid-cols-3 border-l border-t border-ink-700 lg:grid">
              <Readout label="Temp">
                <m.span>{tempText}</m.span>
              </Readout>
              <Readout label="Strikes">
                {hits}/{IMPACTS.length}
              </Readout>
              <Readout label="Stage">{String(stage + 1).padStart(2, "0")}/05</Readout>
            </dl>
          </div>

          {/* The bench ------------------------------------------------- */}
          <m.div ref={stageRef} className="relative min-h-0 self-stretch lg:self-center">
            <svg
              ref={svgRef}
              viewBox="0 0 800 480"
              className="absolute left-[-30%] top-0 h-full w-[160%] sm:left-0 sm:w-full lg:relative lg:h-auto"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <linearGradient id={`${uid}-hot`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff6ec" />
                  <stop offset="0.35" stopColor="#ffb07a" />
                  <stop offset="0.7" stopColor="#f4570d" />
                  <stop offset="1" stopColor="#9a3208" />
                </linearGradient>
                <linearGradient id={`${uid}-dull`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d2440a" />
                  <stop offset="1" stopColor="#6b2205" />
                </linearGradient>
                <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e4e7ea" />
                  <stop offset="0.45" stopColor="#9aa1aa" />
                  <stop offset="1" stopColor="#4d525a" />
                </linearGradient>
                <linearGradient id={`${uid}-anvil`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#34312c" />
                  <stop offset="0.06" stopColor="#1f1d1a" />
                  <stop offset="1" stopColor="#0e0d0c" />
                </linearGradient>
                <filter id={`${uid}-blur`} x="-50%" y="-200%" width="200%" height="500%">
                  <feGaussianBlur stdDeviation="18" />
                </filter>
              </defs>

              {/* Anvil */}
              <m.g style={{ opacity: anvil }}>
                <path
                  d="M150 300 C 200 300 230 292 250 280 L 250 280 H 570 V 322 H 540 C 515 326 500 340 494 362 L 486 392 H 560 V 420 H 262 V 392 H 336 L 328 362 C 322 340 306 326 282 322 C 230 318 190 312 150 300 Z"
                  fill={`url(#${uid}-anvil)`}
                  stroke="#4a463f"
                  strokeWidth="1"
                />
                <path d="M252 281 H 568" stroke="#5a554c" strokeWidth="1.2" />
                <ellipse cx="410" cy="436" rx="240" ry="10" fill="#000" opacity="0.5" />
              </m.g>

              {/* Floor glow under the hot bar */}
              <m.ellipse
                cx={BAR.cx}
                cy={BAR.base - 20}
                rx="210"
                ry="40"
                fill="#f4570d"
                filter={`url(#${uid}-blur)`}
                style={{ opacity: glow }}
              />

              {/* Dimension lines for the sketch */}
              <m.g style={{ opacity: dims }} stroke="#f4570d" strokeOpacity="0.55" fill="none" strokeWidth="1">
                <path d="M310 216 H510 M310 210 V222 M510 210 V222" />
                <path d="M528 234 V280 M522 234 H534 M522 280 H534" />
                <text x="410" y="204" fill="#ff8a4c" stroke="none" fontSize="11" textAnchor="middle" fontFamily="monospace" letterSpacing="1.5">
                  200 × 46 · RAW STOCK
                </text>
              </m.g>

              {/* Ship: the finished piece, framed as the product it became */}
              <m.g style={{ opacity: frame }}>
                <m.rect
                  x="200"
                  y="64"
                  width="420"
                  height="248"
                  rx="10"
                  fill="#0e0d0c"
                  fillOpacity="0.85"
                  stroke="#f3efe8"
                  strokeOpacity="0.6"
                  strokeWidth="1.2"
                  style={{ pathLength: frame }}
                />
                <path d="M200 92 H620" stroke="#34312c" />
                {[220, 236, 252].map((cx, i) => (
                  <circle key={cx} cx={cx} cy="78" r="4" fill={i === 0 ? "#f4570d" : "#4a463f"} />
                ))}
                <rect x="290" y="72" width="240" height="12" rx="6" fill="#1a1916" />
              </m.g>
              {/* The workpiece */}
              <g ref={barRef}>
                <m.g style={{ opacity: glow }}>
                  <rect
                    x={BAR.cx - BAR.w / 2}
                    y={BAR.base - BAR.h}
                    width={BAR.w}
                    height={BAR.h}
                    rx="3"
                    fill="#ff8a4c"
                    filter={`url(#${uid}-blur)`}
                  />
                </m.g>
                <m.rect
                  x={BAR.cx - BAR.w / 2}
                  y={BAR.base - BAR.h}
                  width={BAR.w}
                  height={BAR.h}
                  rx="3"
                  fill={`url(#${uid}-dull)`}
                  style={{ opacity: dull }}
                />
                <m.rect
                  x={BAR.cx - BAR.w / 2}
                  y={BAR.base - BAR.h}
                  width={BAR.w}
                  height={BAR.h}
                  rx="3"
                  fill={`url(#${uid}-hot)`}
                  style={{ opacity: hot }}
                />
                <m.rect
                  x={BAR.cx - BAR.w / 2}
                  y={BAR.base - BAR.h}
                  width={BAR.w}
                  height={BAR.h}
                  rx="3"
                  fill={`url(#${uid}-steel)`}
                  style={{ opacity: steel }}
                />
                <m.rect
                  x={BAR.cx - BAR.w / 2}
                  y={BAR.base - BAR.h}
                  width={BAR.w}
                  height={BAR.h}
                  rx="3"
                  fill="none"
                  stroke="#f3efe8"
                  strokeOpacity="0.55"
                  strokeDasharray="6 5"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: sketch }}
                />
              </g>

              {/* Impact flash */}
              <circle ref={flashRef} cx={BAR.cx} cy={BAR.base - BAR.h} r="10" fill="none" stroke="#fff6ec" strokeWidth="2" opacity="0" />

              {/* Steam on the quench */}
              <m.g style={{ opacity: steam, y: steamY }} fill="none" stroke="#c9ced4" strokeLinecap="round">
                {[300, 360, 420, 480, 530].map((x, i) => (
                  <path
                    key={x}
                    d={`M${x} 228 c -14 -22 14 -36 0 -58 c -12 -20 10 -32 2 -50`}
                    strokeWidth={i % 2 ? 1.5 : 2.5}
                    strokeOpacity={0.35 - i * 0.03}
                  />
                ))}
              </m.g>

              {/* Hammer */}
              <m.g style={{ opacity: hammer }}>
                <g ref={hammerRef} transform={`rotate(${RAISED} ${PIVOT.x} ${PIVOT.y})`}>
                  <rect x="445" y="206" width="290" height="9" rx="4" fill="#6b4a2e" />
                  <rect x="445" y="206" width="290" height="3" rx="1.5" fill="#8a6440" />
                  <rect x="375" y="186" width="70" height="48" rx="4" fill="#3a3732" stroke="#5a554c" />
                  <rect x="375" y="186" width="70" height="7" rx="3" fill="#4a463f" />
                </g>
              </m.g>

              <m.g style={{ opacity: ui }}>
                <rect x="265" y="114" width="150" height="10" rx="3" fill="#f3efe8" opacity="0.8" />
                <rect x="265" y="132" width="96" height="7" rx="3" fill="#837e74" />
                <rect x="265" y="208" width="200" height="6" rx="3" fill="#4a463f" />
                <rect x="265" y="220" width="160" height="6" rx="3" fill="#4a463f" />
                <rect x="265" y="244" width="90" height="46" rx="5" fill="#1a1916" stroke="#34312c" />
                <rect x="365" y="244" width="90" height="46" rx="5" fill="#1a1916" stroke="#34312c" />
                <rect x="465" y="244" width="90" height="22" rx="11" fill="#f4570d" />
              </m.g>
              <m.g style={{ opacity: mark, scale: markScale }}>
                <circle cx="572" cy="122" r="24" fill="none" stroke="#f4570d" strokeWidth="1.5" />
                <circle cx="572" cy="122" r="19" fill="none" stroke="#f4570d" strokeWidth="0.75" strokeDasharray="2 2" />
                <text x="572" y="127" textAnchor="middle" fill="#ff8a4c" fontSize="14" fontWeight="700" fontFamily="monospace">
                  AB
                </text>
              </m.g>
            </svg>
          </m.div>
        </div>

        {/* Whole-scene progress, along the bottom edge. */}
        <m.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-steel-600 via-ember-500 to-white-hot"
          style={{ scaleX: progressBar }}
        />
      </div>
    </section>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-r border-ink-700 px-3 py-2.5">
      <dt className="micro-label text-cream-faint">{label}</dt>
      <dd className="mt-1 font-mono text-[0.9rem] tabular-nums text-cream">{children}</dd>
    </div>
  );
}

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/** Reduced motion: the same five stages, laid out flat. */
function StaticProcess() {
  return (
    <section data-stage="Process" className="section-y border-t border-ink-700">
      <div className="rail">
        <p className="index-label mb-10 text-cream-faint">The process · how every build here was made</p>
        <ol className="grid gap-px overflow-hidden rounded-sm border border-ink-700 bg-ink-700 md:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s.word} className="bg-ink-950 p-6">
              <p className="micro-label text-cream-faint">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-stamp mt-2 text-stamp-md text-cream">{s.word}</p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-cream-dim">{s.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
