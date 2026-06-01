"use client";

import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { ImageLightboxDialog, type LightboxImage } from "@thangph2146/lexical-editor";
import { DEFAULT_API_URL } from "@workspace/api-client";

type SerializedNode = {
  type?: string;
  children?: SerializedNode[];
  text?: string;
  format?: number | string;
  tag?: string;
  url?: string;
  rel?: string | null;
  target?: string | null;
  src?: string;
  altText?: string;
  width?: number | "inherit";
  height?: number | "inherit";
  listType?: "bullet" | "number" | "check";
  checked?: boolean;
  direction?: "ltr" | "rtl" | null;
  caption?: {
    editorState?: {
      root?: { children?: SerializedNode[] };
    };
  };
  showCaption?: boolean;
  colWidths?: number[];
  headerState?: number;
  colSpan?: number;
  rowSpan?: number;
};

const TEXT_FORMAT_BOLD = 1;
const TEXT_FORMAT_ITALIC = 1 << 1;
const TEXT_FORMAT_STRIKETHROUGH = 1 << 2;
const TEXT_FORMAT_UNDERLINE = 1 << 3;
const TEXT_FORMAT_CODE = 1 << 4;

function isSerializedEditorState(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    "root" in value &&
    value.root !== null &&
    typeof value.root === "object" &&
    "type" in (value.root as Record<string, unknown>) &&
    (value.root as Record<string, unknown>).type === "root"
  );
}

function parseSerializedEditorState(value: unknown): unknown {
  if (isSerializedEditorState(value)) return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return isSerializedEditorState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, "");
}

function optimizeImageUrl(src: string, width = 800): string {
  const API_RE = /^(\/api\/)?uploads\//;
  const trimmed = src.trim();
  if (!trimmed || !API_RE.test(trimmed.replace(/^https?:\/\/[^/]+/, ""))) return trimmed;
  const pathOnly = trimmed.replace(/^https?:\/\/[^/]+/, "").replace("/api/", "");
  const hasQuery = pathOnly.includes("?");
  const sep = hasQuery ? "&" : "?";
  return `${getApiBase()}/api/uploads/resized/${pathOnly.replace(/^uploads\//, "")}${sep}w=${width}&q=80`;
}

function collectSerializedImages(nodes: SerializedNode[], images: LightboxImage[] = []): LightboxImage[] {
  for (const node of nodes) {
    if (node.type === "image" && typeof node.src === "string" && node.src.trim()) {
      images.push({ key: `${images.length}-${node.src}`, src: node.src.trim(), altText: node.altText ?? "" });
    }
    if (Array.isArray(node.children)) collectSerializedImages(node.children, images);
  }
  return images;
}

function applyTextFormatting(node: SerializedNode, content: ReactNode): ReactNode {
  if (typeof node.format !== "number" || node.format === 0) return content;
  let formatted = content;
  if (node.format & TEXT_FORMAT_CODE) formatted = <code>{formatted}</code>;
  if (node.format & TEXT_FORMAT_BOLD) formatted = <strong>{formatted}</strong>;
  if (node.format & TEXT_FORMAT_ITALIC) formatted = <em>{formatted}</em>;
  if (node.format & TEXT_FORMAT_UNDERLINE) formatted = <u>{formatted}</u>;
  if (node.format & TEXT_FORMAT_STRIKETHROUGH) formatted = <s>{formatted}</s>;
  return formatted;
}

function isBlockLevelSerializedNode(node: SerializedNode): boolean {
  switch (node.type) {
    case "heading":
    case "quote":
    case "list":
    case "listitem":
    case "image":
    case "paragraph":
      return true;
    default:
      return false;
  }
}

function nodeHasBlockDescendant(node: SerializedNode): boolean {
  if (!Array.isArray(node.children) || node.children.length === 0) return false;
  for (const child of node.children) {
    if (isBlockLevelSerializedNode(child)) return true;
    if (nodeHasBlockDescendant(child)) return true;
  }
  return false;
}

