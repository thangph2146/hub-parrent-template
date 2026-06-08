"use client"

import { useState, useEffect, useRef } from "react"
import { Editor } from "../editor-x/editor"
import type { SerializedEditorState } from "lexical"
import { logger } from "../lib/logger"
import { EditorUploadsProvider } from "../context/uploads-context"

export interface LexicalEditorProps {
  value?: unknown
  onChange?: (value: SerializedEditorState) => void
  readOnly?: boolean
  className?: string
  placeholder?: string
  uploadsContext?: import("../context/uploads-context").EditorUploadsContextType
  stickyTop?: number
}

function isValidSerializedEditorState(
  value: unknown
): value is SerializedEditorState {
  return (
    value !== null &&
    typeof value === "object" &&
    "root" in value &&
    value.root !== null &&
    typeof value.root === "object" &&
    "type" in (value.root as Record<string, unknown>) &&
    (value.root as Record<string, unknown>).type === "root"
  )
}

export function LexicalEditor({
  value,
  onChange,
  readOnly = false,
  className,
  placeholder = "",
  uploadsContext,
  stickyTop,
}: LexicalEditorProps) {
  const parseIncomingValue = (
    incoming: unknown
  ): SerializedEditorState | undefined => {
    if (incoming && typeof incoming === "object" && incoming !== null) {
      if (isValidSerializedEditorState(incoming)) return incoming
      logger.error("[LexicalEditor] Invalid value object structure:", incoming)
      return undefined
    }

    // If value is a JSON string, try to parse it
    if (typeof incoming === "string" && incoming.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(incoming)
        if (isValidSerializedEditorState(parsed)) return parsed
        logger.error("[LexicalEditor] Invalid parsed JSON structure:", parsed)
      } catch (error) {
        logger.error("[LexicalEditor] Error parsing value string:", error)
      }
    }

    if (incoming === null || incoming === undefined) return undefined
    return undefined
  }

  // Keep latest hash coming from the editor itself.
  // If parent echoes this same state back through `value`, we must not re-sync
  // because that would reset selection/focus.
  const latestInternalHashRef = useRef<string | null>(null)

  // Only this state is used to sync into the underlying Lexical editor instance.
  const [syncedEditorState, setSyncedEditorState] = useState<
    SerializedEditorState | undefined
  >(() => {
    return parseIncomingValue(value)
  })

  const syncedHashRef = useRef<string | null>(null)
  useEffect(() => {
    syncedHashRef.current = syncedEditorState
      ? JSON.stringify(syncedEditorState)
      : null
  }, [syncedEditorState])

  useEffect(() => {
    const parsed = parseIncomingValue(value)
    const newHash = parsed ? JSON.stringify(parsed) : null

    // If this came from the last editor change, don't re-sync (prevents blur/unfocus).
    if (newHash === latestInternalHashRef.current) return

    if (newHash === syncedHashRef.current) return

    syncedHashRef.current = newHash
    setSyncedEditorState(parsed)
  }, [value]) // Only depend on value

  const handleSerializedChange = (newState: SerializedEditorState) => {
    if (readOnly) return

    latestInternalHashRef.current = JSON.stringify(newState)

    if (onChange) {
      onChange(newState)
    }
  }

  const editorContent = (
    <Editor
      editorSerializedState={syncedEditorState}
      onSerializedChange={handleSerializedChange}
      readOnly={readOnly}
      placeholder={placeholder}
      stickyTop={stickyTop}
    />
  )

  return (
    <div className={className}>
      {uploadsContext ? (
        <EditorUploadsProvider value={uploadsContext}>
          {editorContent}
        </EditorUploadsProvider>
      ) : (
        editorContent
      )}
    </div>
  )
}
