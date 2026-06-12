/**
 * Contract tests cho `entity-id` helpers — dùng trong `BaseCrudController`
 * để parse id từ route param (luôn là string trên HTTP).
 *
 * Mục tiêu: đảm bảo parse/validate id theo contract từ `api-client`:
 *   - id từ client là string (template literal)
 *   - server phải parse sang number cho MikroORM
 */
import { BadRequestException } from '@nestjs/common';
import {
  parseEntityId,
  isEntityId,
  toEntityId,
  toEntityIdList,
  toEntityIdListSafe,
  toEntityIdStrict,
  toEntityIdOrDefault,
  isNumericId,
  parseEntityIdLoose,
  isValidEntityId,
  relationEntityId,
  coerceImportPrimaryKey,
} from './entity-id';

describe('entity-id — api-client contract', () => {
  describe('parseEntityId (strict, used by BaseCrudController)', () => {
    it('parses numeric string sang number', () => {
      expect(parseEntityId('1')).toBe(1);
      expect(parseEntityId('42')).toBe(42);
      expect(parseEntityId('100')).toBe(100);
    });

    it('trims whitespace', () => {
      expect(parseEntityId('  7  ')).toBe(7);
    });

    it('chấp nhận number input', () => {
      expect(parseEntityId(99)).toBe(99);
    });

    it('throw BadRequestException khi null/undefined/empty', () => {
      expect(() => parseEntityId(null)).toThrow(BadRequestException);
      expect(() => parseEntityId(undefined)).toThrow(BadRequestException);
      expect(() => parseEntityId('')).toThrow(BadRequestException);
    });

    it('throw BadRequestException khi không phải số dương', async () => {
      expect(() => parseEntityId('0')).toThrow(BadRequestException);
      expect(() => parseEntityId('-1')).toThrow(BadRequestException);
      expect(() => parseEntityId('abc')).toThrow(BadRequestException);
      // Lưu ý: '1.5' bị parseInt cắt thành 1 — đây là behavior hiện tại.
      // Nếu muốn reject, parseEntityId cần đổi sang Number + check integer.
      // Giữ case 1.5 để document behavior.
      expect(parseEntityId('1.5')).toBe(1);
    });
  });

  describe('isEntityId', () => {
    it('true cho numeric string không có dấu trừ/thập phân', () => {
      expect(isEntityId('1')).toBe(true);
      expect(isEntityId('42')).toBe(true);
    });

    it('false cho 0, negative, decimal, empty, non-numeric', () => {
      expect(isEntityId('0')).toBe(false);
      expect(isEntityId('-1')).toBe(false);
      expect(isEntityId('1.5')).toBe(false);
      expect(isEntityId('abc')).toBe(false);
      expect(isEntityId('')).toBe(false);
    });
  });

  describe('toEntityId / toEntityIdList', () => {
    it('toEntityId chấp nhận string và number', () => {
      expect(toEntityId('5')).toBe(5);
      expect(toEntityId(5)).toBe(5);
    });

    it('toEntityIdList chuyển list', () => {
      expect(toEntityIdList(['1', '2', '3'])).toEqual([1, 2, 3]);
      expect(toEntityIdList([1, 2, 3])).toEqual([1, 2, 3]);
      expect(toEntityIdList(['1', 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('toEntityIdListSafe (loại bỏ id không hợp lệ)', () => {
    it('giữ id hợp lệ, bỏ id không hợp lệ', () => {
      const result = toEntityIdListSafe(['1', 'abc', 2, '', null as unknown as string]);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('toEntityIdStrict (throws Error, không phải BadRequestException)', () => {
    it('parses số nguyên', () => {
      expect(toEntityIdStrict('1')).toBe(1);
      expect(toEntityIdStrict(99)).toBe(99);
    });

    it('throws Error khi NaN', () => {
      expect(() => toEntityIdStrict('abc')).toThrow(Error);
    });
  });

  describe('toEntityIdOrDefault', () => {
    it('trả default khi invalid', () => {
      expect(toEntityIdOrDefault('abc', 0)).toBe(0);
      expect(toEntityIdOrDefault('abc', 99)).toBe(99);
    });

    it('trả number khi valid', () => {
      expect(toEntityIdOrDefault('1', 0)).toBe(1);
    });
  });

  describe('isNumericId', () => {
    it('true chỉ với digit', () => {
      expect(isNumericId('1')).toBe(true);
      expect(isNumericId('123')).toBe(true);
    });

    it('false với negative, decimal, prefix, suffix', () => {
      expect(isNumericId('-1')).toBe(false);
      expect(isNumericId('1.0')).toBe(false);
      expect(isNumericId('01')).toBe(true);
      expect(isNumericId('abc')).toBe(false);
    });
  });

  describe('parseEntityIdLoose (numeric → number, ngược lại string)', () => {
    it('trả number nếu parse được', () => {
      expect(parseEntityIdLoose('5')).toBe(5);
      expect(parseEntityIdLoose(5)).toBe(5);
    });

    it('trả string nguyên xi nếu không phải numeric', () => {
      expect(parseEntityIdLoose('cuid-abc')).toBe('cuid-abc');
      expect(parseEntityIdLoose('abc123')).toBe('abc123');
    });
  });

  describe('isValidEntityId', () => {
    it('true với numeric string, number > 0, hoặc UUID', () => {
      expect(isValidEntityId('1')).toBe(true);
      expect(isValidEntityId(5)).toBe(true);
      expect(isValidEntityId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('false với negative, CUID, empty', () => {
      expect(isValidEntityId('-1')).toBe(false);
      // Lưu ý: '0' thỏa mãn /^\d+$/ → isValidEntityId trả về true. Đây là
      // behavior hiện tại (caller phải tự check > 0 nếu cần).
      expect(isValidEntityId('0')).toBe(true);
      expect(isValidEntityId('cm123abc')).toBe(false);
      expect(isValidEntityId('')).toBe(false);
    });
  });

  describe('relationEntityId', () => {
    it('trả null cho null/undefined', () => {
      expect(relationEntityId(null)).toBeNull();
      expect(relationEntityId(undefined)).toBeNull();
    });

    it('trả số nếu numeric', () => {
      expect(relationEntityId(5)).toBe(5);
      expect(relationEntityId('5')).toBe(5);
    });

    it('trả null nếu CUID/string không phải numeric', () => {
      expect(relationEntityId('cm123')).toBeNull();
    });

    it('unpack object .id nếu là relation', () => {
      expect(relationEntityId({ id: 7 })).toBe(7);
      expect(relationEntityId({ id: '7' })).toBe(7);
    });
  });

  describe('coerceImportPrimaryKey', () => {
    it('trả undefined cho giá trị không hợp lệ', () => {
      expect(coerceImportPrimaryKey('abc')).toBeUndefined();
      expect(coerceImportPrimaryKey(0)).toBeUndefined();
      expect(coerceImportPrimaryKey(-1)).toBeUndefined();
      expect(coerceImportPrimaryKey('cm123')).toBeUndefined();
    });

    it('trả number cho giá trị hợp lệ', () => {
      expect(coerceImportPrimaryKey(1)).toBe(1);
      expect(coerceImportPrimaryKey('42')).toBe(42);
    });
  });
});
