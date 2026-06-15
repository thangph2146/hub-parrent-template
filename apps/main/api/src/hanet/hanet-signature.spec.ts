import {
  computeHanetWebhookHash,
  verifyHanetWebhookHash,
} from './hanet-signature';

describe('hanet-signature', () => {
  it('computes MD5(client_secret + id)', () => {
    const hash = computeHanetWebhookHash('secret', 'record-1');
    expect(hash).toMatch(/^[a-f0-9]{32}$/);
    expect(verifyHanetWebhookHash('secret', 'record-1', hash)).toBe(true);
    expect(verifyHanetWebhookHash('secret', 'record-1', 'bad')).toBe(false);
  });
});
