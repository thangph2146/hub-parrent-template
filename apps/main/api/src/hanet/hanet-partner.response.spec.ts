import { BadRequestException } from '@nestjs/common';
import {
  assertHanetPartnerOk,
  formatHanetCheckinDayDate,
  formatHanetCompactTimestamp,
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

  it('formatHanetCheckinDayDate giữ yyyy-mm-dd cho partner check-in', () => {
    expect(formatHanetCheckinDayDate('2026-06-15')).toBe('2026-06-15');
    expect(formatHanetCheckinDayDate('15/06/2026')).toBe('2026-06-15');
  });

  it('formatHanetCompactTimestamp chuẩn hóa DDMMYYYYHHmmss', () => {
    expect(formatHanetCompactTimestamp('15062026000000')).toBe('15062026000000');
    expect(formatHanetCompactTimestamp(new Date(2026, 5, 15, 0, 0, 0))).toBe(
      '15062026000000',
    );
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
