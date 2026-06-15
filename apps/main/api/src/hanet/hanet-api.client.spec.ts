import { HanetApiClient } from './hanet-api.client';

describe('HanetApiClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    delete process.env.HANET_ACCESS_TOKEN;
    delete process.env.HANET_REFRESH_TOKEN;
    delete process.env.HANET_CLIENT_ID;
    delete process.env.HANET_CLIENT_SECRET;
  });

  it('postPartner refreshes token when HTTP 401 + returnCode 401', async () => {
    process.env.HANET_ACCESS_TOKEN = 'expired-token';
    process.env.HANET_REFRESH_TOKEN = 'refresh-token';
    process.env.HANET_CLIENT_ID = 'client-id';
    process.env.HANET_CLIENT_SECRET = 'client-secret';
    process.env.HANET_OAUTH_URL = 'https://oauth.hanet.com/token';

    const places = [{ id: 903038, name: 'HUB Thủ Đức' }];

    let getPlacesCalls = 0;

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const body = typeof init?.body === 'string' ? init.body : '';
      if (url.includes('oauth.hanet.com/token')) {
        return new Response(
          JSON.stringify({ access_token: 'fresh-token' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes('/place/getPlaces')) {
        getPlacesCalls += 1;
        if (getPlacesCalls === 1) {
          return new Response(
            JSON.stringify({
              returnCode: 401,
              returnMessage: 'Token is expired',
              data: null,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return new Response(
          JSON.stringify({
            returnCode: 1,
            returnMessage: 'Success',
            data: places,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;

    const client = new HanetApiClient();
    const data = await client.postPartner<typeof places>('/place/getPlaces', {});

    expect(data).toEqual(places);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
