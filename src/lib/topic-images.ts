// Contextual imagery for civic topics and cards, keyed by category so every
// card gets an image that actually matches its subject (never the wildlife
// stock photo previously used everywhere). Sources are CC-licensed or public
// domain photographs from Wikimedia Commons — see credit fields below, which
// mirror the attribution shown on the IP & Copyright Notice page.

import parliament from "@/assets/topics/parliament.jpg";
import supremeCourt from "@/assets/topics/supreme-court.jpg";
import ballotBox from "@/assets/topics/ballot-box.jpg";
import countyHall from "@/assets/topics/county-hall.jpg";
import centralBank from "@/assets/topics/central-bank.jpg";
import timesTower from "@/assets/topics/times-tower.jpg";

export type TopicImageCategory =
  | "legislative"
  | "judiciary"
  | "elections"
  | "devolution"
  | "budget"
  | "tax";

export type TopicImage = { src: string; alt: string; credit: string };

const CATEGORY_IMAGES: Record<TopicImageCategory, TopicImage> = {
  legislative: {
    src: parliament,
    alt: "Parliament Buildings, Nairobi",
    credit: "Jorge Láscar, CC BY-SA 2.0, via Wikimedia Commons",
  },
  judiciary: {
    src: supremeCourt,
    alt: "Supreme Court of Kenya",
    credit: "Francis Akuka / Wikimedia Foundation, CC0, via Wikimedia Commons",
  },
  elections: {
    src: ballotBox,
    alt: "A sealed ballot box",
    credit: "Smithsonian Institution, public domain, via Wikimedia Commons",
  },
  devolution: {
    src: countyHall,
    alt: "Nairobi City Hall, seat of Nairobi City County government",
    credit: "Jorge Láscar, CC BY-SA 2.0, via Wikimedia Commons",
  },
  budget: {
    src: centralBank,
    alt: "Central Bank of Kenya",
    credit: "Sidhanta Khuntia, CC BY-SA 4.0, via Wikimedia Commons",
  },
  tax: {
    src: timesTower,
    alt: "Times Tower, Nairobi — Kenya Revenue Authority headquarters",
    credit: "Ruslik0, CC BY-SA 4.0, via Wikimedia Commons",
  },
};

const TOPIC_SLUG_CATEGORY: Record<string, TopicImageCategory> = {
  "three-branches": "legislative",
  "rights-overview": "judiciary",
  "how-a-bill-becomes-law": "legislative",
  "voting-basics": "elections",
};

const DEFAULT_CATEGORY: TopicImageCategory = "legislative";

/** Looks up the contextual image for a civic-content topic slug, falling back
 * to the legislative/Parliament image for any slug not yet mapped so a card
 * never renders broken. */
export function getTopicImage(slug: string): TopicImage {
  return CATEGORY_IMAGES[TOPIC_SLUG_CATEGORY[slug] ?? DEFAULT_CATEGORY];
}

export function getCategoryImage(category: TopicImageCategory): TopicImage {
  return CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES[DEFAULT_CATEGORY];
}
