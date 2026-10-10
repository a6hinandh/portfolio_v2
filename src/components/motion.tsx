"use client";

import {
  LazyMotion,
  MotionConfig,
  animate,
  domAnimation,
  m,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

/* ---------------------------------------------------------------------------
   Easings. One curve does almost all the work: fast out, long settle.
   `STRIKE` is reserved for hammer-like moments — a fast impact, hard stop.
------------------------------------------------------------------------- */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_FORGE = [0.16, 1, 0.3, 1] as const;
export const EASE_STRIKE = [0.6, 0, 0.2, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/* ---------------------------------------------------------------------------
   Reveal — the workhorse. Fires once, on `transform`/`opacity` only.
------------------------------------------------------------------------- */

type Direction = "up" | "down" | "left" | "right" | "none";

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
};

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 14,
  duration = 0.7,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  className?: string;
  as?: "div" | "span" | "li";
}) {
  const Tag = as === "span" ? m.span : as === "li" ? m.li : m.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...offsetFor(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   Stagger / Item — a parent orchestrates, children inherit the beat.
   `whileInView` on the parent means one observer serves the whole group.
------------------------------------------------------------------------- */

export function Stagger({
  children,
  className,
  interval = 0.07,
  delay = 0,
  trigger = "mount",
}: {
  children: ReactNode;
  className?: string;
  interval?: number;
  delay?: number;
  trigger?: "mount" | "view";
}) {
  const orchestration: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: interval, delayChildren: delay } },
  };
  const activation =
    trigger === "mount"
      ? { animate: "visible" as const }
      : {
          whileInView: "visible" as const,
          viewport: { once: true, margin: "0px 0px -10% 0px" },
        };

  return (
    <m.div className={className} initial="hidden" variants={orchestration} {...activation}>
      {children}
    </m.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function Item({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const Tag = as === "li" ? m.li : as === "span" ? m.span : m.div;
  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   WordReveal — words rise out of an overflow clip, one after another.
   Segments that touch without whitespace stay welded into a single word so
   punctuation and the ember underline never wrap away from their word.
------------------------------------------------------------------------- */

export function WordReveal({
  segments,
  className,
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
  trigger = "mount",
}: {
  segments: { text: string; className?: string }[];
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  trigger?: "mount" | "view";
}) {
  type Part = { text: string; className?: string };
  const words: Part[][] = [];
  let current: Part[] = [];
  for (const seg of segments) {
    for (const chunk of seg.text.split(/(\s+)/)) {
      if (chunk === "") continue;
      if (/\s/.test(chunk)) {
        if (current.length) words.push(current);
        current = [];
      } else {
        current.push({ text: chunk, className: seg.className });
      }
    }
  }
  if (current.length) words.push(current);

  return (
    <span className={className}>
      {words.map((parts, i) => {
        const transition = { duration, ease: EASE, delay: delay + i * stagger };
        const activation =
          trigger === "mount"
            ? { animate: { y: 0, opacity: 1 } }
            : {
                whileInView: { y: 0, opacity: 1 },
                viewport: { once: true, margin: "0px 0px -12% 0px" },
              };
        return (
          <span
            key={i}
            className="inline-block overflow-hidden pb-[0.14em] align-bottom"
            style={{ marginBottom: "-0.14em" }}
          >
            <m.span
              className="inline-block whitespace-pre"
              initial={{ y: "112%", opacity: 0 }}
              transition={transition}
              {...activation}
            >
              {parts.map((part, pi) => (
                <span key={pi} className={part.className}>
                  {part.text}
                </span>
              ))}
              {i < words.length - 1 ? " " : ""}
            </m.span>
          </span>
        );
      })}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   MaskReveal — a clip-path wipe. Used for images and media frames, where a
   translate would show a seam against the page.
------------------------------------------------------------------------- */

export function MaskReveal({
  children,
  className,
  delay = 0,
  duration = 1,
  from = "bottom",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  from?: "bottom" | "left";
}) {
  const hidden =
    from === "left" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)";
  return (
    <m.div
      className={className}
      initial={{ clipPath: hidden, opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </m.div>
  );
}

/* ---------------------------------------------------------------------------
   Parallax — scroll-linked drift. Springs, never scroll listeners.
------------------------------------------------------------------------- */

export function Parallax({
  children,
  range = 60,
  className,
}: {
  children: ReactNode;
  range?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [range / 2, -range / 2]);
  const y = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.5 });
  return (
    <m.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </m.div>
  );
}

/* ---------------------------------------------------------------------------
   Counter — animates the numeric part of strings like "40%", "1,200+", "3.2s".
------------------------------------------------------------------------- */

export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || reduce) return;
    const match = value.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
    if (!match || !ref.current) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = (num.split(".")[1] ?? "").length;
    const grouped = num.includes(",");
    const controls = animate(0, target, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => {
        if (!ref.current) return;
        const text = grouped ? Math.round(v).toLocaleString("en-US") : v.toFixed(decimals);
        ref.current.textContent = prefix + text + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Magnetic — the element leans toward the pointer. Mouse only: on touch the
   pointer position is the tap position, so the effect is noise.
------------------------------------------------------------------------- */

export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.span
      className={`inline-block ${className ?? ""}`}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </m.span>
  );
}

/* ---------------------------------------------------------------------------
   useSpotlight — an ember glow that tracks the pointer inside a surface.
   Returns handlers plus a ready-made radial-gradient background string.
   The glow's opacity springs to 0 on leave so nothing snaps.
------------------------------------------------------------------------- */

export function useSpotlight(radius = 320, intensity = 0.1) {
  const reduce = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const opacity = useSpring(0, { stiffness: 200, damping: 30 });

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (reduce || e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
      opacity.set(1);
    },
    [opacity, reduce, x, y],
  );

  const onPointerLeave = useCallback(() => opacity.set(0), [opacity]);

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, rgba(244,87,13,${intensity}), transparent 72%)`;

  return { onPointerMove, onPointerLeave, background, opacity, enabled: !reduce };
}

/* ---------------------------------------------------------------------------
   Tilt — a few degrees of perspective on pointer. Enough to feel physical,
   little enough that text stays crisp. Mouse only, springs back on leave.
------------------------------------------------------------------------- */

export function Tilt({
  children,
  className,
  max = 5,
  scale = 1,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const config = { stiffness: 180, damping: 22, mass: 0.5 };
  const rx = useSpring(0, config);
  const ry = useSpring(0, config);
  const s = useSpring(1, config);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
    s.set(scale);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
    s.set(1);
  };

  return (
    <m.div
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{
        ...style,
        transformPerspective: 900,
        rotateX: rx,
        rotateY: ry,
        scale: s,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </m.div>
  );
}

/* ---------------------------------------------------------------------------
   useDrawnLine — a hairline that draws itself left-to-right when it enters
   view. Used as the seam under every section header.
------------------------------------------------------------------------- */

export function Seam({
  className = "",
  hot = false,
  delay = 0,
}: {
  className?: string;
  hot?: boolean;
  delay?: number;
}) {
  return (
    <m.span
      aria-hidden
      className={`block h-px w-full origin-left ${hot ? "seam-hot" : "seam-x"} ${className}`}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    />
  );
}

/* ---------------------------------------------------------------------------
   useScrollHeat — maps a section's scroll pass to a 0..1 "heat" value.
   Consumers drive opacity/scale from it; nothing subscribes to scroll events.
------------------------------------------------------------------------- */

export function useScrollHeat(ref: React.RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const heat = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  return useSpring(heat, { stiffness: 80, damping: 26 });
}

