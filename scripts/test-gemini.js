#!/usr/bin/env node
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set. Export GEMINI_API_KEY and rerun the script.");
  process.exit(1);
}

const systemPrompt = `You are CivicIntel — a neutral civic education assistant for Kenya.
Answer in plain English unless the user asks for Kiswahili. Keep responses short and factual.`;

const body = {
  model: "gemini-2.0-flash",
  temperature: 0.2,
  max_output_tokens: 256,
  messages: [
    {
      author: "system",
      content: [{ type: "text", text: systemPrompt }],
    },
    {
      author: "user",
      content: [{ type: "text", text: "What is the capital of Kenya and one civic fact about it?" }],
    },
  ],
};

async function main() {
  const res = await fetch(
    `https://gemini.googleapis.com/v1/models/gemini-2.0-flash:generateMessage?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    ...(json.candidates ?? []).flatMap((candidate) => candidate.content ?? []),
    ...(json.output ?? []).flatMap((candidate) => candidate.content ?? []),
  ]
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
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
