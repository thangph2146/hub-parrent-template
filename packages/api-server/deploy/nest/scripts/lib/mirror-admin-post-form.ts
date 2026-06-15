/**
 * Mirror contract từ @workspace/admin-app/modules/posts (không import React/@ui).
 * Giữ đồng bộ với use-post-form.ts + utils.ts khi đổi payload edit bài viết.
 */

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  content: Record<string, unknown>;
  published: boolean;
  publishedAt: string;
  categoryIds: string[];
  tagIds: string[];
};

const EMPTY_CONTENT: Record<string, unknown> = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
};

const EMPTY_VALUES: PostFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  image: '',
  content: EMPTY_CONTENT,
  published: false,
  publishedAt: '',
  categoryIds: [],
  tagIds: [],
};

export function normalizePostFormValues(
  values: Partial<PostFormValues>,
): PostFormValues {
  return {
    ...EMPTY_VALUES,
    ...values,
    id: values.id != null && values.id !== '' ? String(values.id) : undefined,
    title: values.title ?? '',
    slug: values.slug ?? '',
    excerpt: values.excerpt ?? '',
    image: values.image ?? '',
    content: (values.content as Record<string, unknown>) ?? EMPTY_VALUES.content,
    published: values.published ?? false,
    publishedAt: values.publishedAt ?? '',
    categoryIds: (values.categoryIds ?? []).map(String),
    tagIds: (values.tagIds ?? []).map(String),
  };
}

function isSerializedEditorState(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'root' in value &&
    typeof (value as Record<string, unknown>).root === 'object'
  );
}

export function normalizeContentForEditor(value: unknown): Record<string, unknown> {
  if (isSerializedEditorState(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (isSerializedEditorState(parsed)) return parsed;
      } catch {
        /* plain text fallback */
      }
    }
  }
  return EMPTY_CONTENT;
}

/** Payload PUT — khớp packages/admin-app/.../edit/page.tsx handleSubmit */
export function buildPostUpdatePayload(values: PostFormValues) {
  return {
    title: values.title.trim(),
    slug:
      values.slug.trim() ||
      values.title.trim().toLowerCase().replace(/\s+/g, '-'),
    excerpt: values.excerpt.trim() || null,
    image: values.image.trim() || null,
    content: values.content,
    published: values.published,
    publishedAt: values.publishedAt || null,
    categoryIds: values.categoryIds,
    tagIds: values.tagIds,
  };
}
