import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  Param,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { PublicPostsService } from './public-posts.service';
import { PublicCategoriesService } from './public-categories.service';
import { PublicContactRequestsService } from './public-contact-requests.service';
import {
  PublicAuthService,
  type CreatePublicRegisterDto,
} from './public-auth.service';
import { PageContentsService } from '../page-contents/page-contents.service';
import type { CreateContactRequestDto } from './public-contact-requests.service';
import { AuthService } from '../auth/auth.service';
import type { AuthUserPayload } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { createSuccessResponse, createErrorResponse } from '../common';
import { PUBLIC_ROUTES } from '../config/constants';
import { Public } from '../common';
import { AUTH_ROLE_NAMES } from '../config/constants';
import { SeoMetasService } from '../seo-metas/seo-metas.service';
import { SettingsService } from '../settings/settings.service';

function setCacheControl(res: Response, ttl = 60): void {
  res.setHeader(
    'Cache-Control',
    `public, max-age=${ttl}, s-maxage=${ttl * 2}, stale-while-revalidate=${Math.floor(ttl / 2)}`,
  );
}

function setNoStoreCacheControl(res: Response): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
}

function parseQuery(query: Record<string, string | undefined>) {
  const page = Math.max(1, parseInt(String(query.page), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(query.limit), 10) || 10),
  );
  return {
    page,
    limit,
    categorySlug: query.categorySlug,
    tagSlug: query.tagSlug,
    search: query.search,
  };
}

/** Hub Parent — storefront + B2B login, không có events/admission. */
@Public()
@Controller(PUBLIC_ROUTES.BASE)
export class PublicController {
  private readonly logger = new Logger(PublicController.name);

  constructor(
    private readonly publicPostsService: PublicPostsService,
    private readonly publicCategoriesService: PublicCategoriesService,
    private readonly publicContactRequestsService: PublicContactRequestsService,
    private readonly publicAuthService: PublicAuthService,
    private readonly pageContentsService: PageContentsService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly seoMetasService: SeoMetasService,
    private readonly settingsService: SettingsService,
  ) {}

  private logApiError(api: string, error: unknown, metadata?: unknown): void {
    const details =
      error instanceof Error
        ? {
            api,
            name: error.name,
            message: error.message,
            stack: error.stack ?? null,
            metadata: metadata ?? null,
          }
        : {
            api,
            message: String(error),
            stack: null,
            metadata: metadata ?? null,
          };
    this.logger.error(JSON.stringify(details));
  }

  private isGuestPayload(
    user: AuthUserPayload | null,
  ): user is AuthUserPayload {
    if (!user?.roles?.length) return false;
    const names = user.roles.map((role) => role.name);
    if (
      names.some(
        (name) =>
          name === AUTH_ROLE_NAMES.ADMIN ||
          name === AUTH_ROLE_NAMES.SUPER_ADMIN,
      )
    ) {
      return false;
    }
    if (names.includes(AUTH_ROLE_NAMES.STUDENT)) return false;
    return names.some(
      (name) =>
        name === AUTH_ROLE_NAMES.PARENT || name === AUTH_ROLE_NAMES.USER,
    );
  }

  @Get('dev-login-options')
  async getDevelopmentLoginOptions(
    @Query('role') role: string | undefined,
    @Query('roles') roles: string | undefined,
    @Query('excludeRoles') excludeRoles: string | undefined,
    @Query('emailSuffix') emailSuffix: string | undefined,
    @Query('activeOnly') activeOnly: string | undefined,
    @Res() res: Response,
  ) {
    return this.respondDevelopmentLoginOptions(
      res,
      { role, roles, excludeRoles, emailSuffix, activeOnly },
      'GET /api/public/dev-login-options',
    );
  }

  @Get('auth/dev-login-options')
  async getAuthDevelopmentLoginOptions(
    @Query('role') role: string | undefined,
    @Query('roles') roles: string | undefined,
    @Query('excludeRoles') excludeRoles: string | undefined,
    @Query('emailSuffix') emailSuffix: string | undefined,
    @Query('activeOnly') activeOnly: string | undefined,
    @Res() res: Response,
  ) {
    return this.respondDevelopmentLoginOptions(
      res,
      { role, roles, excludeRoles, emailSuffix, activeOnly },
      'GET /api/public/auth/dev-login-options',
    );
  }

