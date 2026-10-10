"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Ember = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  alpha: number;
  life: number;
  maxLife: number;
  hot: boolean;
};

type Options = {
  /** Particle density multiplier. 1 = the tuned default. */
  density?: number;
  /** Where the heat source sits, as a fraction of the canvas. */
  source?: { x: number; y: number };
  /** Overall opacity of the whole field. */
  intensity?: number;
};

/**
 * The forge itself: embers lifting off a heat source, drifting, cooling, dying.
 *
 * Canvas 2D rather than WebGL — at this particle count it is a fraction of the
 * cost and needs no library. The whole thing idles at zero when the tab is
 * hidden, when it scrolls out of view, or when the user prefers reduced motion.
 */
export function ForgeBackdrop({
  className = "",
  density = 1,
  source = { x: 0.5, y: 1 },
  intensity = 1,
}: Options & { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  // Read tuning through a ref so changing props never restarts the simulation.
  // Written in an effect, not during render — refs are not render-safe state.
  const opts = useRef({ density, source, intensity });
  useEffect(() => {
    opts.current = { density, source, intensity };
  }, [density, source, intensity]);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let embers: Ember[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    let last = performance.now();
    let visible = true;
    // Pointer parts the embers slightly — presence without a cursor gimmick.
    let pointerX = -9999;
    let pointerY = -9999;

    const spawn = (seeded: boolean): Ember => {
      const { source: src } = opts.current;
      // Embers originate along a wide band at the heat source, not a point.
      const spread = width * 0.55;
      const ox = width * src.x + (Math.random() - 0.5) * spread;
      const oy = height * src.y + Math.random() * 40;
      const maxLife = 5 + Math.random() * 7;
      const hot = Math.random() < 0.16;
      return {
        x: seeded ? Math.random() * width : ox,
        y: seeded ? Math.random() * height : oy,
        r: hot ? 1.1 + Math.random() * 1.5 : 0.4 + Math.random() * 1.1,
        vy: 10 + Math.random() * 26,
        vx: (Math.random() - 0.5) * 6,
        sway: 8 + Math.random() * 20,
        swaySpeed: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        alpha: (hot ? 0.4 : 0.16) + Math.random() * 0.35,
        life: seeded ? Math.random() * maxLife : 0,
        maxLife,
        hot,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      if (width === 0 || height === 0) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density scales with area but is hard-capped so phones never suffer.
      const base = Math.round((width * height) / 16000);
      const count = Math.max(14, Math.min(92, Math.round(base * opts.current.density)));
      embers = Array.from({ length: count }, () => spawn(true));
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const globalAlpha = opts.current.intensity;

      for (const e of embers) {
        e.life += dt;
        if (e.life > e.maxLife || e.y < -20) {
          Object.assign(e, spawn(false));
          continue;
        }

        e.phase += e.swaySpeed * dt;
        e.y -= e.vy * dt;
        e.x += e.vx * dt;

        // Gentle repulsion from the pointer, falling off over ~140px.
        const dx = e.x - pointerX;
        const dy = e.y - pointerY;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 19600) {
          const dist = Math.sqrt(dist2) || 1;
          const push = (1 - dist / 140) * 26 * dt;
          e.x += (dx / dist) * push;
          e.y += (dy / dist) * push;
        }

        const x = e.x + Math.sin(e.phase) * e.sway * 0.5;
        // Fade in as it leaves the source, fade out across its lifetime.
        const t = e.life / e.maxLife;
        const fadeIn = Math.min(1, e.life * 3);
        const fadeOut = 1 - t * t;
        const flicker = 0.78 + 0.22 * Math.sin(e.phase * 4.5);
        const a = e.alpha * fadeIn * fadeOut * flicker * globalAlpha;
        if (a <= 0.004) continue;

        // Hot embers get a soft halo; cool ones are a single cheap dot.
        if (e.hot) {
          const halo = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.r * 5);
          halo.addColorStop(0, `rgba(255, 214, 176, ${a})`);
          halo.addColorStop(0.35, `rgba(244, 87, 13, ${a * 0.5})`);
          halo.addColorStop(1, "rgba(244, 87, 13, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(x, e.y, e.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.hot
          ? `rgba(255, 236, 214, ${a})`
          : `rgba(244, 87, 13, ${a})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => cancelAnimationFrame(raf);

    const onVisibility = () => {
      if (document.hidden || !visible) stop();
      else start();
    };

    const onPointerMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };

    // Stop burning cycles the moment the field scrolls off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        onVisibility();
      },
      { rootMargin: "120px" },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    resize();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
