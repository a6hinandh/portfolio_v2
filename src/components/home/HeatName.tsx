"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { strike } from "@/components/forge/Sparks";

const LAND = 0.25; // first letter lands
const STEP = 0.055; // between letters
const RISE = 0.75; // each letter's travel

/**
 * The name, set to exactly fill its rail at every width. Letters arrive hot and
 * cool one after another; afterwards the visitor's cursor (or finger) is the
 * heat source, and wherever it rests the metal glows again.
 */
export function HeatName({ text, label }: { text: string; label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [size, setSize] = useState<number | null>(null);

  // --- Fit to width ------------------------------------------------------
  useLayoutEffect(() => {
    const box = boxRef.current;
    const probe = measureRef.current;
    if (!box || !probe) return;
    const fit = () => {
      const natural = probe.getBoundingClientRect().width; // at 100px
      if (natural > 0) setSize((box.clientWidth / natural) * 100 * 0.995);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  // --- Pointer heat ---------------------------------------------------------
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.55);
  const heat = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 90, damping: 18, mass: 0.6 });
  const sh = useSpring(heat, { stiffness: 60, damping: 20 });
  const px = useTransform(sx, (v) => `${v * 100}%`);
  const py = useTransform(sy, (v) => `${v * 100}%`);
  // Sized in em, so the hot spot is always about one letter across.
  const mask = useMotionTemplate`radial-gradient(circle 0.95em at ${px} ${py}, #000 0%, rgba(0,0,0,0.5) 40%, transparent 100%)`;

  useEffect(() => {
    if (reduce) return;
    const box = boxRef.current;
    if (!box) return;
    let idle: AnimationPlaybackControls | null = null;
    let idleTimer = 0;

    // Until someone touches it, the heat drifts slowly along the bar.
    const wander = () => {
      idle?.stop();
      heat.set(0.55);
      y.set(0.6);
      idle = animate(x, [0.08, 0.92], { duration: 7, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" });
    };
    const startTimer = window.setTimeout(wander, (LAND + STEP * text.length + RISE + 0.8) * 1000);

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const inside = e.clientY > r.top - r.height * 0.6 && e.clientY < r.bottom + r.height * 0.6;
      if (!inside) {
        heat.set(0);
        return;
      }
      idle?.stop();
      idle = null;
      x.set((e.clientX - r.left) / r.width);
      y.set((e.clientY - r.top) / r.height);
      heat.set(1);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(wander, 2600);
    };
    const onLeave = () => heat.set(0);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      idle?.stop();
      window.clearTimeout(startTimer);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, text.length, heat, x, y]);

  // The strike: as the last letter lands, sparks come off the base of the word.
  useEffect(() => {
    if (reduce) return;
    const id = window.setTimeout(() => {
      const box = boxRef.current;
      if (!box || window.scrollY > 200) return;
      const r = box.getBoundingClientRect();
      [0.1, 0.3, 0.5, 0.7, 0.9].forEach((f, i) =>
        window.setTimeout(() => strike({ x: r.left + r.width * f, y: r.bottom - r.height * 0.14, count: 14, power: 1.1 }), i * 70),
      );
    }, (LAND + STEP * (text.length - 1) + RISE * 0.7) * 1000);
    return () => window.clearTimeout(id);
  }, [reduce, text.length]);

  const letters = Array.from(text);
  const style = size ? { fontSize: `${size}px` } : undefined;

  return (
    <div ref={boxRef} className="relative w-full">
      {/* Measuring probe: the same word at 100px, invisible. */}
      <span
        ref={measureRef}
        aria-hidden
        className="font-stamp pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap text-[100px] leading-none tracking-[-0.055em]"
      >
        {text}
      </span>

      <h1
        aria-label={label}
        className={`font-stamp relative whitespace-nowrap pb-[0.06em] leading-[0.86] tracking-[-0.055em] transition-opacity duration-300 ${size ? "opacity-100" : "opacity-0"}`}
        style={style}
      >
        <span aria-hidden className="relative block">
          {letters.map((ch, i) => (
            <span key={i} className="relative inline-block overflow-hidden pb-[0.08em] align-bottom">
              <m.span
                className="relative inline-grid [&>span]:col-start-1 [&>span]:row-start-1"
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: RISE, delay: LAND + i * STEP, ease: [0.2, 0.9, 0.25, 1] }}
              >
                <span className="text-forged">{ch}</span>
                <m.span
                  className="text-molten"
                  style={{ filter: "drop-shadow(0 0 0.12em rgba(244,87,13,0.55))" }}
                  initial={reduce ? false : { opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 1.3, delay: LAND + i * STEP + RISE * 0.8, ease: "easeOut" }}
                >
                  {ch}
                </m.span>
              </m.span>
            </span>
          ))}
        </span>

        {/* The heat that follows the cursor. Same glyphs, masked to a hot spot. */}
        {!reduce ? (
          <m.span
            aria-hidden
            className="text-molten pointer-events-none absolute inset-x-0 top-0 block"
            style={{
              opacity: sh,
              maskImage: mask,
              WebkitMaskImage: mask,
              filter: "drop-shadow(0 0 0.14em rgba(244,87,13,0.6))",
            }}
          >
            {letters.map((ch, i) => (
              <span key={i} className="inline-block pb-[0.08em] align-bottom">
                {ch}
              </span>
            ))}
          </m.span>
        ) : null}
      </h1>
    </div>
  );
}
