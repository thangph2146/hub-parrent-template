import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  Param,
  Headers,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { PublicPostsService } from './public-posts.service';
import { PublicCategoriesService } from './public-categories.service';
import { PublicContactRequestsService } from './public-contact-requests.service';
import {
  PublicEventsService,
  type EventTimeFilter,
} from './public-events.service';
import { PublicEventCategoriesService } from './public-event-categories.service';
import {
  PublicAuthService,
  type CreatePublicRegisterDto,
} from './public-auth.service';
import { AdmissionResultsService } from '../admission-results/admission-results.service';
import { PageContentsService } from '../page-contents/page-contents.service';
import type { CreateContactRequestDto } from './public-contact-requests.service';
import { AuthService } from '../auth/auth.service';
import type { AuthUserPayload } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { PUBLIC_ROUTES, APP_HEADERS } from '../config/constants';
import { Public } from '../common/public.decorator';
import { AUTH_ROLE_NAMES } from '../config/constants';
import { PublicEventRegistrationService } from './public-event-registration.service';
import {
  EVENT_STUDENT_EMAIL_ERROR,
  isEventStudentSchoolEmail,
} from './event-student-email';
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

@Public()
@Controller(PUBLIC_ROUTES.BASE)
export class PublicController {
  private readonly logger = new Logger(PublicController.name);

