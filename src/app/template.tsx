"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "@/components/motion";

/**
 * Route entrance. Next remounts this per navigation, so every page arrives the
 * same way: a short fade (no transform, so sticky scenes inside keep working), no longer than a blink. Anything heavier
 * here would sit between the visitor and the content on every single click.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </m.div>
  );
}
