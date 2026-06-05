import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landmark, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/representatives")({
  head: () => ({
    meta: [
      { title: "Representatives — CivicIntel" },
      {
        name: "description",
        content: "Learn how to find official information about the people who represent you.",
      },
    ],
  }),
  component: RepsPage,
});

// Curated, neutral list of official sources. We deliberately do NOT host
// ratings, opinions, or user-generated content about elected officials.
const officialSources = [
  {
    name: "United States · Congress",
    url: "https://www.congress.gov/members/find-your-member",
    note: "Official directory of U.S. House and Senate members.",
  },
  {
    name: "United States · USA.gov",
    url: "https://www.usa.gov/elected-officials",
    note: "Federal, state, and local elected officials.",
  },
  {
    name: "United Kingdom · Parliament",
    url: "https://members.parliament.uk/FindYourMP",
    note: "Find your Member of Parliament by postcode.",
  },
  {
    name: "Canada · Parliament",
    url: "https://www.ourcommons.ca/Members/en/search",
    note: "Search current Members of the House of Commons.",
  },
  {
    name: "European Union · Parliament",
    url: "https://www.europarl.europa.eu/meps/en/home",
    note: "Find Members of the European Parliament by country.",
  },
];

function RepsPage() {
  const [region, setRegion] = useState("");

  const filtered = region
    ? officialSources.filter((s) => s.name.toLowerCase().includes(region.toLowerCase()))
    : officialSources;

  return (
    <div>
      <PageHeader
        eyebrow="Civic directory"
        title="Find your representatives"
        description="We link to official government directories. CivicIntel does not host ratings or commentary about officials."
      />
      <div className="px-5">
        <label htmlFor="region" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Filter by country or body
        </label>
        <input
          id="region"
          type="search"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="e.g. United States, Canada, EU…"
          className="mt-2 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-[15px] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <ul className="mt-4 space-y-3 px-5 pb-8">
        {filtered.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-surface-foreground"
            >
              <Landmark className="mt-0.5 size-5 text-primary" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>
              </div>
              <ExternalLink className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
            </a>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No directories matched. Try a broader term.
          </li>
        )}
      </ul>
    </div>
  );
}
