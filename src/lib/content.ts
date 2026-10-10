// Reads everything under /content (the owner's material) and /public (its
// media). Every file is validated, and a mistake fails the build with the file
// name and the field, rather than rendering something half-broken.

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** YAML turns 2026 into a number and 2026-03-01 into a Date; we want text. */
const dateText = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === "number" ? String(v) : v),
  z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/, 'use "2026" or "2026-03"'),
);
const text = z.preprocess((v) => (typeof v === "number" ? String(v) : v), z.string());
const optionalText = z.preprocess((v) => (v === null || v === "" ? undefined : typeof v === "number" ? String(v) : v), z.string().optional());
const optionalUrl = z.preprocess((v) => (v === null || v === "" ? undefined : v), z.string().url().optional());

function read(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { data, body: content };
}

function parse<T extends z.ZodTypeAny>(schema: T, data: unknown, file: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  • ${i.path.join(".") || "(file)"}: ${i.message}`).join("\n");
    throw new Error(`\n${path.relative(ROOT, file)} has a problem:\n${issues}\n`);
  }
  return result.data;
}

/** Markdown files in a collection folder, skipping drafts-by-name (`_x.md`). */
function collection(dir: string) {
  const full = path.join(CONTENT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"))
    .map((f) => ({ slug: f.replace(/\.mdx?$/, ""), file: path.join(full, f), mdx: f.endsWith(".mdx") }));
}

/**
 * The write-up as it should render: template comments removed, and any heading
 * left with nothing under it dropped, so a half-filled template reads cleanly.
 */
function cleanBody(body: string) {
  const parts = body.replace(/<!--[\s\S]*?-->/g, "").split(/^(?=#{1,6} )/m);
  return parts
    .filter((part) => !/^#{1,6} /.test(part) || part.replace(/^#{1,6} .*$/m, "").trim().length > 0)
    .join("")
    .trim();
}

/** True when a body has real words in it, not just template headings and comments. */
function hasWriting(body: string) {
  return (
    body
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/^#+ .*$/gm, "")
      .trim().length > 0
  );
}

const IMAGE = /\.(png|jpe?g|webp|avif|gif)$/i;
const VIDEO = /\.(mp4|webm)$/i;

export type Media = { cover?: string; gallery: string[]; video?: string };

/** Whatever is in public/<kind>/<slug>/: cover.* first, then everything else by name. */
function media(kind: string, slug: string): Media {
  const dir = path.join(PUBLIC, kind, slug);
  if (!fs.existsSync(dir)) return { gallery: [] };
  const files = fs
    .readdirSync(dir)
    .filter((f) => !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const url = (f: string) => `/${kind}/${slug}/${encodeURIComponent(f)}`;
  const images = files.filter((f) => IMAGE.test(f));
  const cover = images.find((f) => /^cover\./i.test(f));
  return {
    cover: cover ? url(cover) : images[0] ? url(images[0]) : undefined,
    gallery: images.filter((f) => f !== (cover ?? images[0])).map(url),
    video: files.find((f) => VIDEO.test(f)) ? url(files.find((f) => VIDEO.test(f))!) : undefined,
  };
}

const newestFirst = (a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date);

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  role: z.string(),
  shortRole: z.string(),
  location: z.string(),
  email: z.string().email(),
  url: z.preprocess((v) => v ?? "", z.string()),
  tagline: z.string(),
  nowBuilding: optionalText,
  githubUser: z.string(),
  version: text.default("v1.0"),
  socials: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
});

export type Profile = z.infer<typeof profileSchema> & { story: string[] };

export const getProfile = cache((): Profile => {
  const file = path.join(CONTENT, "profile.md");
  const { data, body } = read(file);
  const story = body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return { ...parse(profileSchema, data, file), story };
});

// ---------------------------------------------------------------------------
// Single-file sections
// ---------------------------------------------------------------------------

const educationSchema = z.object({
  university: z.string(),
  degree: z.string(),
  specialization: z.string(),
  period: z.string(),
  cgpa: text,
  coursework: z.array(z.string()).default([]),
});
export type Education = z.infer<typeof educationSchema>;
export const getEducation = cache((): Education => {
  const file = path.join(CONTENT, "education.md");
  return parse(educationSchema, read(file).data, file);
});

const skillsSchema = z.object({
  groups: z.array(
    z.object({
      label: z.string(),
      skills: z.array(z.object({ name: z.string(), builds: z.number().int().min(0) })),
    }),
  ),
});
export type SkillGroup = z.infer<typeof skillsSchema>["groups"][number];
export const getSkills = cache((): SkillGroup[] => {
  const file = path.join(CONTENT, "skills.md");
  return parse(skillsSchema, read(file).data, file).groups;
});

const principlesSchema = z.object({ principles: z.array(z.object({ title: z.string(), line: z.string() })) });
export type Principle = z.infer<typeof principlesSchema>["principles"][number];
export const getPrinciples = cache((): Principle[] => {
  const file = path.join(CONTENT, "principles.md");
  return parse(principlesSchema, read(file).data, file).principles;
});

const certificationsSchema = z.object({
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      year: text,
      featured: z.boolean().default(false),
      why: optionalText,
      href: optionalUrl,
    }),
  ),
});
export type Certification = z.infer<typeof certificationsSchema>["certifications"][number] & { code: string };
export const getCertifications = cache((): Certification[] => {
  const file = path.join(CONTENT, "certifications.md");
  return parse(certificationsSchema, read(file).data, file).certifications.map((c, i) => ({
    ...c,
    code: `CRT-${String(i + 1).padStart(2, "0")}`,
  }));
});

const timelineSchema = z.object({
  entries: z.array(
    z.object({
      period: z.string(),
      title: z.string(),
      org: z.string(),
      kind: z.enum(["education", "role", "milestone"]),
      summary: z.string(),
      stack: z.array(z.string()).optional(),
    }),
  ),
});
export type TimelineEntry = z.infer<typeof timelineSchema>["entries"][number] & { code: string };
/** Newest first, as written in the file. */
export const getTimeline = cache((): TimelineEntry[] => {
  const file = path.join(CONTENT, "timeline.md");
  const entries = parse(timelineSchema, read(file).data, file).entries;
  return entries.map((e, i) => ({ ...e, code: `PTH-${String(entries.length - i).padStart(2, "0")}` }));
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const PROJECT_TYPES = ["AI", "Full-stack", "Mobile", "Hackathon", "Tooling"] as const;

const projectSchema = z.object({
  title: z.string(),
  code: optionalText,
  date: dateText,
  type: z.enum(PROJECT_TYPES),
  summary: z.string(),
  stack: z.array(z.string()).default([]),
  repo: optionalUrl,
  live: optionalUrl,
  role: optionalText,
  team: optionalText,
  duration: optionalText,
  status: optionalText,
  event: optionalText,
  metrics: z.array(z.object({ value: text, label: z.string() })).default([]),
  hallmark: optionalText,
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type Project = Omit<z.infer<typeof projectSchema>, "code"> & {
  slug: string;
  code: string;
  year: string;
  media: Media;
  /** The write-up, if there is one. Without it there is no project page. */
  body: string | null;
  mdx: boolean;
};

export const getProjects = cache((): Project[] => {
  const items = collection("projects").map(({ slug, file, mdx }) => {
    const { data, body } = read(file);
    const p = parse(projectSchema, data, file);
    return { ...p, slug, mdx, body: hasWriting(body) ? cleanBody(body) : null, media: media("projects", slug), year: p.date.slice(0, 4) };
  });
  const live = items.filter((p) => !p.draft);

  // Codes: keep any written in the file; number the rest after the highest one.
  let next = Math.max(0, ...live.map((p) => Number(p.code?.match(/\d+/)?.[0] ?? 0)));
  const coded = [...live]
    .sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug))
    .map((p) => ({ ...p, code: p.code ?? `LDG-${String(++next).padStart(2, "0")}` }));

  const num = (c: string) => Number(c.match(/\d+/)?.[0] ?? 0);
  return coded.sort((a, b) => newestFirst(a, b) || num(b.code) - num(a.code));
});

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug);

/** Projects that have a write-up, in list order — the ones with their own page. */
export const getWrittenProjects = () => getProjects().filter((p) => p.body);

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

const achievementSchema = z.object({
  title: z.string(),
  org: z.string(),
  kind: z.enum(["hackathon", "award", "community", "role", "event"]),
  period: text,
  date: dateText,
  mark: text,
  summary: z.string(),
  project: optionalText,
  link: optionalUrl,
  teams: z.preprocess((v) => (v === null || v === "" ? undefined : v), z.coerce.number().int().optional()),
  order: z.number().optional(),
});

export type Achievement = z.infer<typeof achievementSchema> & { slug: string; code: string; media: Media };

export const getAchievements = cache((): Achievement[] => {
  const items = collection("achievements").map(({ slug, file }) => ({
    ...parse(achievementSchema, read(file).data, file),
    slug,
    media: media("achievements", slug),
  }));
  // Explicit `order` first (lowest first), then everything else newest first.
  items.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return newestFirst(a, b);
  });
  return items.map((a, i) => ({ ...a, code: `BYD-${String(i + 1).padStart(2, "0")}` }));
});

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

const experienceSchema = z.object({
  role: z.string(),
  org: z.string(),
  period: z.string(),
  date: dateText,
  stack: z.array(z.string()).default([]),
});

export type Experience = z.infer<typeof experienceSchema> & { slug: string; points: string[]; media: Media };

export const getExperience = cache((): Experience[] =>
  collection("experience")
    .map(({ slug, file }) => {
      const { data, body } = read(file);
      const points = body
        .split("\n")
        .map((l) => l.match(/^\s*[-*]\s+(.*)$/)?.[1]?.trim())
        .filter((l): l is string => Boolean(l));
      return { ...parse(experienceSchema, data, file), slug, points, media: media("experience", slug) };
    })
    .sort(newestFirst),
);

// ---------------------------------------------------------------------------
// What client components get: no write-up text, just whether a page exists.
// ---------------------------------------------------------------------------

export type ProjectCard = Omit<Project, "body" | "mdx"> & { hasPage: boolean };

export function toCard(p: Project): ProjectCard {
  const { body, mdx, ...card } = p;
  void mdx;
  return { ...card, hasPage: Boolean(body) };
}
