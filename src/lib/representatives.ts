import { COUNTIES } from "./counties";

export type Representative = {
  id: string;
  role: "President" | "Governor" | "Senator" | "Chief" | "Other";
  name: string;
  jurisdiction: string; // e.g., county name or 'National'
  source?: string;
};

export function getKenyaRepresentatives(): Representative[] {
  const out: Representative[] = [];

  // National
  out.push({
    id: "ke-president",
    role: "President",
    name: "President of Kenya",
    jurisdiction: "National",
    source: "https://www.president.go.ke/",
  });

  // Per-county: Governor, Senator, and a local Chief placeholder
  for (const c of COUNTIES) {
    out.push({
      id: `gov-${c.code}`,
      role: "Governor",
      name: `Governor of ${c.name}`,
      jurisdiction: c.name,
      source: `https://www.google.com/search?q=${encodeURIComponent("Governor " + c.name + " Kenya")}`,
    });
    out.push({
      id: `sen-${c.code}`,
      role: "Senator",
      name: `Senator for ${c.name}`,
      jurisdiction: c.name,
      source: "https://www.mzalendo.com/",
    });
    out.push({
      id: `chief-${c.code}`,
      role: "Chief",
      name: `Local chief — ${c.name}`,
      jurisdiction: c.name,
      source: `https://www.google.com/search?q=${encodeURIComponent("Chief " + c.name + " Kenya")}`,
    });
  }

  return out;
}
