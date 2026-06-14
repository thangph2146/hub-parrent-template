import { BadRequestException } from '@nestjs/common';
import {
  parseEntityId,
  isEntityId,
  toEntityId,
  toEntityIdList,
  toEntityIdListSafe,
  relationEntityId,
  coerceImportPrimaryKey,
} from './entity-id';

describe('entity-id', () => {
  it('parseEntityId parses numeric string', () => {
    expect(parseEntityId('42')).toBe(42);
  });

  it('parseEntityId rejects invalid id', () => {
    expect(() => parseEntityId('abc')).toThrow(BadRequestException);
  });

  it('toEntityIdList maps values', () => {
    expect(toEntityIdList(['1', 2])).toEqual([1, 2]);
  });

  it('toEntityIdListSafe skips invalid', () => {
    expect(toEntityIdListSafe(['1', 'uuid-x', 2])).toEqual([1, 2]);
  });

  it('relationEntityId reads nested id', () => {
    expect(relationEntityId({ id: '3' })).toBe(3);
  });

  it('coerceImportPrimaryKey accepts positive int only', () => {
    expect(coerceImportPrimaryKey(5)).toBe(5);
    expect(coerceImportPrimaryKey('7')).toBe(7);
    expect(coerceImportPrimaryKey('uuid')).toBeUndefined();
  });

  it('isEntityId validates canonical numeric string', () => {
    expect(isEntityId('10')).toBe(true);
    expect(isEntityId('010')).toBe(false);
  });
});
