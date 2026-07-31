// Civic "stories" rail — politicians and government departments.
// Strictly neutral & educational (titles + verified institutional handles).
import type { Category } from "@/lib/feed-content";

export type Story = {
  id: string;
  name: string;
  handle: string;
  role: string;
  gradient: string;
  unread?: boolean;
  /** Reels category this institution's stories belong to; "All" resets the filter. */
  category: Category | "All";
};

const G = {
  red: "linear-gradient(135deg,#000 0%,#990000 60%,#006600 100%)",
  green: "linear-gradient(160deg,#006600 0%,#000 55%,#990000 100%)",
  earth: "linear-gradient(135deg,#1a1a1a 0%,#3a1f00 50%,#006600 100%)",
  blackRed: "linear-gradient(200deg,#990000 0%,#000 50%,#006600 100%)",
  navy: "linear-gradient(135deg,#0b1c3a 0%,#1a2547 50%,#006600 100%)",
};

export const STORIES: Story[] = [
  { id: "u1", name: "You", handle: "@you", role: "Add story", gradient: G.navy, category: "All" },
  { id: "s1", name: "State House", handle: "@statehousekenya", role: "Executive", gradient: G.red, unread: true, category: "Government" },
  { id: "s2", name: "Parliament", handle: "@nationalassemblyke", role: "Legislature", gradient: G.green, unread: true, category: "Government" },
  { id: "s3", name: "Judiciary", handle: "@kenyajudiciary", role: "Courts", gradient: G.earth, unread: true, category: "Rights" },
  { id: "s4", name: "IEBC", handle: "@iebckenya", role: "Elections", gradient: G.blackRed, unread: true, category: "Elections" },
  { id: "s5", name: "Treasury", handle: "@kenyatreasury", role: "Public Finance", gradient: G.navy, unread: true, category: "Public Finance" },
  { id: "s6", name: "CBK", handle: "@centralbankkenya", role: "Monetary", gradient: G.green, unread: true, category: "Public Finance" },
  { id: "s7", name: "KNCHR", handle: "@knchrkenya", role: "Rights", gradient: G.red, category: "Rights" },
  { id: "s8", name: "Ministry of Health", handle: "@moh_kenya", role: "Health", gradient: G.earth, category: "Government" },
  { id: "s9", name: "Council of Governors", handle: "@kenyangovernors", role: "Counties", gradient: G.blackRed, category: "Government" },
  { id: "s10", name: "Office of AG", handle: "@oagkenya", role: "Audit", gradient: G.navy, category: "Public Finance" },
];
