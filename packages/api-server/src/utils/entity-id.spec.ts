/**
 * Entity ID Utilities Tests.
 *
 * Test các helper từ `common/entity-id.ts` mirror
 * `apps/main/api/src/common/entity-id.ts`.
 */
import {
  toEntityId,
  toEntityIdOrDefault,
  toEntityIdList,
  isNumericId,
  parseEntityId,
  isValidEntityId,
  parseEntityIdLoose,
  toEntityIdListSafe,
  relationEntityId,
  isEntityId,
} from '../common/entity-id';

describe('entity-id utilities', () => {
  describe('toEntityId', () => {
    it('should convert numeric string to number', () => {
      expect(toEntityId('123')).toBe(123);
    });

    it('should convert number to number', () => {
      expect(toEntityId(456)).toBe(456);
    });

    it('should trim whitespace from string', () => {
      expect(toEntityId('  789  ')).toBe(789);
    });

    it('should throw error for invalid numeric string', () => {
      expect(() => toEntityId('abc')).toThrow('Id không hợp lệ');
    });

    it('should throw error for empty string', () => {
      expect(() => toEntityId('')).toThrow('Thiếu id');
    });
  });

  describe('toEntityIdOrDefault', () => {
    it('should return converted ID for valid input', () => {
      expect(toEntityIdOrDefault('123', 0)).toBe(123);
    });

    it('should return default for invalid input', () => {
      expect(toEntityIdOrDefault('abc', 0)).toBe(0);
    });

    it('should return custom default value', () => {
      expect(toEntityIdOrDefault('invalid', 999)).toBe(999);
    });
  });

  describe('toEntityIdList', () => {
    it('should convert array of IDs', () => {
      expect(toEntityIdList(['1', '2', '3'])).toEqual([1, 2, 3]);
    });

    it('should handle mixed types', () => {
      expect(toEntityIdList([1, '2', 3])).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      expect(toEntityIdList([])).toEqual([]);
    });
  });

  describe('toEntityIdListSafe', () => {
    it('should drop non-numeric values', () => {
      expect(toEntityIdListSafe(['1', 'abc', 2, null as unknown as string])).toEqual([1, 2]);
    });
  });

  describe('isNumericId', () => {
    it('should return true for numeric strings', () => {
      expect(isNumericId('123')).toBe(true);
      expect(isNumericId('0')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(isNumericId('abc')).toBe(false);
      expect(isNumericId('12a')).toBe(false);
      expect(isNumericId('')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isNumericId('  123  ')).toBe(true);
    });
  });

  describe('isEntityId', () => {
    it('should return true for positive integer string', () => {
      expect(isEntityId('123')).toBe(true);
    });
    it('should return false for 0 or negative', () => {
      expect(isEntityId('0')).toBe(false);
      expect(isEntityId('-1')).toBe(false);
    });
  });

  describe('parseEntityId (strict)', () => {
    it('should parse numeric string to number', () => {
      expect(parseEntityId('123')).toBe(123);
    });

    it('should return number as-is', () => {
      expect(parseEntityId(456)).toBe(456);
    });

    it('should throw for non-numeric string', () => {
      expect(() => parseEntityId('user-123')).toThrow('Id không hợp lệ');
    });
  });

  describe('parseEntityIdLoose', () => {
    it('should parse numeric string to number', () => {
      expect(parseEntityIdLoose('123')).toBe(123);
    });

    it('should return number as-is', () => {
      expect(parseEntityIdLoose(456)).toBe(456);
    });

    it('should return non-numeric string as-is', () => {
      expect(parseEntityIdLoose('user-123')).toBe('user-123');
    });
  });

  describe('isValidEntityId', () => {
    it('should return true for valid numeric ID', () => {
      expect(isValidEntityId('123')).toBe(true);
      expect(isValidEntityId(123)).toBe(true);
    });

    it('should return false for invalid numeric ID', () => {
      expect(isValidEntityId('abc')).toBe(false);
      expect(isValidEntityId(0)).toBe(false);
      expect(isValidEntityId(-1)).toBe(false);
    });

    it('should return true for valid UUID', () => {
      expect(isValidEntityId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });
  });

  describe('relationEntityId', () => {
    it('returns number for numeric', () => {
      expect(relationEntityId(42)).toBe(42);
    });
    it('parses numeric string', () => {
      expect(relationEntityId('42')).toBe(42);
    });
    it('extracts id from object', () => {
      expect(relationEntityId({ id: 7 })).toBe(7);
      expect(relationEntityId({ id: '7' })).toBe(7);
    });
    it('returns null for nullish', () => {
      expect(relationEntityId(null)).toBeNull();
      expect(relationEntityId(undefined)).toBeNull();
    });
  });
});
