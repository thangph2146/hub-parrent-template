/**
 * Date Utilities
 * Helper functions for date handling
 */

/**
 * Convert Date to ISO string safely
 * Returns null if date is null/undefined
 */
export function safeIsoString(
  date: Date | string | null | undefined
): string | null {
  if (!date) return null
  if (typeof date === "string") return date
  return date.toISOString()
}

/**
 * Convert Date to ISO string using current time if null
 * Always returns a string
 */
export function safeIsoStringNow(
  date: Date | string | null | undefined
): string {
  if (!date) return new Date().toISOString()
  if (typeof date === "string") return date
  return date.toISOString()
}

/**
 * Parse date from various formats
 */
export function parseDate(
  input: string | Date | null | undefined
): Date | null {
  if (!input) return null
  if (input instanceof Date) return input
  const parsed = new Date(input)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Check if date is valid
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false
  if (date instanceof Date) return !isNaN(date.getTime())
  const parsed = new Date(date)
  return !isNaN(parsed.getTime())
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string | null | undefined,
  locale = "vi-VN"
): string {
  const parsed = parseDate(date)
  if (!parsed) return ""
  return parsed.toLocaleDateString(locale)
}

/**
 * Format datetime for display
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  locale = "vi-VN"
): string {
  const parsed = parseDate(date)
  if (!parsed) return ""
  return parsed.toLocaleString(locale)
}
