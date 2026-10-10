// The public contribution calendar from a GitHub profile. No token needed:
// it reads the same HTML fragment github.com renders on the profile page.

export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export type Contributions = {
  user: string;
  total: number;
  /** Columns of seven days, Sunday first. Leading slots may be null. */
  weeks: (Day | null)[][];
  stats: {
    activeDays: number;
    longestStreak: number;
    currentStreak: number;
    best: Day | null;
  };
};

const REFRESH_SECONDS = 60 * 60 * 12;

export async function getContributions(user: string): Promise<Contributions | null> {
  try {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(user)}/contributions`, {
      headers: { "User-Agent": "portfolio-heatmap", Accept: "text/html" },
      next: { revalidate: REFRESH_SECONDS },
    });
    if (!res.ok) return null;
    return parse(user, await res.text());
  } catch {
    // Offline build or GitHub unreachable: the section simply doesn't render.
    return null;
  }
}

function parse(user: string, html: string): Contributions | null {
  // Counts live in tooltips keyed by the cell id.
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d[\d,]*) contribution/);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }

  const days: Day[] = [];
  for (const m of html.matchAll(/<td\b[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([\d-]+)"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    if (!date) continue;
    days.push({ date, count: (id && counts.get(id)) || 0, level: Math.min(4, level) as Day["level"] });
  }
  if (days.length === 0) return null;
  days.sort((a, b) => a.date.localeCompare(b.date));

  // Lay the days into Sunday-first weeks.
  const weeks: (Day | null)[][] = [];
  let week: (Day | null)[] = Array(new Date(`${days[0].date}T00:00:00Z`).getUTCDay()).fill(null);
  for (const d of days) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);

  const headline = html.match(/(\d[\d,]*)\s+contributions\s+in the last year/);
  const total = headline ? Number(headline[1].replace(/,/g, "")) : days.reduce((s, d) => s + d.count, 0);

  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // The current streak may start yesterday — today isn't over yet.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i === days.length - 1) continue;
    else break;
  }

  return {
    user,
    total,
    weeks,
    stats: {
      activeDays: days.filter((d) => d.count > 0).length,
      longestStreak: longest,
      currentStreak: current,
      best: days.reduce<Day | null>((b, d) => (!b || d.count > b.count ? d : b), null),
    },
  };
}
