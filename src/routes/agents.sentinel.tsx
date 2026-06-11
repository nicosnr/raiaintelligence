import { createFileRoute } from "@tanstack/react-router";
import { AgentChat } from "@/components/AgentChat";

export const Route = createFileRoute("/agents/sentinel")({
  head: () => ({
    meta: [
      { title: "Sentinel AI — CivicIntel" },
      { name: "description", content: "Educational explainer on police process, public safety, and reporting." },
    ],
  }),
  component: () => (
    <AgentChat
      persona="sentinel"
      eyebrow="Sentinel AI · Public safety"
      title="Sentinel"
      description="Educational guidance on police processes, your rights when interacting with officers, and how to report."
      accentGradient="linear-gradient(135deg,#000 0%,#990000 70%,#3a0000 100%)"
      groundRules={
        <>
          I explain processes — how to report, what an OB number is, rights of arrested persons, and the role of the IPOA.
          For an active emergency, <strong>call 999 or 112</strong> immediately.
        </>
      }
      suggestions={[
        "What is an OB number and why does it matter?",
        "What are the rights of an arrested person in Kenya?",
        "How do I file a complaint about police misconduct?",
      ]}
    />
  ),
});
