import { createFileRoute } from "@tanstack/react-router";
import { AgentChat } from "@/components/AgentChat";

export const Route = createFileRoute("/agents/justice")({
  head: () => ({
    meta: [
      { title: "Justice AI — CivicIntel" },
      { name: "description", content: "Plain-language legal literacy: courts, processes, and free legal aid." },
    ],
  }),
  component: () => (
    <AgentChat
      persona="justice"
      eyebrow="Justice AI · Legal literacy"
      title="Justice"
      description="How the courts work, how cases move, and where to find free legal aid."
      accentGradient="linear-gradient(135deg,#000 0%,#1a3a1a 50%,#006600 100%)"
      groundRules={
        <>
          I explain concepts and point you to free legal-aid bodies (Kituo Cha Sheria, FIDA, the Public Defender).
          I am <strong>not a lawyer</strong> — for your specific situation, please consult a licensed advocate.
        </>
      }
      suggestions={[
        "What is the difference between civil and criminal cases?",
        "How does small-claims court work in Kenya?",
        "Where can I get free legal aid?",
      ]}
    />
  ),
});
