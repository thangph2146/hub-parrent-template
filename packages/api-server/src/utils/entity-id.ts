/**
 * Entity ID Utilities
 * Helper functions for working with entity IDs
 */

/**
 * Convert string ID to number
 * Handles various input formats
 */
export function toEntityId(id: string | number): number {
  if (typeof id === "number") return id
  const trimmed = id.trim()
  const parsed = parseInt(trimmed, 10)
  if (isNaN(parsed)) {
    throw new Error(`Invalid entity ID: ${id}`)
  }
  return parsed
}

/**
 * Convert string or number ID to number
 * Returns default if invalid
 */
export function toEntityIdOrDefault(
  id: string | number,
  defaultValue: number = 0
): number {
  try {
    return toEntityId(id)
  } catch {
    return defaultValue
  }
}

/**
 * Convert list of IDs to numbers
 */
export function toEntityIdList(ids: (string | number)[]): number[] {
  return ids.map((id) => toEntityId(id))
}

/**
 * Check if string is a valid numeric ID
 */
export function isNumericId(id: string): boolean {
  return /^\d+$/.test(id.trim())
}

/**
 * Parse ID from various formats
 * Supports: numeric string, UUID, etc.
 */
export function parseEntityId(id: string | number): number | string {
  if (typeof id === "number") return id
  const trimmed = id.trim()
  if (isNumericId(trimmed)) {
    return parseInt(trimmed, 10)
  }
  return trimmed
}

/**
 * Validate entity ID format
 */
export function isValidEntityId(id: string | number): boolean {
  if (typeof id === "number") return id > 0
  const trimmed = id.trim()
  return isNumericId(trimmed) || isUUID(trimmed)
}

/**
 * Simple UUID validation
 */
function isUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}
