import Link from "next/link";
import { ForgeBackdrop } from "@/components/forge/ForgeBackdrop";
import { Reveal } from "@/components/motion";
import { navLinks } from "@/lib/nav";

export default function NotFound() {
  return (
    <div className="blueprint relative isolate flex min-h-[90svh] items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3"
        style={{ background: "radial-gradient(50% 80% at 50% 110%, rgba(244,87,13,0.2), transparent 70%)" }}
      />
      <ForgeBackdrop density={0.6} intensity={0.8} className="-z-10" />

      <div className="rail py-32">
        <Reveal>
          <p className="index-label mb-6 flex items-center gap-3 text-ember-500">
            <span aria-hidden className="h-px w-8 bg-ember-500/70" />
            Err · 404
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-stamp text-[clamp(6rem,3rem+18vw,18rem)] leading-[0.8] text-sketch">404</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-stamp mt-6 text-stamp-md text-cream">
            This one <span className="text-molten">hasn&apos;t been forged yet.</span>
          </p>
          <p className="mt-4 max-w-[46ch] text-cream-dim">
            It&apos;s still a sketch on the bench, or it never existed. Try one of these instead.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <nav aria-label="Recovery" className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className="index-label tap rounded-sm bg-ember-500 px-5 font-semibold text-ink-950 hover:bg-ember-400">
              Back to the workshop
            </Link>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="index-label tap rounded-sm border border-ink-600 px-5 text-cream hover:border-cream-faint"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>
    </div>
  );
}