function renderNodes(
  nodes: SerializedNode[],
  options: { onImageClick: (src: string) => void },
  keyPrefix = "node",
): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}-${node.type ?? "unknown"}`;
    const children = Array.isArray(node.children) ? renderNodes(node.children, options, key) : null;

    switch (node.type) {
      case "paragraph": {
        const rawChildren = Array.isArray(node.children) ? node.children : [];
        const paragraphBlocks: ReactNode[] = [];
        let inlineBuffer: SerializedNode[] = [];
        let paragraphIndex = 0;

        const flushInlineBuffer = () => {
          if (inlineBuffer.length === 0) return;
          const inlineNodes = renderNodes(
            inlineBuffer,
            options,
            `${key}-inline-${paragraphIndex}`,
          );
          paragraphBlocks.push(
            <div
              key={`${key}-p-${paragraphIndex}`}
              dir={node.direction ?? undefined}
              className="leading-7"
            >
              {inlineNodes.length > 0 ? inlineNodes : <br />}
            </div>,
          );
          inlineBuffer = [];
          paragraphIndex += 1;
        };

        for (const childNode of rawChildren) {
          const shouldTreatAsBlock =
            isBlockLevelSerializedNode(childNode) ||
            (childNode.type === "link" && nodeHasBlockDescendant(childNode));

          if (shouldTreatAsBlock) {
            flushInlineBuffer();
            const [renderedBlock] = renderNodes(
              [childNode],
              options,
              `${key}-block-${paragraphIndex}`,
            );
            if (renderedBlock) {
              paragraphBlocks.push(renderedBlock);
              paragraphIndex += 1;
            }
            continue;
          }

          inlineBuffer.push(childNode);
        }

        flushInlineBuffer();

        if (paragraphBlocks.length === 0) {
          return (
            <div key={key} dir={node.direction ?? undefined} className="leading-7">
              <br />
            </div>
          );
        }

        if (paragraphBlocks.length === 1) {
          return <div key={key}>{paragraphBlocks[0]}</div>;
        }

        return (
          <div key={key} className="space-y-4">
            {paragraphBlocks}
          </div>
        );
      }
      case "heading": {
        const tag = (node.tag === "h1" || node.tag === "h2" || node.tag === "h3" ? node.tag : "h2") as "h1" | "h2" | "h3";
        const cls = tag === "h1" ? "text-3xl font-bold" : tag === "h2" ? "text-2xl font-semibold" : "text-xl font-semibold";
        const Tag = tag;
        return <Tag key={key} className={cls}>{children}</Tag>;
      }
      case "quote":
        return <blockquote key={key} className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">{children}</blockquote>;
      case "list": {
        const Tag = node.listType === "number" ? "ol" : "ul";
        return <Tag key={key} className={node.listType === "number" ? "list-decimal space-y-2 pl-6" : "list-disc space-y-2 pl-6"}>{children}</Tag>;
      }
      case "listitem":
        return <li key={key} className="leading-7">{children}</li>;
      case "link":
        return <a key={key} href={node.url} rel={node.rel ?? "noreferrer"} target={node.target ?? "_blank"} className="text-primary underline underline-offset-4">{children}</a>;
      case "linebreak":
        return <br key={key} />;
      case "image": {
        const src = node.src?.trim();
        if (!src) return null;
        return (
          <figure key={key} className="my-4">
            <button type="button" className="block w-full cursor-zoom-in" onClick={() => options.onImageClick(src)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={optimizeImageUrl(src, 800)} alt={node.altText ?? ""} className="h-auto max-w-full rounded-lg" loading="lazy" decoding="async" />
            </button>
          </figure>
        );
      }
      case "text":
        return <span key={key}>{applyTextFormatting(node, node.text ?? "")}</span>;
      default:
        return children ? <div key={key}>{children}</div> : null;
    }
  });
}

export function EventContentRenderer({ content }: { content?: unknown | null }) {
  const editorState = parseSerializedEditorState(content);
  const stateRoot = editorState && typeof editorState === "object"
    ? (editorState as Record<string, unknown>).root
    : null;
  const rootChildren = stateRoot && typeof stateRoot === "object"
    ? (stateRoot as Record<string, unknown>).children
    : null;
  const nodes = useMemo<SerializedNode[]>(
    () => (Array.isArray(rootChildren) ? (rootChildren as SerializedNode[]) : []),
    [rootChildren],
  );
  const images = useMemo(() => collectSerializedImages(nodes), [nodes]);
  const [lightbox, setLightbox] = useState<null | { images: LightboxImage[]; index: number }>(null);
  const openImage = useCallback((src: string) => {
    const index = images.findIndex((item) => item.src === src);
    if (index === -1) return;
    setLightbox({ images, index });
  }, [images]);

  if (nodes.length > 0) {
    return (
      <>
        <div className="space-y-4">{renderNodes(nodes, { onImageClick: openImage })}</div>
        {lightbox ? (
          <ImageLightboxDialog open images={lightbox.images} index={lightbox.index} onIndexChange={(i) => setLightbox((prev) => prev ? { ...prev, index: i } : prev)} onClose={() => setLightbox(null)} />
        ) : null}
      </>
    );
  }

  if (typeof content === "string") {
    if (/<[^>]+>/.test(content)) {
      return <div className="space-y-4 leading-7 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    return <div className="whitespace-pre-wrap leading-7">{content}</div>;
  }

  return <p className="text-muted-foreground italic">Nội dung đang được cập nhật.</p>;
}
