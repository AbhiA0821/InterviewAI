/**
 * utils.ts
 * ---------
 * Shared utility functions. Includes the `cn` helper used by shadcn/ui
 * components to merge Tailwind class names safely.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numerical score with optional max score denominator.
 */
export function formatScore(score: number, maxScore: number = 100): string {
  if (isNaN(score) || score === null) return "N/A";
  return `${Math.round(score)}/${maxScore}`;
}

/**
 * Format seconds into mm:ss display string.
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Safely truncate long text strings with ellipsis.
 */
export function truncateText(text: string, maxLength: number = 60): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

