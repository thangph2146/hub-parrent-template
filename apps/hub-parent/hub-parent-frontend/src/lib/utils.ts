import { clsx, type ClassValue } from "clsx"
import { twMerge } from "@ui/lib/tw-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique identifier.
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
