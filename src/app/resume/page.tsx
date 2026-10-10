import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion";
import fs from "node:fs";
import path from "node:path";
import { getCertifications, getEducation, getExperience, getProfile, getProjects, getSkills } from "@/lib/content";

export function generateMetadata(): Metadata {
  const site = getProfile();
  return { title: "Resume", description: `${site.name} — ${site.role}. The scannable, print-ready view.` };
}

/**
 * The recruiter fast path.
 *
 * Deliberately conventional, deliberately calm — the one page where creativity
 * would be a liability. It carries the ember only as section markers, and
 * inverts to a clean light document when printed.
 */
export default function ResumePage() {
  const site = getProfile();
  const education = getEducation();
  const experience = getExperience();
  const skillGroups = getSkills();
  const certifications = getCertifications();
  const flagships = getProjects().filter((e) => e.featured);
  // The PDF button only appears once public/resume.pdf exists.
  const hasPdf = fs.existsSync(path.join(process.cwd(), "public", "resume.pdf"));

  return (
    <div className="mx-auto max-w-[48rem] px-5 pb-24 pt-32 md:px-8 md:pt-44 print:max-w-none print:px-0 print:pt-0">
      <header className="border-b border-ink-700 pb-9 print:border-neutral-300 print:pb-5">
        <Reveal>
          <p className="index-label mb-4 text-ember-500 print:text-neutral-500">
            Resume · {site.version}
          </p>
          <h1 className="font-stamp text-stamp-lg text-cream print:font-display print:text-2xl print:normal-case print:text-black">
            {site.fullName}
          </h1>
          <p className="mt-2 text-cream-dim print:text-neutral-700">
            {site.role} · {site.location}
          </p>

          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 font-mono text-[0.8125rem] text-cream-dim print:text-neutral-700">
            <a href={`mailto:${site.email}`} className="u-draw hover:text-cream">
              {site.email}
            </a>
            {site.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="u-draw hover:text-cream"
              >
                {social.label}
              </a>
            ))}
          </p>

          <div className="no-print mt-8 flex flex-wrap gap-3">
            {hasPdf ? (
            <a
              href="/resume.pdf"
              download
              className="group/dl relative overflow-hidden rounded-sm border border-ember-600/70 px-4 py-2.5 index-label text-white-hot transition-colors duration-300"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 bg-ember-500/25 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/dl:scale-x-100"
              />
              <span aria-hidden className="absolute inset-0 bg-ember-500/12" />
              <span className="relative">Download PDF ↓</span>
            </a>
            ) : null}
            <Link
              href="/work"
              className="index-label tap rounded-sm border border-ink-600 px-4 text-cream transition-colors duration-300 hover:border-ember-600/70"
            >
              See the work instead →
            </Link>
          </div>
        </Reveal>
      </header>

      <Section title="Education">
        <Entry
          heading={education.degree}
          sub={`${education.university} · ${education.specialization}`}
          right={education.period}
        >
          <p className="text-[0.9375rem] text-cream-dim print:text-neutral-700">
            CGPA {education.cgpa} · {education.coursework.slice(0, 5).join(", ")}
          </p>
        </Entry>
      </Section>

      <Section title="Experience">
        {experience.map((job) => (
          <Entry key={job.role} heading={job.role} sub={job.org} right={job.period}>
            <ul className="mt-2 space-y-1.5 text-[0.9375rem] text-cream-dim print:text-neutral-700">
              {job.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.7em] h-px w-3 shrink-0 bg-ember-500 print:bg-neutral-400"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[0.75rem] leading-relaxed text-cream-faint print:text-neutral-500">
              {job.stack.join(" · ")}
            </p>
          </Entry>
        ))}
      </Section>

      <Section title="Selected projects">
        {flagships.map((project) => (
          <Entry key={project.code} heading={project.title} sub={project.summary} right={project.year}>
            <p className="font-mono text-[0.75rem] leading-relaxed text-cream-faint print:text-neutral-500">
              {project.stack.join(" · ")}
              {project.repo ? (
                <>
                  {" · "}
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="u-draw text-cream-dim print:text-neutral-700"
                  >
                    source
                  </a>
                </>
              ) : null}
            </p>
          </Entry>
        ))}
      </Section>

      <Section title="Skills">
        <div className="space-y-3">
          {skillGroups.map((group) => (
            <p key={group.label} className="text-[0.9375rem] leading-relaxed">
              <span className="index-label mr-3 inline-block min-w-[9rem] align-top text-cream-faint print:text-neutral-500">
                {group.label}
              </span>
              <span className="text-cream-dim print:text-neutral-800">
                {group.skills.map((skill) => skill.name).join(", ")}
              </span>
            </p>
          ))}
        </div>
      </Section>

      <Section title="Certifications">
        <ul className="space-y-2 text-[0.9375rem] text-cream-dim print:text-neutral-700">
          {certifications.map((cert) => (
            <li key={cert.code}>
              {cert.name} — {cert.issuer}, {cert.year}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-ink-700 py-9 last:border-b-0 print:break-inside-avoid print:border-neutral-300 print:py-5">
      <h2 className="index-label mb-6 text-ember-500 print:text-neutral-500">{title}</h2>
      <div className="space-y-7">{children}</div>
    </section>
  );
}

function Entry({
  heading,
  sub,
  right,
  children,
}: {
  heading: string;
  sub: string;
  right?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal className="print:break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
        <h3 className="font-display text-lg font-medium tracking-tight text-cream print:text-black">
          {heading}
        </h3>
        {right ? (
          <span className="font-mono text-[0.75rem] text-cream-faint print:text-neutral-500">
            {right}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[0.9375rem] leading-relaxed text-cream-dim print:text-neutral-700">
        {sub}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </Reveal>
  );
}
