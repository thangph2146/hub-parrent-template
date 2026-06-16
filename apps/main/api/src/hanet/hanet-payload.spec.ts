import {
  normalizeHanetBody,
  parseHanetCompactTime,
  pickHanetAttendanceKind,
  pickHanetDeviceId,
  pickHanetTimestamp,
} from './hanet-payload';

describe('hanet-payload', () => {
  const sample = {
    person_id: '2933962531988832256',
    person_name: 'T.A',
    person_type: 0,
    mask: 0,
    date_time: 1743675971,
    time: '03042025172611',
    msg_id: 'F2231FV0420-1743675971',
    camera_id: 'F2231FV0420',
  };

  it('parses compact time DDMMYYYYHHmmss', () => {
    const d = parseHanetCompactTime('03042025172611');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2025);
    expect(d!.getMonth()).toBe(3);
    expect(d!.getDate()).toBe(3);
    expect(d!.getHours()).toBe(17);
    expect(d!.getMinutes()).toBe(26);
    expect(d!.getSeconds()).toBe(11);
  });

  it('reads camera_id and date_time from HANET sample', () => {
    expect(pickHanetDeviceId(sample)).toBe('F2231FV0420');
    const at = pickHanetTimestamp(sample);
    expect(at.getTime()).toBe(new Date(1743675971 * 1000).getTime());
  });

  it('maps person_type 0/1 to checkin/checkout', () => {
    expect(pickHanetAttendanceKind({ person_type: 0 })).toBe('checkin');
    expect(pickHanetAttendanceKind({ person_type: 1 })).toBe('checkout');
  });

  it('does not treat personType on Face Data sync as attendance', () => {
    expect(
      pickHanetAttendanceKind({
        data_type: 'person',
        action_type: 'add',
        personType: 0,
      }),
    ).toBeNull();
  });

  it('unwraps JSON string in message field', () => {
    const wrapped = normalizeHanetBody({
      message: JSON.stringify(sample),
    });
    expect(pickHanetDeviceId(wrapped)).toBe('F2231FV0420');
    expect(wrapped.person_name).toBe('T.A');
  });

  it('parses webhook sync time as epoch milliseconds', () => {
    const at = pickHanetTimestamp({
      data_type: 'device',
      action_type: 'update',
      time: 1607660080000,
    });
    expect(at.getTime()).toBe(1607660080000);
  });
});
