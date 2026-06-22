"use client"

import { JSX, useCallback, useEffect, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getRoot, $isElementNode, LexicalEditor, LexicalNode, NodeKey } from "lexical"
import { $isImageNode, ImageNode } from "../nodes/image-node"
import { cn } from "../lib/utils"
import { BrokenImage } from "./broken-image"
import { CaptionComposer } from "./caption-composer"
import {
  ImageLightboxDialog,
  type LightboxImage,
} from "./image-lightbox-dialog"
import type { DimensionValue } from "./hooks/use-responsive-image-dimensions"

const collectImages = (node: LexicalNode, images: LightboxImage[]) => {
  if ($isImageNode(node)) {
    const imageNode = node as ImageNode
    images.push({
      key: imageNode.getKey(),
      src: imageNode.getSrc(),
      altText: imageNode.getAltText(),
    })
    return
  }
  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      collectImages(child, images)
    }
  }
}

export interface ReadOnlyImageComponentProps {
  altText: string
  caption: LexicalEditor
  fullWidth: boolean
  height: DimensionValue
  nodeKey: NodeKey
  showCaption: boolean
  src: string
  width: DimensionValue
}

/**
 * Read-only image — plain <img>, không dùng ResizeObserver / Next Image
 * (tránh vòng lặp render khi xem bài viết public).
 */
export function ReadOnlyImageComponent({
  altText,
  caption,
  fullWidth,
  nodeKey,
  showCaption,
  src,
}: ReadOnlyImageComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const imageRef = useRef<HTMLImageElement>(null)
  const [isLoadError, setIsLoadError] = useState(false)
  const [hasCaptionContent, setHasCaptionContent] = useState(false)
  const [lightbox, setLightbox] = useState<null | {
    images: LightboxImage[]
    index: number
  }>(null)

  useEffect(() => {
    setIsLoadError(false)
  }, [src])

  useEffect(() => {
    const hasContent = caption.getEditorState().read(() => {
      const root = $getRoot()
      const text = root.getTextContent().replace(/[\u200B\u00A0\s]+/g, "")
      return text.length > 0
    })
    setHasCaptionContent(showCaption && hasContent)
  }, [caption, showCaption, src])

  useEffect(() => {
    const element = editor.getElementByKey(nodeKey)
    if (!element) return

    if (fullWidth) {
      element.style.width = "100%"
      element.style.display = "block"
    } else {
      element.style.width = ""
      element.style.display = "inline-block"
    }
  }, [editor, fullWidth, nodeKey, src])

  const openLightbox = useCallback(() => {
    const images = editor.getEditorState().read(() => {
      const list: LightboxImage[] = []
      collectImages($getRoot(), list)
      return list
    })
    if (images.length === 0) return

    const index = Math.max(
      0,
      images.findIndex((img) => img.key === nodeKey),
    )
    setLightbox({ images, index })
  }, [editor, nodeKey])

  const imageClassName = cn("editor-image", fullWidth && "full-width")
  const shouldRenderCaption = showCaption && hasCaptionContent

  return (
    <>
      <div style={{ display: "inline-block" }}>
        {isLoadError ? (
          <BrokenImage />
        ) : (
          <button
            type="button"
            className="editor-image-link"
            aria-label="Xem ảnh lớn"
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openLightbox()
            }}
          >
            <img
              ref={imageRef}
              src={src}
              alt={altText}
              title={altText}
              className={imageClassName}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setIsLoadError(true)}
            />
          </button>
        )}
      </div>

      {shouldRenderCaption ? (
        <div className="editor-image-caption readonly">
          <CaptionComposer caption={caption} isEditable={false} />
        </div>
      ) : null}

      {lightbox ? (
        <ImageLightboxDialog
          open={true}
          images={lightbox.images}
          index={lightbox.index}
          onIndexChange={(nextIndex) =>
            setLightbox((prev) => (prev ? { ...prev, index: nextIndex } : prev))
          }
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </>
  )
}
