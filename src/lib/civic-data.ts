// Static, neutral civic / economic data for the Kenya-focused MVP.
// Values are illustrative snapshots, not live feeds. The UI is honest
// about that: every panel labels its data as "indicative" and points to
// official sources.

export type FxRow = { code: string; name: string; flag: string; rate: number; trend: number };

// Indicative KES quotes (KES per 1 unit of foreign currency).
export const FX_RATES: FxRow[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", rate: 129.4, trend: -0.3 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", rate: 140.2, trend: +0.5 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: 164.8, trend: +0.2 },
  { code: "UGX", name: "Ugandan Shilling (per 100)", flag: "🇺🇬", rate: 3.45, trend: 0 },
  { code: "TZS", name: "Tanzanian Shilling (per 100)", flag: "🇹🇿", rate: 4.92, trend: -0.1 },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", rate: 7.05, trend: +0.4 },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", rate: 35.2, trend: -0.1 },
];

export type CommodityRow = { name: string; unit: string; price: number; trend: number; note: string };

export const COMMODITIES: CommodityRow[] = [
  { name: "Maize (90 kg bag)", unit: "KES", price: 4250, trend: -1.2, note: "Wholesale, Eldoret indicative" },
  { name: "Wheat (90 kg bag)", unit: "KES", price: 5180, trend: +0.4, note: "Wholesale, indicative" },
  { name: "Beans (90 kg bag)", unit: "KES", price: 9200, trend: +0.8, note: "Wholesale, mixed grade" },
  { name: "Rice (50 kg, Pishori)", unit: "KES", price: 9800, trend: 0, note: "Wholesale, Mwea" },
  { name: "Milk (per litre, farmgate)", unit: "KES", price: 48, trend: +0.3, note: "Indicative average" },
];

export type FuelRow = { product: string; nairobi: number; mombasa: number; kisumu: number };

export const FUEL_PRICES: FuelRow[] = [
  { product: "Super Petrol", nairobi: 188.6, mombasa: 185.2, kisumu: 191.4 },
  { product: "Diesel", nairobi: 171.1, mombasa: 167.6, kisumu: 174.0 },
  { product: "Kerosene", nairobi: 155.4, mombasa: 152.0, kisumu: 158.3 },
];

export type MacroRow = { label: string; value: string; trend: number; note: string };

export const MACRO_INDICATORS: MacroRow[] = [
  { label: "Headline inflation (YoY)", value: "4.3%", trend: -0.2, note: "KNBS — illustrative" },
  { label: "CBR (Central Bank Rate)", value: "10.75%", trend: -0.25, note: "CBK — illustrative" },
  { label: "Interbank rate", value: "11.20%", trend: +0.1, note: "CBK — illustrative" },
  { label: "Govt 91-day T-bill", value: "10.95%", trend: -0.05, note: "CBK weekly auction" },
];

// ───────────────────────────── News Hub ─────────────────────────────
export type NewsItem = {
  id: string;
  title: string;
  source: string;
  category: "Governance" | "Public Finance" | "Rights" | "Elections" | "County";
  publishedAt: string;
  summary: string;
  cover: string; // CSS gradient
};

const G = {
  red: "linear-gradient(135deg,#000 0%,#990000 60%,#006600 100%)",
  green: "linear-gradient(160deg,#006600 0%,#000 55%,#990000 100%)",
  earth: "linear-gradient(135deg,#1a1a1a 0%,#3a1f00 50%,#006600 100%)",
  blackRed: "linear-gradient(200deg,#990000 0%,#000 50%,#006600 100%)",
};

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Budget Policy Statement tabled in the National Assembly",
    source: "Parliament Watch",
    category: "Public Finance",
    publishedAt: "2026-06-05T08:00:00Z",
    summary:
      "The Treasury's Budget Policy Statement outlines spending ceilings and revenue targets. The document goes through committee review and public participation before adoption.",
    cover: G.earth,
  },
  {
    id: "n2",
    title: "IEBC publishes draft civic-education calendar",
    source: "IEBC Civic",
    category: "Elections",
    publishedAt: "2026-05-30T10:00:00Z",
    summary:
      "The Commission invites written memoranda on planned voter-education activities. Submissions can be sent through county election offices.",
    cover: G.green,
  },
  {
    id: "n3",
    title: "Supreme Court clarifies thresholds for public-interest standing",
    source: "Kenya Law",
    category: "Rights",
    publishedAt: "2026-05-21T14:30:00Z",
    summary:
      "A new ruling restates when individuals can move the court on matters of constitutional interpretation. The decision is presented in plain language for the public.",
    cover: G.red,
  },
  {
    id: "n4",
    title: "County Assemblies publish revised public-participation guidelines",
    source: "Council of Governors",
    category: "County",
    publishedAt: "2026-05-12T07:45:00Z",
    summary:
      "Standardised templates for written submissions and hearing notices aim to reduce confusion across counties.",
    cover: G.blackRed,
  },
  {
    id: "n5",
    title: "Office of the Auditor-General releases county audit highlights",
    source: "OAG",
    category: "Governance",
    publishedAt: "2026-05-02T09:00:00Z",
    summary:
      "Annual reports for the last financial year cover own-source revenue, pending bills, and asset registers. Full reports are available on the OAG portal.",
    cover: G.earth,
  },
];

