import * as fs from 'fs';
import * as path from 'path';

export type ExportPostSeedSource = {
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  published: boolean;
  content: unknown;
};

type ExportBundle = Record<string, unknown>;

function normalizePostRows(bundle: ExportBundle): unknown[] {
  const raw = bundle.post ?? bundle.posts;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return Object.values(raw);
  return [];
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return fallback;
}

/** Đọc bài viết từ file export JSON (full-export). */
export function loadExportPosts(filePath: string): ExportPostSeedSource[] {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Không tìm thấy file export bài viết: ${resolved}`);
  }

  const bundle = JSON.parse(fs.readFileSync(resolved, 'utf8')) as ExportBundle;
  const rows = normalizePostRows(bundle);

  const posts: ExportPostSeedSource[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const title = asString(record.title);
    if (!title) continue;

    const slug =
      asString(record.slug) ??
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);

    posts.push({
      title,
      slug: slug || `post-${posts.length + 1}`,
      excerpt: asString(record.excerpt),
      image: asString(record.image),
      published: asBool(record.published, true),
      content: record.content ?? null,
    });
  }

  return posts.filter((p) => p.published);
}
