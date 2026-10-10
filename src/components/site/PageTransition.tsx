"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { animate, m, useMotionValue, useTransform } from "framer-motion";
import { strike } from "@/components/forge/Sparks";
import { navLinks } from "@/lib/nav";

const COVER = 0.48;
const REVEAL = 0.7;
const EASE_IN: [number, number, number, number] = [0.6, 0.05, 0.35, 1];
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const LABELS: Record<string, string> = {
  "/": "Home",
  ...Object.fromEntries(navLinks.map((l) => [l.href, l.label])),
};

/**
 * Between pages the screen is re-forged: a slab of dark metal with a molten
 * edge rises over the old page, throwing sparks as it goes, names where you're
 * headed, then lifts away to show the new one.
 *
 * Internal link clicks are caught in the capture phase and marked handled,
 * which tells Next's <Link> to skip its own navigation (its onClick handlers
 * still run). The router push happens once the slab is fully over the screen.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const y = useMotionValue(100); // percent: 100 = below, 0 = covering, -100 = above
  const transform = useTransform(y, (v) => `translateY(${v}%)`);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const state = useRef<"idle" | "covering" | "covered">("idle");

  // Catch internal navigations.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (including in-page anchors): nothing to transition.
      if (url.pathname === window.location.pathname) return;
      if (state.current !== "idle") {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      state.current = "covering";
      setLabel(LABELS[url.pathname] ?? url.pathname.split("/").filter(Boolean).pop() ?? "");
      setActive(true);
      router.prefetch(url.pathname);

      // Sparks come off the molten edge as it climbs the screen.
      let lastBurst = 0;
      y.set(100);
      animate(y, 0, {
        duration: COVER,
        ease: EASE_IN,
        onUpdate: (v) => {
          const now = performance.now();
          if (now - lastBurst > 70 && v < 85 && v > 5) {
            lastBurst = now;
            const edge = (window.innerHeight * v) / 100;
            strike({ x: Math.random() * window.innerWidth, y: edge, count: 8, power: 0.9 });
          }
        },
        onComplete: go,
      });
      // Animation frames stop in a background tab; navigation must not wait on them.
      const fallback = window.setTimeout(go, COVER * 1000 + 250);
      function go() {
        window.clearTimeout(fallback);
        if (state.current !== "covering") return;
        y.set(0);
        state.current = "covered";
        router.push(url.pathname + url.search + url.hash);
      }
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router, y]);

  // The new page is in: lift the slab away.
  useEffect(() => {
    if (state.current === "idle") return;
    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      if (state.current === "covering") {
        // Navigation beat the cover animation; wait for it to land first.
        requestAnimationFrame(reveal);
        return;
      }
      animate(y, -100, {
        duration: REVEAL,
        delay: 0.12,
        ease: EASE_OUT,
        onComplete: () => {
          state.current = "idle";
          setActive(false);
          y.set(100);
        },
      });
    };
    reveal();
    return () => {
      cancelled = true;
    };
  }, [pathname, y]);

  return (
    <div
      aria-hidden
      className={`no-print pointer-events-none fixed inset-0 z-[88] overflow-hidden ${active ? "" : "invisible"}`}
    >
      <m.div className="absolute inset-0" style={{ transform }}>
        {/* The slab */}
        <div className="absolute inset-0 bg-ink-950" />
        <div className="blueprint absolute inset-0 opacity-60" />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "radial-gradient(60% 80% at 50% 100%, rgba(244,87,13,0.22), transparent 70%)" }}
        />

        {/* Molten edges, top and bottom — whichever one is crossing the screen is lit. */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-ember-700 via-white-hot to-ember-700 shadow-[0_0_24px_6px_rgba(244,87,13,0.65)]" />
        <div className="absolute inset-x-0 top-0 h-24 -translate-y-full bg-gradient-to-t from-ember-500/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-ember-700 via-white-hot to-ember-700 shadow-[0_0_24px_6px_rgba(244,87,13,0.65)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 translate-y-full bg-gradient-to-b from-ember-500/25 to-transparent" />

        {/* Where you're headed */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="index-label mb-4 text-ember-500">Forging</p>
          <p className="font-stamp text-molten text-[clamp(3.5rem,2rem+8vw,9rem)] leading-none">{label}</p>
        </div>
      </m.div>
    </div>
  );
}
