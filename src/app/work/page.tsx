import type { Metadata } from "next";
import { PageHero } from "@/components/forge/PageHero";
import { SectionHead } from "@/components/forge/SectionHead";
import { ForgedPlate } from "@/components/work/ForgedPlate";
import { Armory } from "@/components/work/Armory";
import { Reveal } from "@/components/motion";
import { getProjects, toCard } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "Every build — AI systems, full-stack products, hackathon builds, and tooling.",
};

export default function WorkPage() {
  const ledger = getProjects().map(toCard);
  const featured = ledger.filter((e) => e.featured);
  const hackathons = ledger.filter((e) => e.type === "Hackathon").length;
  const years = Array.from(new Set(ledger.map((e) => e.year))).sort();

  return (
    <>
      <PageHero
        code="The armoury"
        title="Work"
        intro={`${ledger.length} builds between ${years[0]} and ${years[years.length - 1]}, ${hackathons} of them made against a hackathon clock. Every one of them shipped to a repository.`}
      />

      <section className="section-y">
        <div className="rail">
          <SectionHead code="01 · Best of the batch" title="The" hot="flagships" />
          <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
            {featured.map((entry, i) => (
              <Reveal key={entry.code} delay={(i % 2) * 0.08}>
                <ForgedPlate entry={entry} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y border-t border-ink-700 bg-ink-990">
        <div className="rail">
          <SectionHead
            code="02 · The rack"
            title="Everything"
            hot="I've built"
            aside="Open any piece to see what it does and what it was built with."
          />
          <Armory entries={ledger} />
        </div>
      </section>
    </>
  );
}
