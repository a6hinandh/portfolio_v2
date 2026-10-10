import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/forge/PageHero";
import { SectionHead } from "@/components/forge/SectionHead";
import { Hallmarks } from "@/components/home/Hallmarks";
import { MaskReveal, Reveal } from "@/components/motion";
import { getAchievements, getCertifications, getEducation, getPrinciples, getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "The story, education, certifications, and principles behind the builds.",
};

export default function AboutPage() {
  const site = getProfile();
  const story = site.story;
  const values = getPrinciples();
  const education = getEducation();
  const beyond = getAchievements();
  const certifications = getCertifications();
  // Every certificate and event photo dropped into public/achievements/<name>/.
  const wall = beyond.flatMap((a) =>
    [a.media.cover, ...a.media.gallery].filter((src): src is string => Boolean(src)).map((src) => ({ src, a })),
  );
  return (
    <>
      <PageHero code="The smith" title="About" />

      {/* The story, told in layers ------------------------------------- */}
      <section className="section-y">
        <div className="rail grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
          <ol className="space-y-14">
            {story.map((beat, i) => (
              <Reveal key={i} as="li" delay={i * 0.06}>
                <div className="grid gap-4 md:grid-cols-[5rem_minmax(0,1fr)]">
                  <p className="font-stamp text-[3rem] leading-none text-sketch">{String(i + 1).padStart(2, "0")}</p>
                  <p
                    className={
                      i === 0
                        ? "font-display text-display-md font-medium tracking-tight text-cream"
                        : "max-w-[62ch] text-[1.05rem] leading-[1.8] text-cream-dim"
                    }
                  >
                    {beat}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <MaskReveal delay={0.1} className="lg:sticky lg:top-28 lg:self-start">
            <figure className="group/photo">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-ink-700 bg-ink-900">
                <Image
                  src="/portrait.jpeg"
                  alt={`${site.fullName} portrait`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 24rem, 100vw"
                  className="object-cover grayscale contrast-[1.08] transition-[filter,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/photo:scale-[1.03] group-hover/photo:grayscale-0"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                  style={{ background: "linear-gradient(10deg, rgba(244,87,13,0.6) 0%, transparent 60%)" }}
                />
              </div>
              <figcaption className="index-label mt-4 flex items-center gap-3 text-cream-faint">
                <span aria-hidden className="h-px w-5 bg-ember-500/60" />
                {site.fullName} · {site.location}
              </figcaption>
            </figure>
          </MaskReveal>
        </div>
      </section>

      {/* Principles ----------------------------------------------------- */}
      <section className="section-y border-t border-ink-700 bg-ink-990">
        <div className="rail">
          <SectionHead code="01 · Principles" title="How I" hot="work" />
          <div className="grid gap-px overflow-hidden rounded-md border border-ink-700 bg-ink-700 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08} className="h-full">
                <div className="group/val relative h-full bg-ink-950 p-7 md:p-9">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-ember-600 to-ember-300 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/val:scale-x-100"
                  />
                  <p className="font-stamp text-[4rem] leading-none text-sketch transition-colors duration-500 group-hover/val:text-ember-500/30">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-stamp mt-6 text-[1.65rem] leading-[1.05] text-cream">{v.title}</h3>
                  <p className="mt-4 leading-relaxed text-cream-dim">{v.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Education ------------------------------------------------------ */}
      <section className="section-y border-t border-ink-700">
        <div className="rail">
          <SectionHead code="02 · Education" title="Where the" hot="theory comes from" />
          <Reveal>
            <div className="plate rounded-md p-6 md:p-10">
              <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                  <h3 className="font-stamp text-stamp-md text-cream">{education.degree}</h3>
                  <p className="mt-2 text-cream-dim">{education.university}</p>
                  <p className="mt-1 text-[0.95rem] text-cream-faint">{education.specialization}</p>
                </div>
                <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-sm border border-ink-700 bg-ink-700">
                  <div className="bg-ink-900 px-5 py-4">
                    <dt className="micro-label text-cream-faint">CGPA</dt>
                    <dd className="font-stamp mt-1 text-[2.25rem] leading-none text-ember-400">
                      {education.cgpa.split("/")[0].trim()}
                      <span className="text-[1.1rem] text-cream-faint"> / {education.cgpa.split("/")[1]?.trim()}</span>
                    </dd>
                  </div>
                  <div className="bg-ink-900 px-5 py-4">
                    <dt className="micro-label text-cream-faint">Period</dt>
                    <dd className="font-stamp mt-1 text-[2.25rem] leading-none text-cream">{education.period.replace(/\s/g, "")}</dd>
                  </div>
                </dl>
              </div>
              <div className="mt-10 border-t border-ink-700 pt-6">
                <p className="index-label mb-4 text-cream-faint">Coursework</p>
                <ul className="flex flex-wrap gap-2">
                  {education.coursework.map((c) => (
                    <li key={c} className="rounded-sm border border-ink-700 px-2.5 py-1.5 text-[0.85rem] text-cream-dim">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Hallmarks ------------------------------------------------------- */}
      <section className="section-y border-t border-ink-700 bg-ink-990">
        <div className="rail">
          <SectionHead code="03 · Hallmarks" title="Community" hot="& wins" />
          <Hallmarks entries={beyond} />
        </div>
      </section>

      {/* The workshop wall — appears once there are photos to show ------- */}
      {wall.length > 0 ? (
        <section className="section-y border-t border-ink-700">
          <div className="rail">
            <SectionHead code="03b · The workshop wall" title="From the" hot="floor" />
            <ul className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>li]:mb-3">
              {wall.map(({ src, a }, i) => (
                <Reveal key={src} as="li" delay={Math.min(i * 0.04, 0.3)} className="break-inside-avoid">
                  <figure className="group/photo relative overflow-hidden rounded-md border border-ink-700 bg-ink-900">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary sizes, unknown dimensions */}
                    <img
                      src={src}
                      alt={`${a.title}, ${a.org}`}
                      loading="lazy"
                      className="w-full grayscale-[0.5] transition-[filter,transform] duration-700 group-hover/photo:scale-[1.03] group-hover/photo:grayscale-0"
                    />
                    <figcaption className="index-label absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-3 pt-10 text-cream-dim">
                      {a.org} · {a.period}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Certifications -------------------------------------------------- */}
      <section className="section-y border-t border-ink-700">
        <div className="rail">
          <SectionHead code="04 · Certifications" title="Formal" hot="training" />
          <ul className="border-t border-ink-700">
            {certifications.map((c, i) => (
              <Reveal
                key={c.code}
                as="li"
                delay={i * 0.05}
                className="group/row grid gap-x-6 gap-y-2 border-b border-ink-700 py-6 md:grid-cols-[6rem_minmax(0,1fr)_14rem]"
              >
                <span className="index-label text-cream-faint transition-colors group-hover/row:text-ember-500">{c.code}</span>
                <div>
                  <p className="font-display text-[1.1rem] font-semibold tracking-tight text-cream">{c.name}</p>
                  {c.why ? <p className="mt-2 max-w-[60ch] text-[0.95rem] leading-relaxed text-cream-dim">{c.why}</p> : null}
                </div>
                <span className="index-label text-cream-faint md:text-right">
                  {c.issuer} · {c.year}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
