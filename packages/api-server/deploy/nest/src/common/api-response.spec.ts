/**
 * Contract tests cho envelope helpers `createSuccessResponse`/`createErrorResponse`/`ok`/`fail`.
 *
 * Mục tiêu: đảm bảo envelope shape khớp với `api-client.unwrapApiEnvelope`:
 *   - `{ success, message, error, data }` cho cả success và error
 *   - `error === null` khi success
 *   - `success === true` khi success, `false` khi error
 */
import {
  createSuccessResponse,
  createErrorResponse,
  ok,
  fail,
  type ApiResponsePayload,
} from './api-response';

describe('api-response — envelope contract', () => {
  describe('createSuccessResponse', () => {
    it('returns { statusCode, body: { success: true, message, error: null, data } }', () => {
      const result = createSuccessResponse({ id: 1, name: 'A' });
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        success: true,
        message: 'Thao tác thành công',
        error: null,
        data: { id: 1, name: 'A' },
      });
    });

    it('cho phép override message', () => {
      const result = createSuccessResponse({ id: 1 }, { message: 'Tạo thành công' });
      expect(result.body.message).toBe('Tạo thành công');
    });

    it('cho phép override status', () => {
      const result = createSuccessResponse({ id: 1 }, { status: 201 });
      expect(result.statusCode).toBe(201);
    });

    it('error luôn là null khi success (client check `envelope.success === false`)', () => {
      const result = createSuccessResponse('payload');
      expect(result.body.error).toBeNull();
    });

    it('chấp nhận data là null/undefined/0/empty array', () => {
      expect(createSuccessResponse(null).body.data).toBeNull();
      expect(createSuccessResponse(undefined).body.data).toBeUndefined();
      expect(createSuccessResponse(0).body.data).toBe(0);
      expect(createSuccessResponse([]).body.data).toEqual([]);
    });
  });

  describe('createErrorResponse', () => {
    it('returns { statusCode, body: { success: false, message, error, data? } }', () => {
      const result = createErrorResponse('Không tìm thấy', { status: 404 });
      expect(result.statusCode).toBe(404);
      expect(result.body.success).toBe(false);
      expect(result.body.message).toBe('Không tìm thấy');
      expect(result.body.error).toBe('Không tìm thấy');
    });

    it('default status là 400 khi không truyền', () => {
      const result = createErrorResponse('Bad');
      expect(result.statusCode).toBe(400);
    });

    it('default message khi undefined', () => {
      const result = createErrorResponse();
      expect(result.body.message).toBe('Đã xảy ra lỗi');
      expect(result.body.error).toBe('Đã xảy ra lỗi');
    });

    it('cho phép override error riêng biệt với message', () => {
      const result = createErrorResponse('Hiển thị cho user', {
        error: 'INTERNAL_CODE',
        status: 500,
      });
      expect(result.body.message).toBe('Hiển thị cho user');
      expect(result.body.error).toBe('INTERNAL_CODE');
    });

    it('có thể kèm data (vd thông tin validation)', () => {
      const result = createErrorResponse('Invalid', {
        data: { fields: ['email', 'password'] },
      });
      expect(result.body.data).toEqual({ fields: ['email', 'password'] });
    });
  });

  describe('ok helper', () => {
    it('returns ApiResponsePayload với success: true và error: null', () => {
      const result = ok({ id: 1 });
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ id: 1 });
    });

    it('default message tiếng Việt', () => {
      expect(ok({}).message).toBe('Thao tác thành công');
    });

    it('cho phép override message', () => {
      expect(ok({}, 'Custom').message).toBe('Custom');
    });
  });

  describe('fail helper', () => {
    it('returns ApiResponsePayload với success: false', () => {
      const result = fail('Boom');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Boom');
      expect(result.message).toBe('Boom');
    });

    it('optional data cho debug', () => {
      const result = fail('Boom', { code: 500 });
      expect(result.data).toEqual({ code: 500 });
    });
  });

  describe('shape compatibility với api-client.unwrapApiEnvelope', () => {
    it('success body có đủ 4 field mà client đọc', () => {
      const body: ApiResponsePayload<unknown> = createSuccessResponse('x').body;
      const keys = Object.keys(body).sort();
      expect(keys).toEqual(['data', 'error', 'message', 'success'].sort());
    });

    it('error body có đủ 4 field mà client đọc', () => {
      const body: ApiResponsePayload = createErrorResponse('x').body;
      const keys = Object.keys(body).sort();
      expect(keys).toEqual(['data', 'error', 'message', 'success'].sort());
    });

    it('success body có success === true (client check trước khi unwrap)', () => {
      const body = createSuccessResponse('x').body;
      expect(body.success).toBe(true);
    });

    it('error body có success === false (client throw ApiError khi gặp)', () => {
      const body = createErrorResponse('x').body;
      expect(body.success).toBe(false);
    });
  });
});
