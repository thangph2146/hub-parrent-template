import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public, createErrorResponse, createSuccessResponse } from '../../common';
import { APP_HEADERS, PUBLIC_ROUTES } from '../../config';
import type {
  BasePublicService,
  MyRegisteredEventItem,
  PublicPagedPayload,
  RegisterForEventResult,
  SeoMetaPublicDto,
} from './public.service';

export interface IPublicControllerService
  extends Pick<
    BasePublicService,
    | 'getCategories'
    | 'getEventCategories'
    | 'getPageContents'
    | 'getPageContentBySection'
    | 'getPosts'
    | 'getPostBySlug'
    | 'incrementPostViewBySlug'
    | 'listEvents'
    | 'getEventBySlug'
    | 'registerForEvent'
    | 'listMyEvents'
    | 'cancelMyRegistration'
    | 'getSeoMetaByPage'
  > {}

@Public()
@Controller(PUBLIC_ROUTES.BASE)
export class BasePublicController {
  constructor(private readonly service: IPublicControllerService) {}

  @Get('categories')
  async getCategories(
    @Query('slug') slug: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const categories = await this.service.getCategories(slug);
      const { statusCode, body } = createSuccessResponse(categories);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('event-categories')
  async getEventCategories(
    @Query('slug') slug: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const categories = await this.service.getEventCategories(slug);
      const { statusCode, body } = createSuccessResponse(categories);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('page-contents/:pageKey')
  async getPageContents(
    @Param('pageKey') pageKey: string,
    @Query('sectionKey') sectionKey: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      if (sectionKey?.trim()) {
        const content = await this.service.getPageContentBySection(
          pageKey,
          sectionKey,
        );
        if (!content) {
          const { statusCode, body } = createErrorResponse(
            'Page section content not found',
            { status: 404 },
          );
          return res.status(statusCode).json(body);
        }
        const { statusCode, body } = createSuccessResponse(content);
        return res.status(statusCode).json(body);
      }

      const contents = await this.service.getPageContents(pageKey);
      if (!contents.length) {
        const { statusCode, body } = createErrorResponse('Page content not found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(contents);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('posts')
  async getPosts(
    @Query() query: Record<string, string | undefined>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = (await this.service.getPosts(query)) as PublicPagedPayload<unknown>;
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('posts/:slug')
  async getPostBySlug(
    @Param('slug') slug: string,
    @Query('track') track: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const shouldTrack = track !== 'false';
      const post = await this.service.getPostBySlug(slug, { trackView: shouldTrack });
      if (!post) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(post);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Post('posts/:slug/view')
  async incrementPostView(
    @Param('slug') slug: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = await this.service.incrementPostViewBySlug(slug);
      if (!result) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('events')
  async getEvents(
    @Query() query: Record<string, string | undefined>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const result = (await this.service.listEvents(query)) as PublicPagedPayload<unknown>;
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('events/:slug')
  async getEventBySlug(
    @Param('slug') slug: string,
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<Response> {
    void headers;
    try {
      const event = await this.service.getEventBySlug(slug);
      if (!event) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(event);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Post('events/:slug/register')
  async registerForEvent(
    @Param('slug') slug: string,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { phone?: string },
    @Res() res: Response,
  ): Promise<Response> {
    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Vui lòng đăng nhập trước khi đăng ký sự kiện.',
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }
    try {
      const result = (await this.service.registerForEvent(
        slug,
        userId,
        body?.phone,
      )) as RegisterForEventResult;
      const { statusCode, body: okBody } = createSuccessResponse(result, {
        status: 201,
        message: 'Đăng ký sự kiện thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đăng ký sự kiện.';
      const status = message.includes('đã đăng ký') ? 409 : 400;
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  @Get('me/events')
  async listMyEvents(
    @Headers() headers: Record<string, string | undefined>,
    @Res() res: Response,
  ): Promise<Response> {
    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        'Vui lòng đăng nhập trước khi xem sự kiện đã đăng ký.',
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }
    try {
      const result = (await this.service.listMyEvents(userId)) as MyRegisteredEventItem[];
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tải danh sách sự kiện đã đăng ký.';
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Post('me/event-registrations/:id/cancel')
  async cancelMyEventRegistration(
    @Param('id') id: string,
    @Headers() headers: Record<string, string | undefined>,
    @Res() res: Response,
  ): Promise<Response> {
    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        'Vui lòng đăng nhập trước khi hủy đăng ký.',
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }
    try {
      const result = (await this.service.cancelMyRegistration(userId, id)) as MyRegisteredEventItem;
      const { statusCode, body } = createSuccessResponse(result, {
        message: 'Đã hủy đăng ký sự kiện.',
      });
      return res.status(statusCode).json(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể hủy đăng ký.';
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('seo-meta')
  async getSeoMetaByPage(
    @Query('page') page: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    const normalized = page?.trim();
    if (!normalized) {
      const { statusCode, body } = createErrorResponse('Thiếu query page', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
    try {
      const row = (await this.service.getSeoMetaByPage(normalized)) as SeoMetaPublicDto | null;
      if (!row) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(row);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }
}

