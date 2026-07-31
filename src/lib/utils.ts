import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shares via the Web Share API where available, falling back to copying the link. */
export async function shareContent(data: { title: string; text?: string; url?: string }) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(data.url ?? data.title);
  }
}
