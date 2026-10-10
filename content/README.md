# Your content

Everything the site says about you lives in this folder. Everything it shows
(images, video, PDFs) lives in `/public`. You never need to touch `/src`.

```
content/
  profile.md          name, email, links, GitHub user — and your story (the text below the ---)
  education.md        degree, university, CGPA, coursework
  skills.md           the tool wall; `builds` = how many projects used it
  principles.md       "How I work" on /about
  certifications.md   certificates; `featured: true` gets a card
  timeline.md         the heat record on the home page (newest first)
  projects/           one file per build            → /work, and /work/<name> if written up
  achievements/       one file per hackathon, award, role, event
  experience/         one file per job or internship → /resume
  _templates/         copy these to start a new file

public/
  logo.png  portrait.jpeg  resume.pdf (add it: a download button appears on /resume)
  projects/<name>/       screenshots for content/projects/<name>.md
  achievements/<name>/   certificates and photos for content/achievements/<name>.md
  experience/<name>/     optional images for content/experience/<name>.md
```

The rule that ties them together: **the same name in both places.**
`content/projects/rakshakx.md` gets its images from `public/projects/rakshakx/`.

---

## Add a project

1. Copy `_templates/project.md` to `projects/<name>.md`. Use lowercase with
   hyphens: `my-cool-app.md`.
2. Fill in the top part, between the `---` lines. Delete optional lines you
   don't need.
3. Make the folder `public/projects/<name>/` and drop in:
   - `cover.png` (or .jpg/.webp): the main screenshot, ideally 1600×1000
   - any other images: they become the gallery, in name order (`1.png`, `2.png`…)
   - `demo.mp4`: an optional screen recording
4. Optional: write the story below the second `---`. **With** a write-up, the
   project gets its own page at `/work/<name>`. **Without** one, its card links
   to the live site or the repo.

`featured: true` puts it in the big cards on the home page and at the top of /work.

## Add a hackathon, award, or role

1. Copy `_templates/achievement.md` to `achievements/<name>.md`.
2. Fill it in. `mark` is the short word stamped in the seal (1ST, TOP 10, LEAD…).
3. Drop the certificate and photos in `public/achievements/<name>/`. They show
   up on the photo wall on /about automatically.
4. If you built something there, set `project: <project-name>` on the
   achievement, and `event: <achievement-name>` on the project, to link them.

## Add a job or internship

Copy `_templates/experience.md` to `experience/<company>.md`. Put each thing
you did on its own `- ` line below the `---`.

---

## Things to know

- **Dates** are `"2026"` or `"2026-03"`. They sort lists newest first.
- **Quotes**: put text in "double quotes" if it contains a colon, or starts
  with a number or a symbol. If unsure, quote it.
- **Hide something** without deleting it: set `draft: true` on a project, or
  rename any file to start with `_` (`_old-idea.md`).
- **If something's wrong**, the site tells you the file and the field, e.g.
  `content/projects/foo.md: type: Invalid option`. Fix that line and save.
- `.mdx` instead of `.md` lets a write-up use the extra blocks `<Decision>`,
  `<Outcome>` and `<MediaFrame>`. Plain `.md` is fine for everything else.

## What makes the biggest difference

In order: screenshots for the featured projects; "What broke" and "What I
learned" in their write-ups; real numbers (users, accuracy, placing, team
size); event photos and certificates; a high-resolution portrait; `resume.pdf`.
