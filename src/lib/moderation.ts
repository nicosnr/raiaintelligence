export type ModerationResult =
  | { allowed: true }
  | { allowed: false; reason: string };

const BLOCKED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern:
      /\b(corrupt|thief|steal|expose|whistleblow|scandal)\b.*\b(president|governor|mp|senator|minister|official)\b/i,
    reason:
      "I focus on neutral civic education. Try asking how a process or institution works instead.",
  },
  {
    pattern: /\brate\s+(this|the)\s+(leader|politician|president|governor|mp)\b/i,
    reason: "I don't rate or rank officials. I can explain their role in government instead.",
  },
  {
    pattern: /\bignore\s+(all\s+)?(previous|prior)\s+instructions\b/i,
    reason: "I can only help with neutral civic education questions.",
  },
  {
    pattern: /\b(act\s+as|pretend\s+to\s+be|you\s+are\s+now)\s+(DAN|jailbreak|unrestricted)/i,
    reason: "I can only help with neutral civic education questions.",
  },
  {
    pattern: /\b(how\s+to|help\s+me)\s+(bribe|forge|evade|hack|assassinate|attack)\b/i,
    reason: "I can't help with that. I can explain lawful civic processes instead.",
  },
  {
    pattern: /\breport\s+(corruption|a\s+corrupt)\b.*\b(name|who)\b/i,
    reason:
      "I explain civic processes, not investigations. For official reporting channels, ask how a relevant agency works.",
  },
];

export function moderateUserInput(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { allowed: false, reason: "Please enter a question." };
  }
  if (trimmed.length > 2000) {
    return { allowed: false, reason: "Message is too long. Please keep it under 2,000 characters." };
  }

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { allowed: false, reason };
    }
  }

  return { allowed: true };
}
