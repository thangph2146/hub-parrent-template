import { BadRequestException } from '@nestjs/common';
import {
  assertHanetPartnerOk,
  formatHanetPartnerDayDate,
  isHanetTokenExpiredEnvelope,
} from './hanet-partner.response';

describe('hanet-partner.response', () => {
  it('assertHanetPartnerOk passes on returnCode 1', () => {
    expect(assertHanetPartnerOk({ returnCode: 1, data: { id: 1 } }, '/x')).toEqual({
      id: 1,
    });
  });

  it('assertHanetPartnerOk throws on error code', () => {
    expect(() =>
      assertHanetPartnerOk(
        { returnCode: -5003, returnMessage: 'PERSON_GET_ERROR' },
        '/person/get',
      ),
    ).toThrow(BadRequestException);
  });

  it('formatHanetPartnerDayDate from yyyy-mm-dd', () => {
    expect(formatHanetPartnerDayDate('2026-06-15')).toBe('15/06/2026');
  });

  it('isHanetTokenExpiredEnvelope detects -103, 401 and message', () => {
    expect(isHanetTokenExpiredEnvelope({ returnCode: -103 })).toBe(true);
    expect(
      isHanetTokenExpiredEnvelope({
        returnCode: 401,
        returnMessage: 'Token is expired',
      }),
    ).toBe(true);
    expect(isHanetTokenExpiredEnvelope({ returnCode: 1 })).toBe(false);
  });
});
