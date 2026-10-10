"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let instance: Lenis | null = null;

/** The live Lenis instance, or null (server, reduced motion, before mount). */
export function getLenis() {
  return instance;
}

/**
 * Weighted, eased wheel scrolling — the "flow" between sections. Touch keeps
 * native momentum (phones already scroll beautifully), and reduced-motion
 * visitors get plain native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.95,
      anchors: { offset: -72 },
      autoRaf: true,
    });
    instance = lenis;
    document.documentElement.style.scrollBehavior = "auto";
    return () => {
      lenis.destroy();
      instance = null;
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  // A new page starts at the top; hash links are left to the anchor handler.
  useEffect(() => {
    if (window.location.hash) return;
    instance?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
