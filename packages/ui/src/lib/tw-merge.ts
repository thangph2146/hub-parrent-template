import { extendTailwindMerge } from "tailwind-merge"

/** Typography utilities (`@utility text-caption`, …) — font-size, không ghi đè text-{color}. */
const TYPOGRAPHY_FONT_SIZE = [
  "text-display",
  "text-section",
  "text-title",
  "text-body",
  "text-body-lg",
  "text-body-sm",
  "text-caption",
  "text-label",
] as const

export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [...TYPOGRAPHY_FONT_SIZE],
    },
  },
})
