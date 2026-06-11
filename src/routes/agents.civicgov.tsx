import { createFileRoute } from "@tanstack/react-router";
import { AgentChat } from "@/components/AgentChat";

export const Route = createFileRoute("/agents/civicgov")({
  head: () => ({
    meta: [
      { title: "CivicGov AI — CivicIntel" },
      { name: "description", content: "How to access government and public services in plain language." },
    ],
  }),
  component: () => (
    <AgentChat
      persona="civicgov"
      eyebrow="CivicGov AI · Public services"
      title="CivicGov"
      description="Explainers on eCitizen, Huduma, KRA, NTSA, and county services."
      accentGradient="linear-gradient(135deg,#000 0%,#3a1f00 45%,#006600 100%)"
      groundRules={
        <>
          I explain processes, documents, and typical steps for public services. I cannot promise specific outcomes or timelines — always verify on the official portal.
        </>
      }
      suggestions={[
        "How do I apply for a national ID through Huduma?",
        "What does eCitizen do?",
        "How is KRA PIN registration done?",
      ]}
    />
  ),
});
