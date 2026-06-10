"use client"

import { PostContentRenderer } from "./post-content-renderer"

export function PostContent({ content }: { content?: unknown | null }) {
  return <PostContentRenderer content={content} />
}
