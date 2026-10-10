# Abhinandh — personal portfolio

A portfolio built as a workshop you walk through: sketches start cold, work in progress glows,
and finished builds cool down and carry a mark. Every project, achievement and role on the site
comes from plain Markdown files, so adding something new never means touching the code.

## Stack

Next.js 16 (App Router, statically generated) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Lenis smooth scroll · MDX via next-mdx-remote · gray-matter + Zod-validated
frontmatter.

## Commands

```bash
npm install
npm run dev     # dev server on http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

## Pages

| Route | What it shows |
|---|---|
| `/` | Hero, featured builds, achievements, the heat record (timeline), tool wall, live GitHub contribution map |
| `/work` | Every project; featured ones first |
| `/work/<name>` | A full case study, for projects that have a write-up |
| `/about` | Story, principles, education, achievements and their photo wall, certifications |
| `/resume` | Education, experience, featured projects, skills, certifications, and a PDF download if `public/resume.pdf` exists |

## Where things live

| Path | What it is |
|---|---|
| `content/` | All written content: profile, education, skills, timeline, projects, achievements, experience. See [content/README.md](content/README.md) |
| `content/_templates/` | Starting points for a new project, achievement or job |
| `public/` | Media, with one folder per content entry (`public/projects/<name>/` belongs to `content/projects/<name>.md`) |
| `src/lib/content.ts` | Reads and validates everything in `content/` and `public/`. A typo fails the build with the file and field name |
| `src/lib/github.ts` | Fetches the public GitHub contribution calendar (no token needed) |
| `src/app/globals.css` | Design tokens (ink, cream, steel, ember) — the single source of truth for the look |
| `src/components/` | `home/`, `work/`, `forge/` (shared visual pieces), `site/` (header, footer, transitions), plus `ui.tsx`, `mdx.tsx`, `motion.tsx` |
| `src/fonts/` | Self-hosted General Sans (Fontshare, free for commercial use) |

## Adding content

Copy a template from `content/_templates/` into the matching folder, fill in the frontmatter,
and drop images into the folder of the same name under `public/`. The step-by-step guide is in
[content/README.md](content/README.md).
