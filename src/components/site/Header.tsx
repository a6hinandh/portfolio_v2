"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { EASE } from "@/components/motion";
import { navLinks } from "@/lib/nav";
import { getLenis } from "@/components/site/SmoothScroll";

export function Header({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const heat = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 16);
    setHidden(y > prev && y > 240);
  });

  // Close the menu on navigation, including back/forward.
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  // While the menu is open it's a dialog: scroll lock, Escape, focus kept inside.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    getLenis()?.stop();
    const toggle = toggleRef.current;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [toggle, ...panelRef.current.querySelectorAll<HTMLElement>("a")].filter(Boolean) as HTMLElement[];
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <m.header
        className="no-print fixed inset-x-0 top-0 z-[80]"
        initial={false}
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div
          className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${
            scrolled || open ? "border-b border-ink-700/80 bg-ink-950/80 backdrop-blur-md" : "border-b border-transparent"
          }`}
        >
          <div className="rail flex h-16 items-center justify-between gap-6">
            <Link href="/" className="group/mark tap gap-3" aria-label={`${name}, home`}>
              <Monogram />
              <span className="font-stamp text-[1.2rem] leading-none text-cream">{name}</span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`index-label tap relative px-3.5 transition-colors ${
                    isActive(l.href) ? "text-cream" : "text-cream-dim hover:text-cream"
                  }`}
                >
                  {l.label}
                  {isActive(l.href) ? (
                    <span aria-hidden className="absolute inset-x-3.5 bottom-2.5 h-px bg-ember-500" />
                  ) : null}
                </Link>
              ))}
              <a
                href="#contact"
                className="index-label tap ml-3 rounded-sm border border-ember-600/70 bg-ember-500/10 px-4 text-ember-200 transition-colors hover:bg-ember-500 hover:text-ink-950"
              >
                Start a build
              </a>
            </nav>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="menu"
              onClick={() => setOpen((o) => !o)}
              className="index-label tap -mr-2 gap-3 px-2 text-cream md:hidden"
            >
              {open ? "Close" : "Menu"}
              <span aria-hidden className="relative h-3 w-5">
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0.5"}`} />
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
              </span>
            </button>
          </div>
        </div>
        {/* The page's temperature: how far into the workshop you are. */}
        <m.div
          aria-hidden
          className="h-[2px] origin-left bg-gradient-to-r from-ember-800 via-ember-500 to-white-hot"
          style={{ scaleX: heat }}
        />
      </m.header>

      <AnimatePresence>
        {open ? (
          <m.div
            id="menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[70] flex flex-col bg-ink-950 pt-24 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
              style={{ background: "radial-gradient(80% 70% at 50% 100%, rgba(244,87,13,0.28), transparent 70%)" }}
            />
            <nav aria-label="Mobile" className="rail relative flex flex-col">
              {[{ label: "Home", href: "/" }, ...navLinks, { label: "Contact", href: "#contact" }].map((l, i) => (
                <m.div
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 + i * 0.05, ease: EASE }}
                  className="border-b border-ink-700"
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between py-4"
                  >
                    <span className={`font-stamp text-[3rem] leading-none ${isActive(l.href) && l.href !== "#contact" ? "text-molten" : "text-cream"}`}>
                      {l.label}
                    </span>
                    <span className="index-label text-cream-faint">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                </m.div>
              ))}
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** A maker's mark: initials in a struck square, which warms on hover. */
function Monogram() {
  return (
    <span
      aria-hidden
      className="relative flex h-8 w-8 items-center justify-center rounded-[3px] border border-ink-500 bg-ink-900 font-mono text-[0.68rem] font-bold tracking-tight text-cream transition-colors duration-300 group-hover/mark:border-ember-500 group-hover/mark:text-ember-300"
    >
      AB
      <span className="absolute -bottom-px -right-px h-1.5 w-1.5 bg-ember-500" />
    </span>
  );
}
