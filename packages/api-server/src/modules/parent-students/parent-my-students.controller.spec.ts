import 'reflect-metadata';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  RequestMethod,
  UnauthorizedException,
} from '@nestjs/common';
import {
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { BaseParentMyStudentsController } from './parent-student.controller';

type ReqHandler = (req: unknown, res?: unknown, next?: unknown) => unknown;
type RouteInfo = { method: string; path: string; handler: string };

class TestController extends BaseParentMyStudentsController {}

describe('BaseParentMyStudentsController', () => {
  let controller: TestController;
  let service: {
    listByParent: jest.Mock;
    addStudentRequest: jest.Mock;
    removeForParent: jest.Mock;
  };

  function getRoutes(ctrl: object): RouteInfo[] {
    const out: RouteInfo[] = [];
    const VERB_MAP: Record<number, string> = {
      0: 'GET',
      1: 'POST',
      2: 'PUT',
      3: 'DELETE',
      4: 'PATCH',
      5: 'HEAD',
      6: 'SEARCH',
      7: 'ALL',
      9: 'OPTIONS',
    };
    let proto: object | null = Object.getPrototypeOf(ctrl);
    while (proto && proto !== Object.prototype) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (name === 'constructor') continue;
        const desc = Object.getOwnPropertyDescriptor(proto, name);
        const handler = desc?.value as ReqHandler | undefined;
        if (typeof handler !== 'function') continue;
        const verb = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
        if (typeof verb !== 'number') continue;
        const pathMeta = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
        if (pathMeta == null) continue;
        out.push({
          method: VERB_MAP[verb],
          path: `/${String(pathMeta).replace(/^\//, '')}`,
          handler: name,
        });
      }
      proto = Object.getPrototypeOf(proto);
    }
    return out;
  }

  beforeEach(() => {
    service = {
      listByParent: jest.fn(async () => [
        {
          id: 1,
          parentId: 7,
          studentCode: 'SV001',
          studentName: 'Student',
          note: null,
          status: 'approved',
          reviewedBy: 'admin',
          reviewedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
      addStudentRequest: jest.fn(async (input) => ({
        id: 2,
        parentId: input.parentId,
        studentCode: input.studentCode,
        studentName: input.studentName ?? null,
        note: input.note ?? null,
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      removeForParent: jest.fn(async () => true),
    };
    controller = new TestController(service as never);
    delete process.env.EXTERNAL_API_URL;
    delete process.env.EXTERNAL_API_TOKEN;
    jest.restoreAllMocks();
  });

  describe('route metadata', () => {
    it('exposes GET /parent/my-students', () => {
      const route = getRoutes(controller).find((item) => item.handler === 'list');
      expect(route).toEqual({
        method: 'GET',
        path: '/parent/my-students',
        handler: 'list',
      });
    });

    it('exposes POST /parent/my-students', () => {
      const route = getRoutes(controller).find((item) => item.handler === 'add');
      expect(route?.method).toBe('POST');
      expect(route?.path).toBe('/parent/my-students');
    });

    it('exposes 4 grade routes', () => {
      const routes = getRoutes(controller);
      expect(routes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            method: 'GET',
            path: '/parent/my-students/scores/detailed/:studentCode',
          }),
          expect.objectContaining({
            method: 'GET',
            path: '/parent/my-students/averages/year/:studentCode',
          }),
          expect.objectContaining({
            method: 'GET',
            path: '/parent/my-students/averages/terms/:studentCode',
          }),
          expect.objectContaining({
            method: 'GET',
            path: '/parent/my-students/averages/overall/:studentCode',
          }),
        ]),
      );
    });
  });

  describe('public flow', () => {
    it('list returns rows for current parent', async () => {
      const result = await controller.list({ 'x-user-id': '7' });
      expect(service.listByParent).toHaveBeenCalledWith('7');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('add creates pending request', async () => {
      const result = await controller.add(
        { 'x-user-id': '7' },
        { studentCode: 'SV001', studentName: 'Student', note: 'test' },
      );
      expect(service.addStudentRequest).toHaveBeenCalledWith({
        parentId: 7,
        studentCode: 'SV001',
        studentName: 'Student',
        note: 'test',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({ status: 'pending' }));
    });

    it('remove returns id payload', async () => {
      const result = await controller.remove('2', { 'x-user-id': '7' });
      expect(service.removeForParent).toHaveBeenCalledWith('2', '7');
      expect(result.data).toEqual({ id: '2' });
    });

    it('grade endpoints return fallback when EXTERNAL_API_URL is missing', async () => {
      const result = await controller.getDetailedScores('SV001', { 'x-user-id': '7' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('grade endpoints proxy external API when configured', async () => {
      process.env.EXTERNAL_API_URL = 'https://example.test';
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ score: 10 }],
        } as Response);

      const result = await controller.getYearAverages('SV001', { 'x-user-id': '7' });

      expect(fetchSpy).toHaveBeenCalled();
      expect(result.data).toEqual([{ score: 10 }]);
    });
  });

  describe('error handling', () => {
    it('throws UnauthorizedException when header missing', async () => {
      await expect(controller.list({})).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException when studentCode empty', async () => {
      await expect(
        controller.add({ 'x-user-id': '7' }, { studentCode: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when remove unauthorized or missing', async () => {
      service.removeForParent.mockResolvedValueOnce(false);
      await expect(
        controller.remove('9', { 'x-user-id': '7' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when student not approved', async () => {
      service.listByParent.mockResolvedValueOnce([
        {
          id: 1,
          parentId: 7,
          studentCode: 'SV001',
          studentName: 'Student',
          note: null,
          status: 'pending',
          reviewedBy: null,
          reviewedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      await expect(
        controller.getOverallAverage('SV001', { 'x-user-id': '7' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
