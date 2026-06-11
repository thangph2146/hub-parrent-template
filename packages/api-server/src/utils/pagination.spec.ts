/**
 * Pagination Utilities Tests
 */
import {
  normalizePageLimit,
  buildPaginationMeta,
  calculateOffset,
  isValidPagination,
  getPaginationRange,
} from "./pagination"

describe("pagination utilities", () => {
  describe("normalizePageLimit", () => {
    it("should normalize valid pagination", () => {
      expect(normalizePageLimit(1, 10)).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      })
    })

    it("should enforce minimum page of 1", () => {
      expect(normalizePageLimit(0, 10)).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      })
      expect(normalizePageLimit(-5, 10)).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      })
    })

    it("should enforce maximum limit", () => {
      expect(normalizePageLimit(1, 500, 100)).toEqual({
        page: 1,
        limit: 100,
        skip: 0,
      })
    })

    it("should calculate correct skip", () => {
      expect(normalizePageLimit(3, 10)).toEqual({
        page: 3,
        limit: 10,
        skip: 20,
      })
    })

    it("should handle string inputs", () => {
      expect(normalizePageLimit("2", "15")).toEqual({
        page: 2,
        limit: 15,
        skip: 15,
      })
    })
  })

  describe("buildPaginationMeta", () => {
    it("should build correct pagination metadata", () => {
      expect(buildPaginationMeta(1, 10, 100)).toEqual({
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
      })
    })

    it("should handle zero total", () => {
      expect(buildPaginationMeta(1, 10, 0)).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      })
    })

    it("should round up total pages", () => {
      expect(buildPaginationMeta(1, 10, 95)).toEqual({
        page: 1,
        limit: 10,
        total: 95,
        totalPages: 10,
      })
    })
  })

  describe("calculateOffset", () => {
    it("should calculate correct offset", () => {
      expect(calculateOffset(1, 10)).toBe(0)
      expect(calculateOffset(2, 10)).toBe(10)
      expect(calculateOffset(3, 10)).toBe(20)
    })

    it("should enforce minimum page of 1", () => {
      expect(calculateOffset(0, 10)).toBe(0)
      expect(calculateOffset(-1, 10)).toBe(0)
    })
  })

  describe("isValidPagination", () => {
    it("should return true for valid pagination", () => {
      expect(isValidPagination(1, 10)).toBe(true)
      expect(isValidPagination(100, 50)).toBe(true)
    })

    it("should return false for invalid pagination", () => {
      expect(isValidPagination(0, 10)).toBe(false)
      expect(isValidPagination(1, 0)).toBe(false)
      expect(isValidPagination(-1, 10)).toBe(false)
    })
  })

  describe("getPaginationRange", () => {
    it("should calculate correct range for first page", () => {
      expect(getPaginationRange(1, 10, 100)).toEqual({
        start: 1,
        end: 10,
        total: 100,
      })
    })

    it("should calculate correct range for middle page", () => {
      expect(getPaginationRange(3, 10, 100)).toEqual({
        start: 21,
        end: 30,
        total: 100,
      })
    })

    it("should handle last page with remainder", () => {
      expect(getPaginationRange(10, 10, 95)).toEqual({
        start: 91,
        end: 95,
        total: 95,
      })
    })

    it("should handle empty result", () => {
      expect(getPaginationRange(1, 10, 0)).toEqual({
        start: 0,
        end: 0,
        total: 0,
      })
    })
  })
})
