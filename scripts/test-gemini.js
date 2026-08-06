#!/usr/bin/env node
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set. Export GEMINI_API_KEY and rerun the script.");
  process.exit(1);
}

const systemPrompt = `You are CivicIntel — a neutral civic education assistant for Kenya.
Answer in plain English unless the user asks for Kiswahili. Keep responses short and factual.`;

const body = {
  model: "models/gemini-3.1-flash-lite",
  systemInstruction: {
    parts: [{ text: systemPrompt }],
  },
  contents: [
    {
      role: "user",
      parts: [{ text: "What is the capital of Kenya and one civic fact about it?" }],
    },
  ],
};

async function main() {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    console.error(`Gemini API returned ${res.status}: ${text}`);
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", error);
    console.error(text);
    process.exit(1);
  }

  const candidateText = [
    ...(json.candidates ?? [])
      .flatMap((candidate) => candidate.content ?? [])
      .flatMap((content) => content.parts ?? [])
      .map((part) => part.text ?? ""),
  ]
    .join("")
    .trim();

  if (!candidateText) {
    console.error("Gemini returned no text content.");
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  console.log("Gemini test response:");
  console.log(candidateText);
  process.exit(0);
}

main().catch((error) => {
  console.error("Unexpected error while calling Gemini:", error);
  process.exit(1);
});
