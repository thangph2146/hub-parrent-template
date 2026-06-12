import 'reflect-metadata';
import { Response } from 'express';
import { BaseController } from './base-controller.class';
import type { ApiResponse } from '../types';

class TestController extends BaseController {
  constructor() {
    super('TestController');
  }

  getLogger() {
    return this.logger;
  }

  callCreateSuccessResponse<T>(data: T, options?: { statusCode?: number }) {
    return this.createSuccessResponse(data, options);
  }

  callCreateErrorResponse(message: string, options?: { statusCode?: number; code?: string; details?: Record<string, unknown> }) {
    return this.createErrorResponse(message, options);
  }

  callSendSuccess(res: Response, data: unknown, statusCode?: number) {
    return this.sendSuccess(res, data, statusCode);
  }

  callSendError(res: Response, message: string, statusCode?: number, code?: string) {
    return this.sendError(res, message, statusCode, code);
  }

  callSendNotFound(res: Response, message?: string) {
    return this.sendNotFound(res, message);
  }

  callSendUnauthorized(res: Response, message?: string) {
    return this.sendUnauthorized(res, message);
  }

  callSendBadRequest(res: Response, message: string, details?: Record<string, unknown>) {
    return this.sendBadRequest(res, message, details);
  }

  callParseListStatus(input?: string, allowedValues?: Set<string>) {
    return this.parseListStatus(input, allowedValues);
  }

  callParsePagination(page?: string | number, limit?: string | number, defaultLimit?: number) {
    return this.parsePagination(page, limit, defaultLimit);
  }

  callParseFilters(query: Record<string, unknown>, filterPrefix?: string) {
    return this.parseFilters(query, filterPrefix);
  }
}

function createMockRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('BaseController', () => {
  let controller: TestController;
  let mockRes: Response;

  beforeEach(() => {
    controller = new TestController();
    mockRes = createMockRes();
  });

  describe('constructor', () => {
    it('creates logger with given name', () => {
      const logger = controller.getLogger();
      expect(logger).toBeDefined();
    });
  });

  describe('createSuccessResponse', () => {
    it('returns 200 with success:true and data', () => {
      const result = controller.callCreateSuccessResponse({ id: 1 });
      expect(result.statusCode).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toEqual({ id: 1 });
    });

    it('accepts custom statusCode', () => {
      const result = controller.callCreateSuccessResponse('ok', { statusCode: 201 });
      expect(result.statusCode).toBe(201);
    });
  });

  describe('createErrorResponse', () => {
    it('returns 500 with success:false and error message', () => {
      const result = controller.callCreateErrorResponse('Something went wrong');
      expect(result.statusCode).toBe(500);
      expect(result.body.success).toBe(false);
      expect(result.body.error?.message).toBe('Something went wrong');
      expect(result.body.error?.code).toBe('INTERNAL_ERROR');
    });

    it('accepts custom statusCode and code', () => {
      const result = controller.callCreateErrorResponse('Not found', {
        statusCode: 404,
        code: 'NOT_FOUND',
      });
      expect(result.statusCode).toBe(404);
      expect(result.body.error?.code).toBe('NOT_FOUND');
    });

    it('includes details when provided', () => {
      const result = controller.callCreateErrorResponse('Validation failed', {
        details: { field: 'email' },
      });
      expect(result.body.error?.details).toEqual({ field: 'email' });
    });
  });

  describe('sendSuccess', () => {
    it('sends json response with status 200', () => {
      controller.callSendSuccess(mockRes, { id: 1 });
      expect((mockRes.status as jest.Mock).mock.calls[0][0]).toBe(200);
      expect((mockRes.json as jest.Mock).mock.calls[0][0]).toEqual({
        success: true,
        data: { id: 1 },
      });
    });

    it('accepts custom status code', () => {
      controller.callSendSuccess(mockRes, {}, 201);
      expect((mockRes.status as jest.Mock).mock.calls[0][0]).toBe(201);
    });
  });

  describe('sendError', () => {
    it('sends error json response', () => {
      controller.callSendError(mockRes, 'error msg', 400, 'BAD_REQUEST');
      expect((mockRes.status as jest.Mock).mock.calls[0][0]).toBe(400);
      const body = (mockRes.json as jest.Mock).mock.calls[0][0] as ApiResponse;
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('BAD_REQUEST');
      expect(body.error?.message).toBe('error msg');
    });
  });

  describe('sendNotFound', () => {
    it('sends 404 with default message', () => {
      controller.callSendNotFound(mockRes);
      expect((mockRes.status as jest.Mock).mock.calls[0][0]).toBe(404);
      const body = (mockRes.json as jest.Mock).mock.calls[0][0] as ApiResponse;
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('NOT_FOUND');
      expect(body.error?.message).toBe('Resource not found');
    });

    it('accepts custom message', () => {
      controller.callSendNotFound(mockRes, 'User not found');
      expect((mockRes.json as jest.Mock).mock.calls[0][0]).toMatchObject({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      });
    });
  });

  describe('sendUnauthorized', () => {
    it('sends 401 with default message', () => {
      controller.callSendUnauthorized(mockRes);
      expect((mockRes.status as jest.Mock).mock.calls[0][0]).toBe(401);
      const body = (mockRes.json as jest.Mock).mock.calls[0][0] as ApiResponse;
      expect(body.error?.code).toBe('UNAUTHORIZED');
    });
  });

  describe('sendBadRequest', () => {
    it('sends 400 with custom message', () => {
      controller.callSendBadRequest(mockRes, 'Invalid input');
      expect((mockRes.status as jest.Mock).mock.calls[0][0]).toBe(400);
      const body = (mockRes.json as jest.Mock).mock.calls[0][0] as ApiResponse;
      expect(body.error?.code).toBe('BAD_REQUEST');
      expect(body.error?.message).toBe('Invalid input');
    });
  });

  describe('parseListStatus', () => {
    it('defaults to active when input is undefined', () => {
      expect(controller.callParseListStatus()).toBe('active');
    });

    it('returns valid status values', () => {
      expect(controller.callParseListStatus('active')).toBe('active');
      expect(controller.callParseListStatus('deleted')).toBe('deleted');
      expect(controller.callParseListStatus('all')).toBe('all');
    });

    it('defaults to active for invalid status', () => {
      expect(controller.callParseListStatus('unknown')).toBe('active');
    });

    it('respects custom allowedValues', () => {
      const custom = new Set(['published', 'draft']);
      expect(controller.callParseListStatus('published', custom)).toBe('published');
      expect(controller.callParseListStatus('active', custom)).toBe('active');
    });

    it('defaults to active when input not in custom allowedValues', () => {
      const custom = new Set(['published', 'draft']);
      expect(controller.callParseListStatus('deleted', custom)).toBe('active');
    });
  });

  describe('parsePagination', () => {
    it('returns defaults when nothing provided', () => {
      const result = controller.callParsePagination();
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('parses string inputs', () => {
      const result = controller.callParsePagination('3', '20');
      expect(result).toEqual({ page: 3, limit: 20 });
    });

    it('enforces minimum page of 1', () => {
      expect(controller.callParsePagination('0')).toEqual({ page: 1, limit: 10 });
      expect(controller.callParsePagination('-1')).toEqual({ page: 1, limit: 10 });
    });

    it('enforces minimum limit of 1', () => {
      expect(controller.callParsePagination(1, '-5')).toEqual({ page: 1, limit: 1 });
      expect(controller.callParsePagination(1, '-1')).toEqual({ page: 1, limit: 1 });
    });

    it('uses custom defaultLimit', () => {
      expect(controller.callParsePagination(undefined, undefined, 25)).toEqual({
        page: 1,
        limit: 25,
      });
    });

    it('falls back to default when inputs are NaN', () => {
      expect(controller.callParsePagination('abc', 'xyz')).toEqual({ page: 1, limit: 10 });
    });

    it('parses numeric inputs', () => {
      expect(controller.callParsePagination(2, 15)).toEqual({ page: 2, limit: 15 });
    });
  });

  describe('parseFilters', () => {
    it('extracts filter[column] values', () => {
      const query = {
        'filter[name]': 'John',
        'filter[status]': 'active',
        sort: 'name',
      };
      const result = controller.callParseFilters(query);
      expect(result).toEqual({ name: 'John', status: 'active' });
    });

    it('ignores non-filter keys', () => {
      const query = { page: '1', sort: 'name' };
      const result = controller.callParseFilters(query);
      expect(result).toEqual({});
    });

    it('handles array values by taking first element', () => {
      const query = { 'filter[name]': ['John', 'Jane'] };
      const result = controller.callParseFilters(query);
      expect(result).toEqual({ name: 'John' });
    });

    it('skips empty string values', () => {
      const query = { 'filter[name]': '', 'filter[status]': 'active' };
      const result = controller.callParseFilters(query);
      expect(result).toEqual({ status: 'active' });
    });

    it('handles nested bracket notation correctly', () => {
      const query = { 'filter[user][name]': 'John' };
      const result = controller.callParseFilters(query);
      expect(result).toEqual({ user: 'John' });
    });

    it('accepts custom filterPrefix with bracket', () => {
      const query = { 'f[name]': 'John', 'f[status]': 'active' };
      const result = controller.callParseFilters(query, 'f[');
      expect(result).toEqual({ name: 'John', status: 'active' });
    });
  });
});
