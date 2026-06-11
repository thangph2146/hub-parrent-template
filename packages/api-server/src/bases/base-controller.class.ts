/**
 * Base Controller Abstract Class
 * Provides common functionality for controllers
 */
import { Logger } from '@nestjs/common';
import type { Response } from 'express';
import type { ApiResponse } from '../types';

/**
 * Abstract base controller with common HTTP response handling
 */
export abstract class BaseController {
  protected readonly logger: Logger;

  constructor(controllerName: string) {
    this.logger = new Logger(controllerName);
  }

  /**
   * Create success response
   */
  protected createSuccessResponse<T>(
    data: T,
    options?: { statusCode?: number },
  ): { statusCode: number; body: ApiResponse<T> } {
    return {
      statusCode: options?.statusCode ?? 200,
      body: {
        success: true,
        data,
      },
    };
  }

  /**
   * Create error response
   */
  protected createErrorResponse(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      details?: Record<string, unknown>;
    },
  ): { statusCode: number; body: ApiResponse } {
    return {
      statusCode: options?.statusCode ?? 500,
      body: {
        success: false,
        error: {
          code: options?.code ?? 'INTERNAL_ERROR',
          message,
          details: options?.details,
        },
      },
    };
  }

  /**
   * Send success response
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    statusCode = 200,
  ): Response {
    const { statusCode: code, body } = this.createSuccessResponse(data, {
      statusCode,
    });
    return res.status(code).json(body);
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    message: string,
    statusCode = 500,
    code?: string,
  ): Response {
    const { statusCode: responseStatusCode, body } = this.createErrorResponse(message, {
      statusCode,
      code,
    });
    return res.status(responseStatusCode).json(body);
  }

  /**
   * Send not found response
   */
  protected sendNotFound(res: Response, message = 'Resource not found'): Response {
    return this.sendError(res, message, 404, 'NOT_FOUND');
  }

  /**
   * Send unauthorized response
   */
  protected sendUnauthorized(
    res: Response,
    message = 'Unauthorized',
  ): Response {
    return this.sendError(res, message, 401, 'UNAUTHORIZED');
  }

  /**
   * Send bad request response
   */
  protected sendBadRequest(
    res: Response,
    message: string,
    _details?: Record<string, unknown>,
  ): Response {
    return this.sendError(res, message, 400, 'BAD_REQUEST');
  }

  /**
   * Parse list status from query parameter
   */
  protected parseListStatus(
    input?: string,
    allowedValues?: Set<string>,
  ): 'active' | 'deleted' | 'all' {
    const defaultAllowed = new Set(['active', 'deleted', 'all']);
    const allowed = allowedValues ?? defaultAllowed;

    if (input && allowed.has(input)) {
      return input as 'active' | 'deleted' | 'all';
    }
    return 'active';
  }

  /**
   * Parse pagination from query parameters
   */
  protected parsePagination(
    page?: string | number,
    limit?: string | number,
    defaultLimit = 10,
  ): { page: number; limit: number } {
    return {
      page: Math.max(1, parseInt(String(page ?? 1), 10) || 1),
      limit: Math.max(1, parseInt(String(limit ?? defaultLimit), 10) || defaultLimit),
    };
  }

  /**
   * Parse filters from query object
   */
  protected parseFilters(
    query: Record<string, unknown>,
    filterPrefix = 'filter[',
  ): Record<string, string> {
    const filters: Record<string, string> = {};

    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith(filterPrefix)) {
        const filterKey = key.slice(filterPrefix.length, key.indexOf(']', filterPrefix.length));
        const stringValue = Array.isArray(value)
          ? value[0]?.toString() ?? ''
          : value?.toString() ?? '';
        if (stringValue) {
          filters[filterKey] = stringValue;
        }
      }
    }

    return filters;
  }
}
