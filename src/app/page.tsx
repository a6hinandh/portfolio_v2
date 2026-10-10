import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ProcessScene } from "@/components/home/ProcessScene";
import { HeatRecord } from "@/components/home/HeatRecord";
import { ToolWall } from "@/components/home/ToolWall";
import { Hallmarks } from "@/components/home/Hallmarks";
import { HeatMap } from "@/components/home/HeatMap";
import { getContributions } from "@/lib/github";
import { SectionHead } from "@/components/forge/SectionHead";
import { ForgedPlate } from "@/components/work/ForgedPlate";
import { MaskReveal, Reveal } from "@/components/motion";
import { getAchievements, getProfile, getProjects, getSkills, getTimeline, toCard } from "@/lib/content";

export default async function Home() {
  const site = getProfile();
  const ledger = getProjects().map(toCard);
  const path = getTimeline();
  const skillGroups = getSkills();
  const beyond = getAchievements();
  const story = site.story;
  const contributions = await getContributions(site.githubUser);
  const featured = ledger.filter((e) => e.featured);
  const hackathons = ledger.filter((e) => e.type === "Hackathon").length;
  const tools = new Set(skillGroups.flatMap((g) => g.skills.map((s) => s.name))).size;
  const firstYear = Math.min(...path.map((p) => Number(p.period.match(/\d{4}/)?.[0] ?? 9999)));

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.fullName,
    email: `mailto:${site.email}`,
    url: site.url || undefined,
    jobTitle: site.role,
    sameAs: site.socials.map((s) => s.href),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />

      <Hero
        site={site}
        readouts={[
          { label: "Builds", value: String(ledger.length).padStart(2, "0") },
          { label: "Hacks", value: String(hackathons).padStart(2, "0") },
          { label: "Tools", value: String(tools) },
          { label: "Since", value: String(firstYear) },
        ]}
      />

      <ProcessScene />

      {/* 01 — Off the anvil ---------------------------------------------- */}
      <section id="work" data-stage="Work" className="section-y relative border-t border-ink-700">
        <div className="rail">
          <SectionHead
            code="01 · Off the anvil"
            title="Things I've"
            hot="forged"
            aside="Shipped, broken, fixed, and shipped again. Each one taught me something the last one couldn't."
            href="/work"
            hrefLabel={`All ${ledger.length} builds`}
          />
          <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
            {featured.map((entry, i) => (
              <Reveal key={entry.code} delay={(i % 2) * 0.08} className={i === 0 ? "lg:col-span-2" : ""}>
                <ForgedPlate entry={entry} wide={i === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee of everything else on the rack ------------------------- */}
      <div aria-hidden className="overflow-hidden border-y border-ink-700 bg-ink-900 py-5">
        <div className="marquee flex w-max gap-10">
          {[...ledger, ...ledger].map((e, i) => (
            <span key={i} className="font-stamp flex items-center gap-10 text-[2.25rem] leading-none text-sketch">
              {e.title}
              <span className="h-2 w-2 rotate-45 bg-ember-500" />
            </span>
          ))}
        </div>
      </div>

      {/* 02 — The heat record -------------------------------------------- */}
      <section id="path" data-stage="Path" className="section-y relative">
        <div className="rail">
          <SectionHead
            code="02 · The heat record"
            title="Every stage"
            hot="left a mark"
            aside="Education, roles, and the builds in between, in the order they happened."
          />
          <HeatRecord entries={[...path].reverse()} />
        </div>
      </section>

      {/* 03 — A year at the anvil (live from GitHub) ----------------------- */}
      {contributions ? (
        <section data-stage="Year" className="section-y relative border-t border-ink-700">
          <div className="rail">
            <SectionHead
              code="03 · A year at the anvil"
              title="Every square is a day."
              hot="Hot ones, I was building."
              aside="Pulled live from GitHub and refreshed twice a day."
            />
            <HeatMap data={contributions} />
          </div>
        </section>
      ) : null}

      {/* 04 — The tool wall ---------------------------------------------- */}
      <section data-stage="Tools" className="section-y relative border-t border-ink-700 bg-ink-990">
        <div className="rail">
          <SectionHead
            code="04 · The tool wall"
            title="Picked up"
            hot="by building"
            aside="Every tool here was learned on a real build. The meter shows how many builds it went into."
          />
          <ToolWall groups={skillGroups} />
        </div>
      </section>

      {/* 05 — Hallmarks -------------------------------------------------- */}
      <section data-stage="Marks" className="section-y relative border-t border-ink-700">
        <div className="rail">
          <SectionHead
            code="05 · Hallmarks"
            title="Stamped"
            hot="on the work"
            href="/about"
            hrefLabel="The full record"
          />
          <Hallmarks entries={beyond} />
        </div>
      </section>

      {/* 06 — The smith -------------------------------------------------- */}
      <section data-stage="Smith" className="section-y relative border-t border-ink-700">
        <div className="rail grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Reveal>
              <p className="index-label mb-5 flex items-center gap-3 text-ember-500">
                <span aria-hidden className="h-px w-8 bg-ember-500/70" />
                06 · The smith
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="font-stamp text-stamp-lg text-cream">
                Hi, I&apos;m {site.name}.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-[56ch] text-[1.05rem] leading-[1.75] text-cream-dim">{story[0]}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <Link href="/about" className="group/link index-label tap mt-6 gap-2 text-cream-dim hover:text-cream">
                <span className="u-draw pb-1">The longer story</span>
                <span aria-hidden className="text-ember-500 transition-transform duration-300 group-hover/link:translate-x-1">
                  →
                </span>
              </Link>
            </Reveal>
          </div>

          <MaskReveal className="relative mx-auto w-full max-w-sm lg:mr-0">
            <figure className="group/photo relative aspect-[4/5] overflow-hidden rounded-md border border-ink-700 bg-ink-900">
              <Image
                src="/portrait.jpeg"
                alt={`${site.fullName} portrait`}
                fill
                sizes="(min-width: 640px) 24rem, 100vw"
                className="object-cover grayscale contrast-[1.08] transition-[filter,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/photo:scale-[1.03] group-hover/photo:grayscale-0"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-700 group-hover/photo:opacity-60"
                style={{ background: "linear-gradient(10deg, rgba(244,87,13,0.65) 0%, transparent 60%)" }}
              />
              <figcaption className="index-label absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink-950/90 to-transparent p-4 pt-12 text-cream-dim">
                <span>{site.location}</span>
                <span className="text-ember-400">At the anvil</span>
              </figcaption>
            </figure>
          </MaskReveal>
        </div>
      </section>
    </>
  );
}
