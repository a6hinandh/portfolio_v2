import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx";
import { MaskReveal, Reveal, Seam } from "@/components/motion";
import { MetaGrid, StatBlock, Tag } from "@/components/ui";
import { getAchievements, getProject, getWrittenProjects } from "@/lib/content";

// Only projects with a write-up have a page; everything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getWrittenProjects().map((p) => ({ slug: p.slug }));
  // The static export refuses an empty list, so until the first write-up exists
  // emit one placeholder that renders the 404 page.
  return slugs.length ? slugs : [{ slug: "_" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary, type: "article", images: p.media.cover ? [p.media.cover] : undefined },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p || !p.body) notFound();

  const written = getWrittenProjects();
  const next = written[(written.findIndex((w) => w.slug === slug) + 1) % written.length];
  const event = p.event ? getAchievements().find((a) => a.slug === p.event) : undefined;

  const meta = [
    p.role && { label: "Role", value: p.role },
    p.team && { label: "Team", value: p.team },
    { label: "When", value: p.duration ? `${p.duration} · ${p.year}` : p.year },
    {
      label: "Status",
      value: (
        <span className="inline-flex items-center gap-2 text-ember-400">
          <span aria-hidden className="ember-breathe h-1.5 w-1.5 rounded-full bg-ember-500" />
          {p.status ?? "Shipped"}
        </span>
      ),
    },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: p.title,
            description: p.summary,
            keywords: p.stack.join(", "),
          }),
        }}
      />

      <header className="blueprint relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-2/3"
          style={{ background: "radial-gradient(50% 80% at 18% 0%, rgba(244,87,13,0.14), transparent 70%)" }}
        />
        <div className="rail pb-12 pt-32 md:pb-16 md:pt-40">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/work" className="group/back index-label tap -my-2 gap-2 text-cream-faint hover:text-cream">
                <span aria-hidden className="transition-transform group-hover/back:-translate-x-1">
                  ←
                </span>
                Work
              </Link>
              <span aria-hidden className="h-3 w-px bg-ink-600" />
              <span className="index-label text-ember-500">{p.code}</span>
              <span className="index-label text-cream-faint">{p.type}</span>
              {p.hallmark ? (
                <span className="index-label rounded-sm border border-ember-600/50 px-2 py-1 text-ember-300">{p.hallmark}</span>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-stamp max-w-5xl text-stamp-xl text-cream">{p.title}</h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream-dim">{p.summary}</p>
          </Reveal>

          <div className="mt-10 max-w-4xl">
            <MetaGrid items={meta} columns={Math.min(4, meta.length) as 2 | 3 | 4} />
          </div>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {p.stack.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-wrap gap-3">
              {p.live ? (
                <a href={p.live} target="_blank" rel="noopener noreferrer" className="index-label tap rounded-full bg-ember-500 px-5 font-semibold text-ink-950 hover:bg-ember-400">
                  Live ↗
                </a>
              ) : null}
              {p.repo ? (
                <a href={p.repo} target="_blank" rel="noopener noreferrer" className="index-label tap rounded-full border border-ink-600 px-5 text-cream hover:border-cream-faint">
                  Source ↗
                </a>
              ) : null}
              {event ? (
                <span className="index-label tap text-cream-faint">
                  Built at {event.org} · {event.title}
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>
      </header>

      {/* Cover, then the numbers ---------------------------------------- */}
      <div className="rail">
        {p.media.cover ? (
          <MaskReveal className="relative aspect-[16/10] overflow-hidden rounded-md border border-ink-700 bg-ink-900">
            <Image src={p.media.cover} alt={`${p.title} screenshot`} fill priority sizes="(min-width: 1344px) 84rem, 100vw" className="object-cover object-top" />
          </MaskReveal>
        ) : null}
        {p.metrics.length > 0 ? (
          <div className="mt-10">
            <StatBlock stats={p.metrics} />
          </div>
        ) : null}
      </div>

      {/* The write-up ---------------------------------------------------- */}
      <div className="rail mt-16 md:mt-24">
        <div className="mx-auto max-w-3xl">
          <MDXRemote
            source={p.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                format: p.mdx ? "mdx" : "md",
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug],
              },
            }}
          />
        </div>
      </div>

      {/* Demo and gallery ------------------------------------------------ */}
      {p.media.video || p.media.gallery.length ? (
        <div className="rail mt-16 space-y-4 md:mt-24">
          {p.media.video ? (
            <MaskReveal className="overflow-hidden rounded-md border border-ink-700 bg-ink-900">
              <video src={p.media.video} controls playsInline preload="metadata" className="w-full" />
            </MaskReveal>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {p.media.gallery.map((src, i) => (
              <MaskReveal key={src} delay={(i % 2) * 0.08} className="relative aspect-[16/10] overflow-hidden rounded-md border border-ink-700 bg-ink-900">
                <Image src={src} alt={`${p.title}, screen ${i + 2}`} fill sizes="(min-width: 768px) 42rem, 100vw" className="object-cover object-top" />
              </MaskReveal>
            ))}
          </div>
        </div>
      ) : null}

      {/* Next build ------------------------------------------------------- */}
      {next && next.slug !== p.slug ? (
        <div className="rail mt-24 md:mt-32">
          <Seam />
          <Link
            href={`/work/${next.slug}`}
            className="group/next mt-12 flex flex-col gap-3 rounded-md border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-ember-700/70 md:p-10"
          >
            <span className="index-label text-ember-500">Next build</span>
            <span className="font-stamp text-stamp-md text-cream transition-colors group-hover/next:text-white-hot">{next.title}</span>
            <span className="max-w-xl text-cream-dim">{next.summary}</span>
          </Link>
        </div>
      ) : null}

      <div className="pb-24 md:pb-32" />
    </article>
  );
}
