/**
 * Date Utilities Tests
 */
import {
  safeIsoString,
  safeIsoStringNow,
  parseDate,
  isValidDate,
  formatDate,
  formatDateTime,
} from "./date-utils"

describe("date-utils", () => {
  describe("safeIsoString", () => {
    it("should return ISO string for Date", () => {
      const date = new Date("2024-01-15T10:30:00Z")
      expect(safeIsoString(date)).toBe("2024-01-15T10:30:00.000Z")
    })

    it("should return string as-is", () => {
      const dateStr = "2024-01-15T10:30:00Z"
      expect(safeIsoString(dateStr)).toBe(dateStr)
    })

    it("should return null for null", () => {
      expect(safeIsoString(null)).toBeNull()
    })

    it("should return null for undefined", () => {
      expect(safeIsoString(undefined)).toBeNull()
    })
  })

  describe("safeIsoStringNow", () => {
    it("should return ISO string for Date", () => {
      const date = new Date("2024-01-15T10:30:00Z")
      expect(safeIsoStringNow(date)).toBe("2024-01-15T10:30:00.000Z")
    })

    it("should return current date for null", () => {
      const before = new Date()
      const result = safeIsoStringNow(null)
      const after = new Date()
      expect(new Date(result).getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      )
      expect(new Date(result).getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it("should return current date for undefined", () => {
      const before = new Date()
      const result = safeIsoStringNow(undefined)
      // Result should be >= before (within same timestamp check window)
      expect(new Date(result).getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      )
    })
  })

  describe("parseDate", () => {
    it("should return Date for valid date string", () => {
      const result = parseDate("2024-01-15")
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(0) // January is 0
      expect(result?.getDate()).toBe(15)
    })

    it("should return Date as-is", () => {
      const date = new Date("2024-01-15")
      expect(parseDate(date)).toBe(date)
    })

    it("should return null for null", () => {
      expect(parseDate(null)).toBeNull()
    })

    it("should return null for invalid string", () => {
      expect(parseDate("invalid-date")).toBeNull()
    })
  })

  describe("isValidDate", () => {
    it("should return true for valid Date", () => {
      expect(isValidDate(new Date())).toBe(true)
    })

    it("should return true for valid date string", () => {
      expect(isValidDate("2024-01-15")).toBe(true)
    })

    it("should return false for null", () => {
      expect(isValidDate(null)).toBe(false)
    })

    it("should return false for undefined", () => {
      expect(isValidDate(undefined)).toBe(false)
    })

    it("should return false for invalid date string", () => {
      expect(isValidDate("not-a-date")).toBe(false)
    })
  })

  describe("formatDate", () => {
    it("should format date for Vietnamese locale", () => {
      const result = formatDate(new Date(2024, 0, 15), "vi-VN")
      expect(result).toContain("15")
      expect(result).toContain("2024")
    })

    it("should return empty string for null", () => {
      expect(formatDate(null)).toBe("")
    })
  })

  describe("formatDateTime", () => {
    it("should format datetime for Vietnamese locale", () => {
      const result = formatDateTime(new Date(2024, 0, 15, 10, 30), "vi-VN")
      expect(result).toContain("15")
      expect(result).toContain("2024")
    })

    it("should return empty string for null", () => {
      expect(formatDateTime(null)).toBe("")
    })
  })
})
