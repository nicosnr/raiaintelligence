import ballotBox from "@/assets/topics/ballot-box.jpg";
import centralBank from "@/assets/topics/central-bank.jpg";
import countyHall from "@/assets/topics/county-hall.jpg";
import parliament from "@/assets/topics/parliament.jpg";
import supremeCourt from "@/assets/topics/supreme-court.jpg";

// Mock feed data for Reels and Posts. Neutral, educational, Kenya-focused.
export type Category = "Rights" | "Government" | "Elections" | "Public Finance";

export type Reel = {
  id: string;
  title: string;
  caption: string;
  category: Category;
  author: string;
  handle: string;
  avatarGradient: string;
  poster: string;
  postedAt: string; // ISO 2026
  durationSec: number;
  likes: number;
  comments: number;
};

export type Post = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: Category;
  author: string;
  handle: string;
  avatarGradient: string;
  cover: string;
  postedAt: string; // ISO 2026
  readMinutes: number;
  likes: number;
  comments: number;
};

const GRADS = {
  red: "linear-gradient(135deg,#000 0%,#990000 60%,#006600 100%)",
  green: "linear-gradient(160deg,#006600 0%,#000 55%,#990000 100%)",
  blackRed: "linear-gradient(200deg,#990000 0%,#000 50%,#006600 100%)",
  earth: "linear-gradient(135deg,#1a1a1a 0%,#3a1f00 50%,#006600 100%)",
};

const withKenyaBackdrop = (image: string) =>
  `linear-gradient(135deg, rgba(7,17,31,0.82) 0%, rgba(153,0,0,0.48) 55%, rgba(0,102,0,0.24) 100%), url(${image})`;

export const REELS: Reel[] = [
  {
    id: "r1",
    title: "Article 43 — Social & economic rights",
    caption: "Health, housing, food, water, education — what the Constitution actually guarantees.",
    category: "Rights",
    author: "KNCHR Explainer",
    handle: "@knchr_civic",
    avatarGradient: GRADS.red,
    poster: withKenyaBackdrop(supremeCourt),
    postedAt: "2026-02-14T09:00:00Z",
    durationSec: 58,
    likes: 1243,
    comments: 84,
  },
  {
    id: "r2",
    title: "How a Bill becomes law in Kenya",
    caption: "From first reading in Bunge to Presidential assent — a 60-second tour.",
    category: "Government",
    author: "Parliament 101",
    handle: "@bunge_basics",
    avatarGradient: GRADS.green,
    poster: withKenyaBackdrop(parliament),
    postedAt: "2026-03-02T13:20:00Z",
    durationSec: 72,
    likes: 982,
    comments: 51,
  },
  {
    id: "r3",
    title: "Devolution in 60 seconds",
    caption: "47 counties, two levels of government, one Republic.",
    category: "Government",
    author: "CivicIntel",
    handle: "@civicintel",
    avatarGradient: GRADS.blackRed,
    poster: withKenyaBackdrop(countyHall),
    postedAt: "2026-04-11T17:45:00Z",
    durationSec: 64,
    likes: 1567,
    comments: 122,
  },
  {
    id: "r4",
    title: "How the BBI of public budgets works",
    caption: "Where your taxes go: a plain-language walkthrough of the budget cycle.",
    category: "Public Finance",
    author: "Treasury Watch",
    handle: "@treasury_watch",
    avatarGradient: GRADS.earth,
    poster: withKenyaBackdrop(centralBank),
    postedAt: "2026-05-06T08:10:00Z",
    durationSec: 88,
    likes: 740,
    comments: 38,
  },
  {
    id: "r5",
    title: "Your vote in a general election",
    caption: "Six ballots, one queue — what each one decides.",
    category: "Elections",
    author: "IEBC Civic",
    handle: "@iebc_civic",
    avatarGradient: GRADS.red,
    poster: withKenyaBackdrop(ballotBox),
    postedAt: "2026-05-22T11:00:00Z",
    durationSec: 55,
    likes: 2103,
    comments: 201,
  },
];

