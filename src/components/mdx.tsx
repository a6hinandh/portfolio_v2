import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { MaskReveal, Reveal } from "@/components/motion";
import { IndexLabel } from "@/components/ui";

/* Prose is capped at ~66ch. Media and diagrams are allowed to break wider. */

function H2(props: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      {...props}
      className="mt-20 mb-6 scroll-mt-32 font-display text-display-md font-medium tracking-tight text-cream first:mt-0"
    />
  );
}

function H3(props: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      {...props}
      className="mt-12 mb-4 scroll-mt-32 font-display text-xl font-medium text-cream"
    />
  );
}

function P(props: ComponentPropsWithoutRef<"p">) {
  return <p {...props} className="mb-6 max-w-[66ch] leading-[1.75] text-cream-dim" />;
}

function Ul(props: ComponentPropsWithoutRef<"ul">) {
  return <ul {...props} className="mb-6 max-w-[66ch] list-none space-y-2.5 text-cream-dim" />;
}

function Ol(props: ComponentPropsWithoutRef<"ol">) {
  return (
    <ol
      {...props}
      className="mb-6 max-w-[66ch] list-decimal space-y-2.5 pl-5 text-cream-dim marker:font-mono marker:text-[0.8em] marker:text-ember-500"
    />
  );
}

function Li(props: ComponentPropsWithoutRef<"li">) {
  return (
    <li
      {...props}
      className="relative pl-6 before:absolute before:left-0 before:top-[0.78em] before:h-px before:w-3 before:bg-ember-500/70"
    />
  );
}

function A(props: ComponentPropsWithoutRef<"a">) {
  return <a {...props} className="u-drawn text-cream transition-colors hover:text-ember-400" />;
}

function Strong(props: ComponentPropsWithoutRef<"strong">) {
  return <strong {...props} className="font-medium text-cream" />;
}

function Code(props: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      {...props}
      className="rounded-[3px] border border-ink-700 bg-ink-850 px-1.5 py-0.5 font-mono text-[0.85em] text-ember-200"
    />
  );
}

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      {...props}
      className="mb-6 overflow-x-auto rounded-lg border border-ink-700 bg-ink-950 p-5 font-mono text-[0.8125rem] leading-relaxed text-cream-dim"
    />
  );
}

function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      {...props}
      className="mb-6 max-w-[66ch] border-l-2 border-ember-500 pl-6 text-cream italic [&>p]:text-cream"
    />
  );
}

function Hr() {
  return <hr className="seam-x my-14 h-px border-0" />;
}

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="mb-6 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-left text-[0.9375rem]" />
    </div>
  );
}

function Th(props: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      {...props}
      className="index-label border-b border-ink-600 pb-3 pr-5 font-medium text-cream-faint"
    />
  );
}

function Td(props: ComponentPropsWithoutRef<"td">) {
  return <td {...props} className="border-b border-ink-700 py-3 pr-5 align-top text-cream-dim" />;
}

/**
 * One entry of the decision log — the strongest "how I think" artifact on the
 * site, and the reason the case study template exists at all.
 */
export function Decision({
  title,
  alternatives,
  why,
  tradeoff,
}: {
  title: string;
  alternatives: string;
  why: string;
  tradeoff: string;
}) {
  return (
    <Reveal className="mb-6 max-w-[70ch]">
      <div className="group/card relative overflow-hidden rounded-lg border border-ink-700 bg-ink-900 p-6 md:p-7">
        <span aria-hidden className="seam-hot absolute inset-x-0 top-0 h-px opacity-60" />
        <IndexLabel code="Decision" className="mb-3 block" />
        <p className="mb-6 font-display text-lg font-medium tracking-tight text-cream">{title}</p>
        <dl className="space-y-4 text-[0.9375rem]">
          {[
            ["Alternatives considered", alternatives],
            ["Why this", why],
            ["Tradeoff accepted", tradeoff],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-ink-700 pt-3">
              <dt className="index-label mb-1.5 text-cream-faint">{label}</dt>
              <dd className="leading-relaxed text-cream-dim">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}

/** Consistent frame for screenshots and demos. */
export function MediaFrame({
  src,
  alt,
  caption,
  wide = false,
}: {
  src?: string;
  alt: string;
  caption: string;
  wide?: boolean;
}) {
  return (
    <MaskReveal className={`my-12 ${wide ? "lg:-mx-16 xl:-mx-24" : ""}`}>
      <figure>
        <div className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="w-full" loading="lazy" />
          ) : (
            <div
              aria-hidden
              className="flex aspect-video items-center justify-center"
              style={{
                background:
                  "radial-gradient(60% 80% at 30% 30%, rgba(244,87,13,0.1) 0%, transparent 70%)",
              }}
            >
              <span className="index-label text-cream-faint">media placeholder — {alt}</span>
            </div>
          )}
        </div>
        <figcaption className="mt-4 flex gap-3 font-mono text-[0.75rem] text-cream-faint">
          <span aria-hidden className="mt-[0.6em] h-px w-4 shrink-0 bg-ember-500/60" />
          {caption}
        </figcaption>
      </figure>
    </MaskReveal>
  );
}

/** A result worth pulling out of the prose. */
export function Outcome({ children }: { children: ReactNode }) {
  return (
    <Reveal className="mb-6 max-w-[66ch]">
      <div className="relative overflow-hidden rounded-lg border border-ember-600/35 p-6">
        <span aria-hidden className="absolute inset-0 -z-10 bg-ember-500/[0.07]" />
        <p className="index-label mb-2 text-ember-500">Outcome</p>
        <div className="leading-relaxed text-cream [&>p:last-child]:mb-0 [&>p]:text-cream">
          {children}
        </div>
      </div>
    </Reveal>
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  a: A,
  strong: Strong,
  code: Code,
  pre: Pre,
  blockquote: Blockquote,
  hr: Hr,
  table: Table,
  th: Th,
  td: Td,
  Decision,
  MediaFrame,
  Outcome,
};
