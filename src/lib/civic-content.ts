// Static, neutral civic education content. No user-generated content.
// Sources are noted where applicable and content is presented as explanatory,
// not as legal advice or political commentary.

export type Topic = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  source?: string;
};

export const topics: Topic[] = [
  {
    slug: "three-branches",
    title: "The Three Branches of Government",
    summary:
      "A neutral overview of how legislative, executive, and judicial powers are separated and balanced.",
    sections: [
      {
        heading: "Legislative",
        body: "The legislative branch writes laws. In a bicameral system, it is typically composed of two chambers that propose, debate, and vote on legislation. It also controls public spending and may oversee the executive branch.",
      },
      {
        heading: "Executive",
        body: "The executive branch enforces and administers laws. It is led by a head of government (and sometimes a separate head of state) and includes agencies that implement policy and provide public services.",
      },
      {
        heading: "Judicial",
        body: "The judicial branch interprets laws and resolves disputes. Courts review whether laws and government actions comply with the constitution. Judicial decisions are typically binding precedent within their jurisdiction.",
      },
      {
        heading: "Checks and balances",
        body: "Each branch has formal powers to limit the others — for example, vetoing legislation, confirming appointments, or reviewing the constitutionality of laws. The goal is to prevent concentration of power.",
      },
    ],
  },
  {
    slug: "rights-overview",
    title: "Civil Rights and Civil Liberties",
    summary:
      "An educational overview of common categories of rights protected in constitutional democracies.",
    sections: [
      {
        heading: "Civil liberties",
        body: "Civil liberties are protections against government action — for example, freedom of expression, freedom of religion, due process, and protection from unreasonable searches.",
      },
      {
        heading: "Civil rights",
        body: "Civil rights protect individuals from discrimination by government or, in many jurisdictions, by private actors in employment, housing, education, and public accommodations.",
      },
      {
        heading: "Limits and exceptions",
        body: "Most rights are not absolute. Courts often weigh individual rights against compelling public interests. The specific scope, exceptions, and remedies depend on your jurisdiction and the facts of the case.",
      },
      {
        heading: "Important",
        body: "This information is educational. It is not legal advice. For questions about how the law applies to a specific situation, consult a licensed attorney in your jurisdiction.",
      },
    ],
  },
  {
    slug: "how-a-bill-becomes-law",
    title: "How a Bill Becomes Law",
    summary: "The general path from a proposed idea to enforceable legislation.",
    sections: [
      {
        heading: "Introduction",
        body: "A legislator introduces a bill. It is typically assigned a number and referred to a committee with jurisdiction over its subject matter.",
      },
      {
        heading: "Committee review",
        body: "Committees hold hearings, take expert and public input, and may amend the bill. Many bills do not advance beyond this stage.",
      },
      {
        heading: "Floor debate and vote",
        body: "If a bill clears committee, the full chamber debates and votes. In bicameral systems, both chambers must pass identical text, often after a reconciliation process.",
      },
      {
        heading: "Executive action",
        body: "The head of the executive branch typically signs the bill into law, vetoes it, or allows it to become law without signature. Some systems allow the legislature to override a veto with a supermajority.",
      },
    ],
  },
  {
    slug: "voting-basics",
    title: "Voting: Eligibility and Process",
    summary:
      "General concepts that apply in most democratic systems. Specific rules vary by country and locality.",
    sections: [
      {
        heading: "Eligibility",
        body: "Eligibility commonly depends on citizenship, age, and residency. Some jurisdictions have additional rules about registration deadlines or identification.",
      },
      {
        heading: "Registration",
        body: "Many places require voters to register in advance. Some offer same-day or automatic registration. Check your local election authority for current deadlines and methods.",
      },
      {
        heading: "Casting a ballot",
        body: "Voters typically choose between in-person voting on election day, early in-person voting, or mail / absentee ballots where available. Each method has its own deadlines.",
      },
      {
        heading: "After the vote",
        body: "Ballots are counted under procedures designed to ensure accuracy. Most jurisdictions provide for audits, recounts, and legal challenges under defined rules.",
      },
    ],
  },
];

export type GlossaryEntry = { term: string; definition: string };

export const glossary: GlossaryEntry[] = [
  { term: "Bicameral", definition: "A legislature composed of two separate chambers." },
  { term: "Bill", definition: "A proposed law under consideration by a legislature." },
  { term: "Cabinet", definition: "A group of senior executive officials advising the head of government." },
  { term: "Constituent", definition: "A person represented by an elected official, usually a resident of that official's district." },
  { term: "Constitution", definition: "The fundamental law establishing the structure and limits of a government." },
  { term: "Due process", definition: "The legal requirement that the state respect established legal rights and procedures." },
  { term: "Filibuster", definition: "A procedural tactic used to delay or block a legislative vote." },
  { term: "Judicial review", definition: "The power of courts to assess whether a law or government action complies with the constitution." },
  { term: "Quorum", definition: "The minimum number of members required for an assembly to conduct official business." },
  { term: "Referendum", definition: "A direct vote by the electorate on a specific proposal." },
  { term: "Separation of powers", definition: "The division of government responsibilities into distinct branches to prevent concentration of power." },
  { term: "Veto", definition: "A formal rejection by an executive of legislation passed by a legislature." },
];