const lorem = (s: string) =>
  `${s}\n\nThis explainer is presented in plain language and is strictly educational. It does not constitute legal advice nor express any political position. Refer to official sources — Kenya Law, the IEBC, and the National Treasury — for primary documents.\n\nKey points:\n• Why this matters for everyday Kenyans.\n• How the relevant institutions interact.\n• Where to read the source material in full.`;

export const POSTS: Post[] = [
  {
    id: "p1",
    title: "The Bill of Rights, Chapter Four",
    summary:
      "Chapter Four of the Constitution lists the rights every Kenyan holds — civil, political, social and economic.",
    body: lorem(
      "Chapter Four binds the State and every person. It covers life, equality, dignity, freedom and security of the person, privacy, expression, assembly, and access to information.",
    ),
    category: "Rights",
    author: "KNCHR Explainer",
    handle: "@knchr_civic",
    avatarGradient: GRADS.red,
    cover: GRADS.red,
    postedAt: "2026-01-28T07:30:00Z",
    readMinutes: 4,
    likes: 312,
    comments: 24,
  },
  {
    id: "p2",
    title: "How counties raise and spend money",
    summary:
      "Equitable share, own-source revenue and conditional grants — the three streams that fund county governments.",
    body: lorem(
      "Counties receive an equitable share from national revenue. They also collect their own revenue and may receive conditional grants for specific programmes.",
    ),
    category: "Public Finance",
    author: "Treasury Watch",
    handle: "@treasury_watch",
    avatarGradient: GRADS.earth,
    cover: GRADS.earth,
    postedAt: "2026-02-19T12:00:00Z",
    readMinutes: 6,
    likes: 488,
    comments: 41,
  },
  {
    id: "p3",
    title: "What the IEBC does between elections",
    summary:
      "Voter registration, boundary reviews, and civic education are year-round duties — not just election-day work.",
    body: lorem(
      "The Independent Electoral and Boundaries Commission manages voter registers, conducts referenda and by-elections, and reviews constituency and ward boundaries.",
    ),
    category: "Elections",
    author: "IEBC Civic",
    handle: "@iebc_civic",
    avatarGradient: GRADS.green,
    cover: GRADS.green,
    postedAt: "2026-03-14T15:45:00Z",
    readMinutes: 5,
    likes: 226,
    comments: 18,
  },
  {
    id: "p4",
    title: "The three arms of Government",
    summary:
      "Legislature, Executive and Judiciary — separate powers, mutual checks.",
    body: lorem(
      "Article 1 of the Constitution vests sovereign power in the people of Kenya, exercised either directly or through democratically elected representatives.",
    ),
    category: "Government",
    author: "CivicIntel",
    handle: "@civicintel",
    avatarGradient: GRADS.blackRed,
    cover: GRADS.blackRed,
    postedAt: "2026-04-02T09:15:00Z",
    readMinutes: 7,
    likes: 651,
    comments: 73,
  },
  {
    id: "p5",
    title: "Public participation, explained",
    summary:
      "Article 10 makes public participation a national value. Here is what it looks like in practice.",
    body: lorem(
      "Public participation means meaningful opportunities for citizens to contribute to decisions before they are finalised — through hearings, written submissions, and county forums.",
    ),
    category: "Government",
    author: "CivicIntel",
    handle: "@civicintel",
    avatarGradient: GRADS.red,
    cover: GRADS.green,
    postedAt: "2026-05-18T18:05:00Z",
    readMinutes: 5,
    likes: 402,
    comments: 36,
  },
];

export function timeAgo(iso: string, now: Date = new Date("2026-06-08T12:00:00Z")): string {
  const t = new Date(iso).getTime();
  const diffMin = Math.max(1, Math.round((now.getTime() - t) / 60000));
  if (diffMin < 60) return `${diffMin}m`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w`;
  return new Date(iso).toLocaleDateString("en-KE", { month: "short", day: "numeric" });
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(n / 1000) + "k";
}