  private async respondDevelopmentLoginOptions(
    res: Response,
    query: {
      role?: string;
      roles?: string;
      excludeRoles?: string;
      emailSuffix?: string;
      activeOnly?: string;
    },
    logLabel: string,
  ) {
    this.logger.log(
      `${logLabel} role=${query.role ?? '-'} roles=${query.roles ?? '-'} emailSuffix=${query.emailSuffix ?? '-'}`,
    );
    if (process.env.NODE_ENV === 'production') {
      const { statusCode, body } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }

    try {
      const options = await this.usersService.listDevelopmentLoginOptions({
        role: query.role,
        roles: query.roles,
        excludeRoles: query.excludeRoles,
        emailSuffix: query.emailSuffix,
        activeOnly: query.activeOnly !== 'false',
      });
      const { statusCode, body } = createSuccessResponse(options);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError(logLabel, error);
      const { statusCode, body } = createErrorResponse(
        'Không thể tải danh sách tài khoản development.',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get('categories')
  async getCategories(
    @Query('slug') slug: string | undefined,
    @Res() res: Response,
  ) {
    setCacheControl(res, 120);
    this.logger.log(`getCategories slug=${slug ?? 'all'}`);
    try {
      const categories = await this.publicCategoriesService.getCategories(slug);
      const { statusCode, body } = createSuccessResponse(categories);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/categories', error, { slug });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get('page-contents/:pageKey')
  async getPageContent(
    @Param('pageKey') pageKey: string,
    @Query('sectionKey') sectionKey: string,
    @Res() res: Response,
  ) {
    setCacheControl(res, 120);
    this.logger.log(`getPageContent: ${pageKey}, section: ${sectionKey}`);
    try {
      if (sectionKey) {
        const content = await this.pageContentsService.getByPageAndSection(
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

      const contents = await this.pageContentsService.getByKey(pageKey);
      if (!contents || contents.length === 0) {
        const { statusCode, body } = createErrorResponse(
          'Page content not found',
          { status: 404 },
        );
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(contents);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/page-contents/:pageKey', error, {
        pageKey,
        sectionKey: sectionKey || null,
      });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Post('contact-requests')
  async createContactRequest(
    @Body() body: CreateContactRequestDto,
    @Res() res: Response,
  ) {
    this.logger.log('createContactRequest');
    const name = body?.name?.trim() || body?.fullName?.trim();
    const email = body?.email?.trim();
    const subject = body?.subject?.trim();
    const hasLegacyConsultationFields = Boolean(
      body?.address ||
        body?.program ||
        body?.major ||
        body?.subscribeNewsletter ||
        body?.subscribeConsultation,
    );
    try {
      if (!name || !email || (!subject && !hasLegacyConsultationFields)) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Vui lòng điền đầy đủ họ tên, email và chủ đề liên hệ.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }
      const result = await this.publicContactRequestsService.create(body);
      const { statusCode, body: okBody } = createSuccessResponse(result);
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logApiError('POST /api/public/contact-requests', error, {
        name: name ?? null,
        email: body?.email ?? null,
        phone: body?.phone ?? null,
        subject: body?.subject ?? null,
      });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể gửi liên hệ hỗ trợ. Vui lòng thử lại sau.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Get('auth/google/config')
  getPublicGoogleConfig(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const { statusCode, body } = createSuccessResponse({ clientId });
    return res.status(statusCode).json(body);
  }

  @Post('auth/google')
  async publicGoogleLogin(
    @Body() body: { credential?: string },
    @Res() res: Response,
  ) {
    this.logger.log('public google credential received');
    try {
      if (!body?.credential) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Thiếu credential Google.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      const profile = await this.authService.verifyGoogleToken(body.credential);
      if (!profile) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Credential Google không hợp lệ.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = await this.authService.loginWithGoogle(profile);
      if (!user) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Không thể xác thực tài khoản Google.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập Google thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logApiError('POST /api/public/auth/google', error);
      const detail =
        error instanceof Error ? error.message : 'Unknown Google login error';
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const { statusCode, body } = createErrorResponse(
        isDevelopment
          ? `Đã xảy ra lỗi khi đăng nhập Google: ${detail}`
          : 'Đã xảy ra lỗi khi đăng nhập Google.',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  /** Storefront — email/password, mọi user active (frontend gọi auth/login). */
  @Post('auth/login')
  async publicLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ) {
    return this.respondEmailPasswordLogin(body, res, 'POST /api/public/auth/login');
  }

  @Post('auth/dev-login')
  async publicDevLogin(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ) {
    return this.respondDevelopmentUserLogin(
      body,
      res,
      'POST /api/public/auth/dev-login',
    );
  }

  @Post('auth/guest-login')
  async publicGuestLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ) {
    this.logger.log(`publicGuestLogin email=${body?.email ?? '-'}`);
    try {
      const email = body?.email?.trim();
      const password = body?.password;
      if (!email || !password) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Vui lòng nhập email và mật khẩu.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = await this.authService.login({ email, password });
      if (!user || !this.isGuestPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Chỉ tài khoản khách (phụ huynh/cá nhân) mới được đăng nhập kênh này.'
            : 'Email hoặc mật khẩu không đúng.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logApiError('POST /api/public/auth/guest-login', error, {
        email: body?.email ?? null,
      });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập. Vui lòng thử lại.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/guest-dev-login')
  async publicGuestDevLogin(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ) {
    if (process.env.NODE_ENV === 'production') {
      const { statusCode, body: errBody } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(errBody);
    }

    const userId = body?.userId?.trim();
    this.logger.log(`publicGuestDevLogin userId=${userId ?? '-'}`);
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Thiếu userId.',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const user = await this.authService.loginAsDevelopmentUser(userId);
      if (!user || !this.isGuestPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Tài khoản development được chọn không phải khách (parent/user).'
            : 'Không tìm thấy tài khoản development.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập development thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logApiError('POST /api/public/auth/guest-dev-login', error, {
        userId,
      });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập development.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/store-login')
  async storeLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ) {
    return this.respondEmailPasswordLogin(
      body,
      res,
      'POST /api/public/auth/store-login',
    );
  }

  @Post('auth/store-dev-login')
  async storeDevLogin(@Body() body: { userId?: string }, @Res() res: Response) {
    return this.respondDevelopmentUserLogin(
      body,
      res,
      'POST /api/public/auth/store-dev-login',
    );
  }

  private async respondEmailPasswordLogin(
    body: { email?: string; password?: string },
    res: Response,
    logLabel: string,
  ) {
    this.logger.log(`${logLabel} email=${body?.email ?? '-'}`);
    try {
      const email = body?.email?.trim();
      const password = body?.password;
      if (!email || !password) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Vui lòng nhập email và mật khẩu.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = await this.authService.login({ email, password });
      if (!user) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Email hoặc mật khẩu không đúng.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logApiError(logLabel, error, { email: body?.email ?? null });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập. Vui lòng thử lại.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  private async respondDevelopmentUserLogin(
    body: { userId?: string },
    res: Response,
    logLabel: string,
  ) {
    if (process.env.NODE_ENV === 'production') {
      const { statusCode, body: errBody } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(errBody);
    }

    const userId = body?.userId?.trim();
    this.logger.log(`${logLabel} userId=${userId ?? '-'}`);
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Thiếu userId.',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const user = await this.authService.loginAsDevelopmentUser(userId);
      if (!user) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Không tìm thấy tài khoản development.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập development thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logApiError(logLabel, error, { userId });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập development.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('register')
  async register(@Body() body: CreatePublicRegisterDto, @Res() res: Response) {
    this.logger.log(`register email=${body?.email ?? '-'}`);
    try {
      const { fullName, email, password } = body;
      if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Vui lòng điền đầy đủ họ tên, email và mật khẩu.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      const result = await this.publicAuthService.register(body);
      const { statusCode, body: okBody } = createSuccessResponse(result, {
        status: 201,
        message: 'Đăng ký tài khoản thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể đăng ký tài khoản. Vui lòng thử lại sau.';
      this.logApiError('POST /api/public/register', error, {
        email: body?.email ?? null,
        phone: body?.phone ?? null,
      });
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status: message.includes('đã tồn tại') ? 409 : 400,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  @Get('posts')
  async getPosts(
    @Query() query: Record<string, string | undefined>,
    @Res() res: Response,
  ) {
    setCacheControl(res, 60);
    this.logger.log(
      `getPosts page=${query?.page ?? 1} limit=${query?.limit ?? 10}`,
    );
    try {
      const params = parseQuery(query);
      const result = await this.publicPostsService.getPosts(params);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/posts', error, { query });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Post('posts/:slug/view')
  async incrementPostView(@Param('slug') slug: string, @Res() res: Response) {
    this.logger.log(`incrementPostView slug=${slug}`);
    try {
      const result =
        await this.publicPostsService.incrementPostViewBySlug(slug);
      if (!result) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('POST /api/public/posts/:slug/view', error, { slug });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get('posts/:slug')
  async getPostBySlug(
    @Param('slug') slug: string,
    @Query('track') track: string | undefined,
    @Res() res: Response,
  ) {
    setCacheControl(res, 60);
    this.logger.log(`getPostBySlug slug=${slug}`);
    try {
      const shouldTrack = track !== 'false';
      const post = await this.publicPostsService.getPostBySlug(slug, {
        trackView: shouldTrack,
      });
      if (!post) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(post);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/posts/:slug', error, {
        slug,
        track,
      });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get('site-branding')
  async getSiteBranding(@Res() res: Response) {
    setNoStoreCacheControl(res);
    try {
      const branding = await this.settingsService.getPublicBranding();
      const { statusCode, body } = createSuccessResponse(branding);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/site-branding', error);
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get('seo-meta')
  async getSeoMetaByPage(@Query('page') page: string, @Res() res: Response) {
    const normalized = page?.trim();
    if (normalized === '__site__') {
      setNoStoreCacheControl(res);
    } else {
      setCacheControl(res, 300);
    }
    if (!normalized) {
      const { statusCode, body } = createErrorResponse('Thiếu query page', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
    try {
      const row = await this.seoMetasService.getByPage(normalized);
      if (!row || row.status !== 1) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse({
        page: row.page,
        title: row.title,
        description: row.description,
        keywords: row.keywords,
        ogTitle: row.ogTitle,
        ogDescription: row.ogDescription,
        ogImage: row.ogImage,
      });
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/seo-meta', error, { page: normalized });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }
}
