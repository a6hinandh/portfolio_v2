"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

export type SparkBurst = {
  /** Viewport coordinates. */
  x: number;
  y: number;
  /** Number of sparks. */
  count?: number;
  /** Initial speed multiplier. */
  power?: number;
  /** Fan direction in radians (default straight up), and its width. */
  angle?: number;
  spread?: number;
};

const EVENT = "forge:spark";

/** Throw sparks from anywhere in the app. A no-op on the server. */
export function strike(burst: SparkBurst) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SparkBurst>(EVENT, { detail: burst }));
}

/** Sparks at the centre-bottom of an element. */
export function strikeAt(el: Element | null, burst: Omit<SparkBurst, "x" | "y"> = {}) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  strike({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...burst });
}

/**
 * One fixed canvas for every spark on the site. Every click is a hammer blow:
 * a small fan of sparks that arcs, falls under gravity, and goes dark. Nothing
 * is drawn, and the loop stays parked, while no spark is alive.
 */
export function Sparks() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let sparks: Spark[] = [];
    let raf = 0;
    let running = false;
    let last = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      sparks = sparks.filter((s) => s.life < s.maxLife);
      for (const s of sparks) {
        s.life += dt;
        s.vy += 1400 * dt; // gravity
        s.vx *= 1 - 1.6 * dt; // drag
        const px = s.x;
        const py = s.y;
        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const t = s.life / s.maxLife;
        // White-hot at birth, cooling through orange to a dull red.
        const g = Math.round(246 - 170 * t);
        const b = Math.round(220 * (1 - t) * (1 - t));
        const a = 1 - t * t;
        ctx.strokeStyle = `rgba(255, ${g}, ${b}, ${a})`;
        ctx.lineWidth = s.size * (1 - t * 0.6);
        ctx.beginPath();
        ctx.moveTo(px, py);
        // Stretch the streak along its velocity so it reads as motion.
        ctx.lineTo(s.x + s.vx * 0.012, s.y + s.vy * 0.012);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      if (sparks.length) raf = requestAnimationFrame(tick);
      else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const emit = ({ x, y, count = 14, power = 1, angle = -Math.PI / 2, spread = Math.PI * 0.9 }: SparkBurst) => {
      // A hard cap keeps a click-happy visitor from building a bonfire.
      if (sparks.length > 400) return;
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const speed = (260 + Math.random() * 520) * power;
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          maxLife: 0.35 + Math.random() * 0.55,
          size: 0.8 + Math.random() * 1.6,
        });
      }
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const onSpark = (e: Event) => emit((e as CustomEvent<SparkBurst>).detail);
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      emit({ x: e.clientX, y: e.clientY, count: 9, power: 0.7 });
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener(EVENT, onSpark);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener(EVENT, onSpark);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [reduce]);

  if (reduce) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[95] h-full w-full"
    />
  );
}
