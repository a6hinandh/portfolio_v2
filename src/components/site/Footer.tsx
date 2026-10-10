"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { animate, m, useReducedMotion } from "framer-motion";
import { ForgeBackdrop } from "@/components/forge/ForgeBackdrop";
import { strike, strikeAt } from "@/components/forge/Sparks";
import { EASE } from "@/components/motion";
import { navLinks } from "@/lib/nav";
import type { Profile } from "@/lib/content";

type Ember = { ch: string; x: number; y: number; r: number };

const EXAMPLES = [
  "a tool that turns lecture notes into flashcards",
  "an app that finds a quiet study spot on campus",
  "a dashboard for a hackathon this weekend",
  "an AI agent that reads my inbox for deadlines",
];

/**
 * The furnace. Everything on the site came out of here, and this is where a
 * new idea goes in: type it, throw it in, and it becomes an email to me.
 */
export function Footer({ site }: { site: Pick<Profile, "name" | "email" | "location" | "version" | "socials"> }) {
  const reduce = useReducedMotion();
  const [idea, setIdea] = useState("");
  const [burning, setBurning] = useState<Ember[] | null>(null);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const furnaceRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLButtonElement>(null);

  // A typed-out placeholder, so the field shows what kind of thing belongs in it.
  useEffect(() => {
    if (reduce) return;
    let ex = 0;
    let ch = 0;
    let deleting = false;
    let t = 0;
    const tick = () => {
      const word = EXAMPLES[ex];
      if (!deleting) {
        ch++;
        if (ch > word.length) {
          deleting = true;
          t = window.setTimeout(tick, 1800);
          return;
        }
      } else {
        ch--;
        if (ch === 0) {
          deleting = false;
          ex = (ex + 1) % EXAMPLES.length;
        }
      }
      setHint(word.slice(0, ch));
      t = window.setTimeout(tick, deleting ? 22 : 48);
    };
    t = window.setTimeout(tick, 600);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = idea.trim();
    if (!text) {
      if (formRef.current) animate(formRef.current, { x: [0, -10, 9, -6, 4, 0] }, { duration: 0.4 });
      inputRef.current?.focus();
      return;
    }
    // Each letter gets its own fall, decided once here rather than on every render.
    setBurning(
      Array.from(text.slice(0, 70)).map((ch) => ({
        ch,
        y: 260 + Math.random() * 160,
        x: (Math.random() - 0.5) * 80,
        r: (Math.random() - 0.5) * 140,
      })),
    );
    setIdea("");

    const open = () => {
      const subject = encodeURIComponent(`An idea to build: ${text.slice(0, 80)}`);
      const body = encodeURIComponent(`Hi ${site.name},\n\nI've got an idea:\n\n${text}\n\n`);
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      setSent(true);
      setBurning(null);
    };

    if (reduce) return open();

    // The idea falls into the fire, the fire flares, sparks go up.
    window.setTimeout(() => {
      if (furnaceRef.current) {
        animate(furnaceRef.current, { scale: [1, 1.18, 1], opacity: [0.85, 1, 0.85] }, { duration: 1.2, ease: EASE });
      }
      const r = mouthRef.current?.getBoundingClientRect();
      if (r) {
        for (let i = 0; i < 5; i++) {
          window.setTimeout(
            () => strike({ x: r.left + r.width * (0.2 + Math.random() * 0.6), y: r.top, count: 22, power: 1.4, spread: Math.PI * 0.7 }),
            i * 90,
          );
        }
      }
    }, 650);
    window.setTimeout(open, 1500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      strikeAt(copyRef.current, { count: 24, power: 1, spread: Math.PI * 1.6 });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <footer id="contact" data-stage="Furnace" className="no-print relative isolate mt-auto overflow-hidden border-t border-ink-700">
      {/* The furnace mouth */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center">
        <div ref={furnaceRef} className="h-[44rem] w-[min(100rem,190vw)] translate-y-[60%]">
          <div
            className="furnace-breathe h-full w-full rounded-[50%]"
            style={{
              background:
                "radial-gradient(closest-side, #fff6ec 0%, #ffb07a 9%, #f4570d 24%, rgba(154,50,8,0.55) 46%, rgba(58,18,3,0.25) 68%, transparent 100%)",
            }}
          />
        </div>
      </div>
      <ForgeBackdrop density={1.2} intensity={1} source={{ x: 0.5, y: 1.02 }} className="-z-10" />

      <div className="rail relative pb-10 pt-24 md:pt-36">
        <div className="mx-auto max-w-5xl text-center">
          <m.p
            className="index-label mb-8 inline-flex items-center gap-3 text-ember-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span aria-hidden className="h-px w-8 bg-ember-500/70" />
            The furnace
            <span aria-hidden className="h-px w-8 bg-ember-500/70" />
          </m.p>

          {/* The observer sits on the heading: each line starts fully clipped by its
              mask, and a clipped element never registers as in view. */}
          <m.h2
            className="font-stamp text-stamp-xl text-cream"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ staggerChildren: 0.12 }}
          >
            {["Every build here", "started as one sentence."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <m.span
                  className={`block ${i === 1 ? "text-molten" : ""}`}
                  variants={{ hidden: { y: "105%" }, show: { y: "0%" } }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  {line}
                </m.span>
              </span>
            ))}
          </m.h2>

          <m.p
            className="mx-auto mt-6 max-w-[44ch] text-[1.05rem] text-cream-dim"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Write yours down and throw it in. It lands in my inbox, and we&apos;ll see what it turns into.
          </m.p>

          {/* The idea ------------------------------------------------------ */}
          <div className="relative mx-auto mt-10 max-w-2xl">
            <form
              ref={formRef}
              onSubmit={submit}
              className="group/idea flex items-center gap-2 rounded-full border border-cream/20 bg-ink-950/70 p-1.5 pl-6 backdrop-blur-md transition-colors focus-within:border-ember-500/80"
            >
              <label htmlFor="idea" className="sr-only">
                Your idea
              </label>
              <span aria-hidden className="font-mono text-[0.85rem] text-ember-500">
                →
              </span>
              <input
                ref={inputRef}
                id="idea"
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  setSent(false);
                }}
                placeholder={reduce ? EXAMPLES[0] : hint || " "}
                maxLength={240}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-3 text-left text-[1rem] text-cream outline-none placeholder:text-cream-faint md:text-[1.1rem]"
              />
              <button
                type="submit"
                className="index-label tap shrink-0 gap-2 rounded-full bg-ember-500 px-5 font-semibold text-ink-950 transition-colors hover:bg-ember-400 md:px-6"
              >
                <span className="hidden sm:inline">Throw it in</span>
                <span className="sm:hidden">Send</span>
                <span aria-hidden>↓</span>
              </button>
            </form>

            {/* The letters falling into the fire */}
            {burning ? (
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center overflow-visible px-12">
                <span className="whitespace-pre text-[1.1rem] text-cream">
                  {burning.map((l, i) => (
                    <m.span
                      key={i}
                      className="inline-block"
                      initial={{ y: 0, opacity: 1, rotate: 0, color: "#f3efe8" }}
                      animate={{
                        y: l.y,
                        x: l.x,
                        rotate: l.r,
                        opacity: [1, 1, 0],
                        color: ["#f3efe8", "#ffb07a", "#f4570d"],
                      }}
                      transition={{ duration: 1, delay: i * 0.012, ease: [0.55, 0, 0.8, 0.4] }}
                    >
                      {l.ch}
                    </m.span>
                  ))}
                </span>
              </div>
            ) : null}

            <p aria-live="polite" className="index-label mt-4 min-h-5 text-cream-dim">
              {sent ? "It's in the fire — your mail app should be open. Hit send and I'll reply." : null}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <span className="index-label text-cream-faint">Or straight to</span>
            <a href={`mailto:${site.email}`} className="u-drawn font-display text-[1.05rem] font-medium text-cream hover:text-ember-300">
              {site.email}
            </a>
            <button
              ref={copyRef}
              type="button"
              onClick={copy}
              className="index-label tap rounded-full border border-cream/20 px-4 text-cream-dim transition-colors hover:border-cream/60 hover:text-cream"
            >
              <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Where the idea lands */}
        <div ref={mouthRef} aria-hidden className="mx-auto mt-24 h-px w-2/3 max-w-xl md:mt-32" />

        <div className="grid gap-6 border-t border-cream/15 pt-8 md:grid-cols-3">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="index-label tap u-draw text-cream-dim hover:text-cream">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-x-6 gap-y-1 md:justify-center">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="index-label tap u-draw text-cream-dim hover:text-cream"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
          <p className="index-label tap text-cream-dim md:justify-end">
            Forged by hand · {site.location} · {site.version}
          </p>
        </div>
      </div>
    </footer>
  );
}
