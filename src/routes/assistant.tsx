import { createFileRoute } from "@tanstack/react-router";
import { AgentChat } from "@/components/AgentChat";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Ask — CivicIntel" },
      {
        name: "description",
        content:
          "Ask a neutral, educational AI explainer about how government, rights, and civic processes work.",
      },
    ],
  }),
  component: () => (
    <AgentChat
      persona="civic"
      eyebrow="Educational explainer"
      title="Ask CivicIntel"
      description="A neutral AI guide. It explains concepts — not legal advice, not political commentary."
      groundRules={
        <>
          I can explain civic concepts — how government is structured, how laws are made, and what
          categories of rights exist. I won&apos;t give legal advice or take political positions.
        </>
      }
      suggestions={[
        "What is judicial review?",
        "How does a bill become law?",
        "What is the difference between civil rights and civil liberties?",
        "Summarise a budget or public-finance document in plain language",
        "Explain the rights you have during a police stop or court case",
        "Show me how to access county services and the documents I need",
      ]}
    />
  ),
});