// ───────────────────────────── Civic Calendar ─────────────────────────────
export type CivicEvent = {
  id: string;
  title: string;
  date: string; // ISO
  type: "Holiday" | "Public participation" | "Free service" | "Scholarship" | "Health" | "Civic program";
  location: string;
  description: string;
};

export const CIVIC_EVENTS: CivicEvent[] = [
  {
    id: "e1",
    title: "Madaraka Day",
    date: "2026-06-01T00:00:00Z",
    type: "Holiday",
    location: "Nationwide",
    description: "Public holiday marking attainment of internal self-rule.",
  },
  {
    id: "e2",
    title: "County Budget public hearing — Nairobi",
    date: "2026-06-14T09:00:00Z",
    type: "Public participation",
    location: "City Hall, Nairobi",
    description: "Citizens may attend or submit written memoranda before the close of the comment period.",
  },
  {
    id: "e3",
    title: "Huduma Centre extended-hours weekend",
    date: "2026-06-21T08:00:00Z",
    type: "Free service",
    location: "All Huduma Centres",
    description: "ID, NHIF/NSSF and KRA PIN services available on Saturday.",
  },
  {
    id: "e4",
    title: "Equity Wings to Fly applications open",
    date: "2026-07-01T00:00:00Z",
    type: "Scholarship",
    location: "Online",
    description: "Secondary-school scholarship intake for top-performing KCPE candidates. Verify on the official portal.",
  },
  {
    id: "e5",
    title: "Free maternal-health screening week",
    date: "2026-07-13T08:00:00Z",
    type: "Health",
    location: "Selected Level-4 hospitals",
    description: "Walk-in screenings; bring an ID and any prior clinic records.",
  },
  {
    id: "e6",
    title: "Mashujaa Day",
    date: "2026-10-20T00:00:00Z",
    type: "Holiday",
    location: "Nationwide",
    description: "Public holiday honouring those who contributed to the struggle for independence.",
  },
];

// ───────────────────────────── Service locator ─────────────────────────────
export type ServicePlace = {
  id: string;
  name: string;
  type: "Huduma" | "Hospital" | "Police" | "Court" | "County office" | "Legal aid";
  county: string;
  address: string;
  hours: string;
  phone?: string;
  // Coordinates for "Open in maps"
  lat: number;
  lng: number;
};

export const SERVICE_PLACES: ServicePlace[] = [
  {
    id: "s1",
    name: "Huduma Centre — GPO",
    type: "Huduma",
    county: "Nairobi",
    address: "Teleposta Towers, Kenyatta Ave",
    hours: "Mon–Fri 7:00–17:00, Sat 8:00–13:00",
    phone: "020 690 0020",
    lat: -1.2864,
    lng: 36.8233,
  },
  {
    id: "s2",
    name: "Kenyatta National Hospital",
    type: "Hospital",
    county: "Nairobi",
    address: "Hospital Rd, Upper Hill",
    hours: "Open 24 hours",
    phone: "020 272 6300",
    lat: -1.3013,
    lng: 36.8073,
  },
  {
    id: "s3",
    name: "Central Police Station — Nairobi",
    type: "Police",
    county: "Nairobi",
    address: "University Way",
    hours: "Open 24 hours",
    phone: "999",
    lat: -1.2818,
    lng: 36.8225,
  },
  {
    id: "s4",
    name: "Milimani Law Courts",
    type: "Court",
    county: "Nairobi",
    address: "Milimani Rd",
    hours: "Mon–Fri 8:00–17:00",
    lat: -1.2922,
    lng: 36.8094,
  },
  {
    id: "s5",
    name: "Kisii County Headquarters",
    type: "County office",
    county: "Kisii",
    address: "Hospital Rd, Kisii Town",
    hours: "Mon–Fri 8:00–17:00",
    lat: -0.6817,
    lng: 34.7796,
  },
  {
    id: "s6",
    name: "Kituo Cha Sheria — Legal Aid",
    type: "Legal aid",
    county: "Nairobi",
    address: "Ole Odume Rd, Kilimani",
    hours: "Mon–Fri 9:00–17:00",
    phone: "020 387 6290",
    lat: -1.2901,
    lng: 36.7848,
  },
  {
    id: "s7",
    name: "Mombasa Huduma Centre",
    type: "Huduma",
    county: "Mombasa",
    address: "Treasury Sq, Mombasa",
    hours: "Mon–Fri 7:00–17:00",
    phone: "041 222 4444",
    lat: -4.0617,
    lng: 39.6699,
  },
];

export function trendArrow(t: number) {
  if (t > 0) return "▲";
  if (t < 0) return "▼";
  return "■";
}

export function trendClass(t: number) {
  if (t > 0) return "text-[color:var(--ke-green)]";
  if (t < 0) return "text-[color:var(--ke-red)]";
  return "text-muted-foreground";
}
