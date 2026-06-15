import { findEventRegistrationForHanet } from './hanet-registration-match';

describe('hanet-registration-match', () => {
  it('matches registration via formData.hanetPersonId', async () => {
    const em = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null),
      find: jest.fn().mockResolvedValue([
        {
          id: 7,
          email: 'a@hub.edu.vn',
          fullName: 'A',
          formData: { hanetPersonId: 'p-123' },
        },
      ]),
    };

    const reg = await findEventRegistrationForHanet(
      em as never,
      '1',
      { personID: 'p-123' },
      'unknown@hanet.local',
      'Unknown',
    );

    expect(reg?.id).toBe(7);
  });
});
