import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Delimiter used when summary is stored as 2 points (must match ingestor) */
const SUMMARY_POINTS_DELIMITER = "|||";

/**
 * Returns 1–2 summary points for display as bullets. Falls back to single string if no delimiter.
 */
export function getSummaryPoints(extendedSummary: string | null): string[] {
  if (!extendedSummary?.trim()) return [];
  const parts = extendedSummary.split(SUMMARY_POINTS_DELIMITER).map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [extendedSummary.trim()];
}
