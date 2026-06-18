/**
 * Integration test: DB thật + @workspace/api-client + @workspace/admin-app.
 *
 * Yêu cầu: API đang chạy (mặc định :3002), DATABASE_URL trong apps/main/api/.env.
 *
 * Chạy: pnpm --filter @api test:live
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';
import {
  createAuthAdminApi,
  createStoreSyncSdk,
  DEFAULT_API_URL,
} from '@workspace/api-client';
import {
  normalizePostFormValues,
  normalizeContentForEditor,
  buildPostUpdatePayload,
} from './lib/mirror-admin-post-form';

config({ path: resolve(__dirname, '../.env') });

const API_BASE = process.env.API_TEST_BASE_URL ?? DEFAULT_API_URL;
const ADMIN_EMAIL =
  process.env.API_TEST_ADMIN_EMAIL ?? 'superadmin@hub.edu.vn';
const ADMIN_PASSWORD = process.env.API_TEST_ADMIN_PASSWORD ?? 'demo';

type ListProbe = {
  module: string;
  run: (api: ReturnType<typeof createStoreSyncSdk>) => Promise<unknown>;
};

const LIST_PROBES: ListProbe[] = [
  { module: 'staff', run: (api) => api.users.list({ page: 1, limit: 5 }) },
  { module: 'rbac', run: (api) => api.rbac.listRoles() },
  { module: 'categories', run: (api) => api.categories.list({ page: 1, limit: 5 }) },
  { module: 'tags', run: (api) => api.tags.list({ page: 1, limit: 5 }) },
  { module: 'guides', run: (api) => api.guides.list({ page: 1, limit: 5 }) },
  { module: 'posts', run: (api) => api.posts.list({ page: 1, limit: 5 }) },
  { module: 'cameras', run: (api) => api.cameras.list({ page: 1, limit: 5 }) },
  { module: 'templates', run: (api) => api.templates.list({ page: 1, limit: 5 }) },
  { module: 'screens', run: (api) => api.screens.list({ page: 1, limit: 5 }) },
  { module: 'locations', run: (api) => api.locations.list({ page: 1, limit: 5 }) },
  { module: 'speakers', run: (api) => api.speakers.list({ page: 1, limit: 5 }) },
  { module: 'settings', run: (api) => api.settings.list() },
  { module: 'file-storage', run: (api) => api.uploads.list(1, 5) },
  { module: 'data', run: (api) => api.system.getImportConfig() },
  { module: 'events', run: (api) => api.events.list({ page: 1, limit: 5 }) },
  { module: 'departments', run: (api) => api.departments.list({ page: 1, limit: 5 }) },
  {
    module: 'academic-years',
    run: (api) => api.academicYears.list({ page: 1, limit: 5 }),
  },
  { module: 'courses', run: (api) => api.courses.list({ page: 1, limit: 5 }) },
  { module: 'majors', run: (api) => api.majors.list({ page: 1, limit: 5 }) },
  {
    module: 'training-levels',
    run: (api) => api.trainingLevels.list({ page: 1, limit: 5 }),
  },
  {
    module: 'training-systems',
    run: (api) => api.trainingSystems.list({ page: 1, limit: 5 }),
  },
  { module: 'products', run: (api) => api.products.list({ page: 1, limit: 5 }) },
  { module: 'orders', run: (api) => api.orders.list({ page: 1, limit: 5 }) },
  {
    module: 'promo-codes',
    run: (api) => api.promoCodes.list({ page: 1, limit: 5 }),
  },
  { module: 'seo-metas', run: (api) => api.seoMetas.list({ page: 1, limit: 5 }) },
  {
    module: 'contact-requests',
    run: (api) => api.contactRequests.list({ page: 1, limit: 5 }),
  },
  {
    module: 'parent-students',
    run: (api) => api.parentStudents.list({ page: 1, limit: 5 }),
  },
];

function parseMysqlUrl(url: string) {
  const normalized = url.replace(/^mysql:\/\//, 'http://');
  const parsed = new URL(normalized);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username || 'root'),
    password: decodeURIComponent(parsed.password || ''),
    database: parsed.pathname.replace(/^\//, ''),
  };
}

async function assertApiReachable(baseUrl: string) {
  const res = await fetch(`${baseUrl}/auth/admin/google/config`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok && res.status !== 401) {
    throw new Error(
      `API không phản hồi tại ${baseUrl} (HTTP ${res.status}). Chạy: pnpm --filter @api dev`,
    );
  }
}

async function queryPostCategoryIds(
  postId: number,
): Promise<number[]> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl?.startsWith('mysql')) {
    throw new Error('DATABASE_URL phải là MySQL để đối chiếu pivot post_categories');
  }
  const cfg = parseMysqlUrl(dbUrl);
  const conn = await mysql.createConnection({
    ...cfg,
    connectTimeout: 8000,
  });
  try {
    const [rows] = await conn.query<{ categoryId: number }[]>(
      'SELECT categoryId FROM post_categories WHERE postId = ? ORDER BY categoryId',
      [postId],
    );
    return rows.map((r) => Number(r.categoryId));
  } finally {
    await conn.end();
  }
}

function assertListShape(module: string, result: unknown) {
  if (result == null) {
    throw new Error(`[${module}] response rỗng`);
  }
  if (Array.isArray(result)) return;
  if (typeof result === 'object' && result !== null) {
    const obj = result as Record<string, unknown>;
    if ('items' in obj && Array.isArray(obj.items)) return;
    if ('data' in obj && Array.isArray(obj.data)) return;
    if ('modelOrder' in obj) return;
    if ('roles' in obj || 'permissions' in obj) return;
    if ('pagination' in obj && 'data' in obj) return;
  }
  throw new Error(`[${module}] shape không khớp admin list contract`);
}

async function main() {
  console.log(`[test:live] API=${API_BASE}`);
  await assertApiReachable(API_BASE);

  const auth = createAuthAdminApi({ baseUrl: API_BASE, devLogging: false });
  const login = await auth.loginWithEmail({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const userId = String(login.id);
  console.log(`[test:live] đăng nhập OK — userId=${userId} (${login.email})`);

  const api = createStoreSyncSdk({
    baseUrl: API_BASE,
    getUserId: () => userId,
    devLogging: false,
  });

  const failures: string[] = [];
  for (const probe of LIST_PROBES) {
    try {
      const result = await probe.run(api);
      assertListShape(probe.module, result);
      console.log(`[test:live] ✓ ${probe.module}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${probe.module}: ${msg}`);
      console.error(`[test:live] ✗ ${probe.module} — ${msg}`);
    }
  }

  // Posts round-trip — luồng admin edit (admin-app normalize + api-client update)
  try {
    const { items } = await api.posts.list<{ id: number | string }>({
      page: 1,
      limit: 1,
    });
    const postId = items[0]?.id;
    if (postId == null) {
      throw new Error('không có bài viết trong DB để test update');
    }

    const post = await api.posts.get<{
      id: number | string;
      title: string;
      slug: string;
      excerpt: string | null;
      image: string | null;
      content: unknown;
      published: boolean;
      publishedAt: string | null;
      categories: { id: number | string }[];
      tags: { id: number | string }[];
    }>(String(postId));

    const formValues = normalizePostFormValues({
      id: String(post.id),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      image: post.image ?? '',
      content: normalizeContentForEditor(post.content),
      published: post.published,
      publishedAt: post.publishedAt ?? '',
      categoryIds: post.categories.map((c) => String(c.id)),
      tagIds: post.tags.map((c) => String(c.id)),
    });

    const payload = buildPostUpdatePayload(formValues);

    await api.posts.update(String(postId), payload);
    const after = await api.posts.get<{
      categories: { id: number | string }[];
    }>(String(postId));

    const apiCatIds = after.categories.map((c) => Number(c.id)).sort((a, b) => a - b);
    const dbCatIds = (await queryPostCategoryIds(Number(postId))).sort(
      (a, b) => a - b,
    );
    const expected = formValues.categoryIds.map(Number).sort((a, b) => a - b);

    if (JSON.stringify(apiCatIds) !== JSON.stringify(expected)) {
      throw new Error(
        `API categories sau update không khớp form: api=${JSON.stringify(apiCatIds)} expected=${JSON.stringify(expected)}`,
      );
    }
    if (JSON.stringify(dbCatIds) !== JSON.stringify(expected)) {
      throw new Error(
        `DB post_categories không khớp form: db=${JSON.stringify(dbCatIds)} expected=${JSON.stringify(expected)}`,
      );
    }

    console.log(
      `[test:live] ✓ posts update pivot (postId=${postId}, categories=${JSON.stringify(expected)})`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`posts-update: ${msg}`);
    console.error(`[test:live] ✗ posts-update — ${msg}`);
  }

  if (failures.length) {
    console.error(
      `\n[test:live] FAIL — ${failures.length} lỗi:\n${failures.map((f) => `  - ${f}`).join('\n')}`,
    );
    process.exit(1);
  }

  console.log(
    `\n[test:live] PASS — ${LIST_PROBES.length} module + posts DB pivot (${API_BASE})`,
  );
}

main().catch((err) => {
  console.error('[test:live] fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