  constructor(
    private readonly publicPostsService: PublicPostsService,
    private readonly publicCategoriesService: PublicCategoriesService,
    private readonly publicContactRequestsService: PublicContactRequestsService,
    private readonly publicAuthService: PublicAuthService,
    private readonly publicEventsService: PublicEventsService,
    private readonly publicEventCategoriesService: PublicEventCategoriesService,
    private readonly admissionResultsService: AdmissionResultsService,
    private readonly pageContentsService: PageContentsService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly publicEventRegistrationService: PublicEventRegistrationService,
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

  private isStudentPayload(
    user: AuthUserPayload | null,
  ): user is AuthUserPayload {
    return Boolean(
      user?.roles?.some((role) => role.name === AUTH_ROLE_NAMES.STUDENT),
    );
  }

  /** Khách / phụ huynh / user cá nhân — không phải sinh viên hay quản trị. */
  private isEventGuestPayload(
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
    if (process.env.NODE_ENV !== 'development') {
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

  @Get('admission-results/lookup')
  async lookupAdmissionResult(
    @Query('cccd') cccd: string,
    @Query('soBaoDanh') soBaoDanh: string,
    @Res() res: Response,
  ) {
    this.logger.log(
      `lookupAdmissionResult cccd=${cccd} soBaoDanh=${soBaoDanh}`,
    );
    try {
      if (!cccd?.trim() || !soBaoDanh?.trim()) {
        const { statusCode, body } = createErrorResponse(
          'Vui lòng nhập đầy đủ số CCCD và số báo danh.',
          { status: 400 },
        );
        return res.status(statusCode).json(body);
      }

      const result = await this.admissionResultsService.lookup(cccd, soBaoDanh);
      if (!result) {
        const { statusCode, body } = createErrorResponse(
          'Không tìm thấy kết quả trúng tuyển với thông tin đã cung cấp.',
          { status: 404 },
        );
        return res.status(statusCode).json(body);
      }

      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/admission-results/lookup', error, {
        cccd,
        soBaoDanh,
      });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
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
            {
              status: 404,
            },
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
          {
            status: 404,
          },
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
        {
          status: 500,
        },
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
    try {
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

      if (!isEventStudentSchoolEmail(profile.email)) {
        const { statusCode, body: errBody } = createErrorResponse(
          EVENT_STUDENT_EMAIL_ERROR,
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = await this.authService.loginWithGoogleAsStudent({
        email: profile.email,
        name: profile.name ?? null,
      });

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

  @Post('auth/login')
  async publicLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ) {
    this.logger.log(`publicLogin email=${body?.email ?? '-'}`);
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

      if (!isEventStudentSchoolEmail(email)) {
        const { statusCode, body: errBody } = createErrorResponse(
          EVENT_STUDENT_EMAIL_ERROR,
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = await this.authService.login({ email, password });
      if (!user || !this.isStudentPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Chỉ tài khoản sinh viên mới được đăng nhập cổng sự kiện.'
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
      this.logApiError('POST /api/public/auth/login', error, {
        email: body?.email ?? null,
      });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập. Vui lòng thử lại.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/dev-login')
  async publicDevLogin(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ) {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body: errBody } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(errBody);
    }

    const userId = body?.userId?.trim();
    this.logger.log(`publicDevLogin userId=${userId ?? '-'}`);
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Thiếu userId.',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const user = await this.authService.loginAsDevelopmentUser(userId);
      if (!user || !this.isStudentPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Tài khoản development được chọn không có role student.'
            : 'Không tìm thấy tài khoản development.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      if (!isEventStudentSchoolEmail(user.email)) {
        const { statusCode, body: errBody } = createErrorResponse(
          EVENT_STUDENT_EMAIL_ERROR,
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập development thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logApiError('POST /api/public/auth/dev-login', error, { userId });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập development.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
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
      if (!user || !this.isEventGuestPayload(user)) {
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
    if (process.env.NODE_ENV !== 'development') {
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
      if (!user || !this.isEventGuestPayload(user)) {
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

  /** Storefront B2B — email/password, mọi user active có role (không giới hạn student). */
  @Post('auth/store-login')
  async storeLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ) {
    this.logger.log(`storeLogin email=${body?.email ?? '-'}`);
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
      this.logApiError('POST /api/public/auth/store-login', error, {
        email: body?.email ?? null,
      });
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập. Vui lòng thử lại.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  /** Storefront B2B — dev only, chọn user theo id (không cần mật khẩu). */
  @Post('auth/store-dev-login')
  async storeDevLogin(@Body() body: { userId?: string }, @Res() res: Response) {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body: errBody } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(errBody);
    }

    const userId = body?.userId?.trim();
    this.logger.log(`storeDevLogin userId=${userId ?? '-'}`);
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
      this.logApiError('POST /api/public/auth/store-dev-login', error, {
        userId,
      });
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

  @Get('home-admission-posts')
  async getHomeAdmissionPosts(
    @Query() query: Record<string, string | undefined>,
    @Res() res: Response,
  ) {
    setCacheControl(res, 60);
    this.logger.log('getHomeAdmissionPosts');
    try {
      const latestLimit = query.latestLimit
        ? parseInt(String(query.latestLimit), 10)
        : undefined;
      const admissionLimit = query.admissionLimit
        ? parseInt(String(query.admissionLimit), 10)
        : undefined;
      const result = await this.publicPostsService.getHomeAdmissionPosts({
        latestLimit,
        admissionLimit,
        admissionCategorySlug: query.admissionCategorySlug,
      });
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/home-admission-posts', error, {
        query,
      });
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

  @Get('events')
  async getEvents(
    @Query() query: Record<string, string | undefined>,
    @Res() res: Response,
  ) {
    setCacheControl(res, 60);
    this.logger.log(
      `getEvents page=${query?.page ?? 1} filter=${query?.filter ?? 'all'}`,
    );
    try {
      const page = Math.max(1, parseInt(String(query.page), 10) || 1);
      const limit = Math.min(
        50,
        Math.max(1, parseInt(String(query.limit), 10) || 12),
      );
      const filter = (query.filter as EventTimeFilter) ?? 'all';
      const categorySlug = query.categorySlug?.trim() || undefined;
      const search = query.search?.trim() || undefined;
      const registerableRaw = (query.registerable ?? '').trim().toLowerCase();
      const registerable =
        registerableRaw === '1' ||
        registerableRaw === 'true' ||
        registerableRaw === 'yes';
      const result = await this.publicEventsService.list({
        page,
        limit,
        filter: ['upcoming', 'ongoing', 'past', 'featured'].includes(filter)
          ? filter
          : 'all',
        categorySlug,
        search,
        registerable: registerable || undefined,
      });
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/events', error, { query });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Post('events/:slug/register')
  async registerForEvent(
    @Param('slug') slug: string,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { phone?: string },
    @Res() res: Response,
  ) {
    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    this.logger.log(`registerForEvent slug=${slug} userId=${userId ?? '-'}`);
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Vui lòng đăng nhập trước khi đăng ký sự kiện.',
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const result = await this.publicEventRegistrationService.register(
        slug,
        userId,
        body?.phone,
      );
      const { statusCode, body: okBody } = createSuccessResponse(result, {
        status: 201,
        message: 'Đăng ký sự kiện thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể đăng ký sự kiện.';
      this.logApiError('POST /api/public/events/:slug/register', error, {
        slug,
        userId,
      });
      const status = message.includes('đã đăng ký') ? 409 : 400;
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  @Get('me/events')
  async getMyRegisteredEvents(
    @Headers() headers: Record<string, string | undefined>,
    @Res() res: Response,
  ) {
    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    this.logger.log(`getMyRegisteredEvents userId=${userId ?? '-'}`);
    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        'Vui lòng đăng nhập trước khi xem sự kiện đã đăng ký.',
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }

    try {
      const result =
        await this.publicEventRegistrationService.listMyEvents(userId);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể tải danh sách sự kiện đã đăng ký.';
      this.logApiError('GET /api/public/me/events', error, { userId });
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
  ) {
    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    this.logger.log(
      `cancelMyEventRegistration id=${id} userId=${userId ?? '-'}`,
    );
    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        'Vui lòng đăng nhập trước khi hủy đăng ký.',
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }

    try {
      const result =
        await this.publicEventRegistrationService.cancelMyRegistration(
          userId,
          id,
        );
      const { statusCode, body } = createSuccessResponse(result, {
        message: 'Đã hủy đăng ký sự kiện.',
      });
      return res.status(statusCode).json(body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể hủy đăng ký.';
      this.logApiError(
        'POST /api/public/me/event-registrations/:id/cancel',
        error,
        {
          id,
          userId,
        },
      );
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('events/:slug')
  async getEventBySlug(
    @Param('slug') slug: string,
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    setCacheControl(res, 60);
    const viewerUserId = headers[APP_HEADERS.USER_ID]?.trim();
    this.logger.log(
      `getEventBySlug slug=${slug} viewer=${viewerUserId ?? '-'}`,
    );
    try {
      const event = await this.publicEventsService.getBySlug(
        slug,
        viewerUserId,
      );
      if (!event) {
        const { statusCode, body } = createErrorResponse('Not Found', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(event);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/events/:slug', error, { slug });
      const { statusCode, body } = createErrorResponse(
        'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get('event-categories')
  async getEventCategories(
    @Query('slug') slug: string | undefined,
    @Res() res: Response,
  ) {
    setCacheControl(res, 120);
    this.logger.log(`getEventCategories slug=${slug ?? 'all'}`);
    try {
      const categories =
        await this.publicEventCategoriesService.getCategories(slug);
      const { statusCode, body } = createSuccessResponse(categories);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/public/event-categories', error, { slug });
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
    // SEO mặc định toàn site (__site__) dùng cho admin <head> — không cache để cập nhật ngay sau lưu.
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
