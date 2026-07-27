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
