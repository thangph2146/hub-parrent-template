import { ApiError } from "@workspace/api-client";
import { api } from "@/lib/api";

type PublicPostCategory = {
  category: {
    name: string;
    slug: string;
  };
};

type PublicPostTag = {
  tag: {
    name: string;
    slug: string;
  };
};

type PublicPostAuthor = {
  name: string | null;
  avatar?: string | null;
};

export type PublicPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  publishedAt?: string | null;
  eventStartAt?: string | null;
  eventEndAt?: string | null;
  author?: PublicPostAuthor | null;
  categories: PublicPostCategory[];
  tags: PublicPostTag[];
  viewCount: number;
};

export type PublicPostDetail = PublicPostSummary & {
  content?: unknown | null;
};

export type PublicCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  _count: { children: number };
  postCount: number;
};

export async function getPublicPosts(params?: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}) {
  return api.public.listPosts<PublicPostSummary>(params);
}

export async function getPublicCategories(params?: { slug?: string }) {
  return api.public.listPostCategories<PublicCategoryItem>(params);
}

const _slugFetchCache = new Map<string, Promise<PublicPostDetail | null>>();

export async function getPublicPostBySlug(slug: string) {
  const cached = _slugFetchCache.get(slug);
  if (cached) return cached;

  const promise = (async () => {
    try {
      return await api.public.getPostBySlug<PublicPostDetail>(slug, {
        track: false,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error);
      if (/not found/i.test(message) || (error instanceof ApiError && error.status === 404)) {
        return null;
      }
      throw error;
    }
  })();

  if (_slugFetchCache.size > 50) _slugFetchCache.clear();
  _slugFetchCache.set(slug, promise);

  try {
    return await promise;
  } finally {
    _slugFetchCache.delete(slug);
  }
}

export function formatPostDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
