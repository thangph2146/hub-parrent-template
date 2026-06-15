import { BadRequestException } from '@nestjs/common';
import {
  assertHanetFetchableImageUrl,
  resolveHanetPublicImageUrl,
} from './hanet-face-image';

describe('hanet-face-image', () => {
  const prevPublic = process.env.API_PUBLIC_URL;

  afterEach(() => {
    if (prevPublic === undefined) delete process.env.API_PUBLIC_URL;
    else process.env.API_PUBLIC_URL = prevPublic;
  });

  it('resolveHanetPublicImageUrl builds absolute uploads URL', () => {
    process.env.API_PUBLIC_URL = 'https://checkin.example.com/api';
    expect(
      resolveHanetPublicImageUrl('/api/uploads/images/avatars/u1_face.jpg'),
    ).toBe('https://checkin.example.com/api/uploads/images/avatars/u1_face.jpg');
  });

  it('rejects webp for HANET', () => {
    expect(() =>
      assertHanetFetchableImageUrl('https://cdn.example.com/a.webp'),
    ).toThrow(BadRequestException);
  });

  it('rejects localhost', () => {
    expect(() =>
      assertHanetFetchableImageUrl(
        'http://localhost:3002/api/uploads/images/avatars/a.jpg',
      ),
    ).toThrow(BadRequestException);
  });

  it('accepts https jpg', () => {
    expect(() =>
      assertHanetFetchableImageUrl('https://cdn.example.com/face.jpg'),
    ).not.toThrow();
  });
});
