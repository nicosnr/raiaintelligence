// Civic "stories" rail — politicians and government departments.
// Strictly neutral & educational (titles + verified institutional handles).
import type { Category } from "@/lib/feed-content";
import ballotBox from "@/assets/topics/ballot-box.jpg";
import centralBank from "@/assets/topics/central-bank.jpg";
import countyHall from "@/assets/topics/county-hall.jpg";
import parliament from "@/assets/topics/parliament.jpg";
import supremeCourt from "@/assets/topics/supreme-court.jpg";
import timesTower from "@/assets/topics/times-tower.jpg";

export type Story = {
  id: string;
  name: string;
  handle: string;
  role: string;
  gradient: string;
  unread?: boolean;
  image?: string;
  summary?: string;
  whatTheyShouldDo?: string;
  ctaTo?: string;
  ctaLabel?: string;
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
  { id: "u1", name: "You", handle: "@you", role: "Add story", gradient: G.navy, category: "All", summary: "Track your civic learning journey.", whatTheyShouldDo: "Complete one explainer today and keep your streak alive.", ctaTo: "/learn", ctaLabel: "Open learn" },
  { id: "s1", name: "State House", handle: "@statehousekenya", role: "Executive", gradient: G.red, unread: true, category: "Government", image: timesTower, summary: "Coordinates national policy and public service delivery.", whatTheyShouldDo: "Publish clearer service updates and explain major decisions in plain language.", ctaTo: "/learn", ctaLabel: "Learn how government works" },
  { id: "s2", name: "Parliament", handle: "@nationalassemblyke", role: "Legislature", gradient: G.green, unread: true, category: "Government", image: parliament, summary: "Debates laws, budgets, and oversight matters.", whatTheyShouldDo: "Share committee work, vote records, and plain-language summaries of bills.", ctaTo: "/learn", ctaLabel: "See civic explainers" },
  { id: "s3", name: "Judiciary", handle: "@kenyajudiciary", role: "Courts", gradient: G.earth, unread: true, category: "Rights", image: supremeCourt, summary: "Protects rights and interprets the Constitution.", whatTheyShouldDo: "Publish hearing schedules and explain rulings in accessible language.", ctaTo: "/learn", ctaLabel: "Learn your rights" },
  { id: "s4", name: "IEBC", handle: "@iebckenya", role: "Elections", gradient: G.blackRed, unread: true, category: "Elections", image: ballotBox, summary: "Runs elections and voter education.", whatTheyShouldDo: "Publish polling updates, timelines, and voter-information guides early.", ctaTo: "/learn", ctaLabel: "Open election explainers" },
  { id: "s5", name: "Treasury", handle: "@kenyatreasury", role: "Public Finance", gradient: G.navy, unread: true, category: "Public Finance", image: centralBank, summary: "Shapes taxes, spending, and the budget cycle.", whatTheyShouldDo: "Break down budget choices and show where citizens can give input.", ctaTo: "/economy", ctaLabel: "See the economy" },
  { id: "s6", name: "CBK", handle: "@centralbankkenya", role: "Monetary", gradient: G.green, unread: true, category: "Public Finance", image: centralBank, summary: "Guides rates, liquidity, and monetary policy.", whatTheyShouldDo: "Explain rate moves and their impact on households in simple terms.", ctaTo: "/economy", ctaLabel: "Watch the economic pulse" },
  { id: "s7", name: "KNCHR", handle: "@knchrkenya", role: "Rights", gradient: G.red, category: "Rights", image: supremeCourt, summary: "Promotes human rights and public accountability.", whatTheyShouldDo: "Share plain-language guides on rights violations and complaint routes.", ctaTo: "/learn", ctaLabel: "Learn citizen rights" },
  { id: "s8", name: "Ministry of Health", handle: "@moh_kenya", role: "Health", gradient: G.earth, category: "Government", image: timesTower, summary: "Coordinates health services and public health messages.", whatTheyShouldDo: "Publish service updates, facility contacts, and prevention guidance in one place.", ctaTo: "/services", ctaLabel: "Find public services" },
  { id: "s9", name: "Council of Governors", handle: "@kenyangovernors", role: "Counties", gradient: G.blackRed, category: "Government", image: countyHall, summary: "Coordinates county service delivery and devolution.", whatTheyShouldDo: "Publish county action plans, budgets, and service-charter commitments.", ctaTo: "/counties", ctaLabel: "See county actions" },
  { id: "s10", name: "Members of Parliament", handle: "@parliamentke", role: "Representatives", gradient: G.navy, category: "Government", image: parliament, summary: "Represent constituencies and scrutinise government.", whatTheyShouldDo: "Show up in public forums, explain votes, and publish constituency service updates.", ctaTo: "/representatives", ctaLabel: "See representatives" },
  { id: "s11", name: "Office of AG", handle: "@oagkenya", role: "Audit", gradient: G.navy, category: "Public Finance", image: centralBank, summary: "Audits public spending and accountability.", whatTheyShouldDo: "Publish concise audit findings and follow-up actions for the public.", ctaTo: "/economy", ctaLabel: "Open public finance" },
];
