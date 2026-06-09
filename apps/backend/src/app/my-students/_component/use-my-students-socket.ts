"use client"

import { useEffect, useRef, useState } from "react"
import { DEFAULT_API_URL } from "@workspace/api-client"
import { io, type Socket } from "socket.io-client"
import { readAdminSession } from "@/lib/auth-session"

export const MY_STUDENTS_SOCKET_PATH = "/api/socket"

export type ParentStudentReviewSocketPayload = {
  id: string
  parentId: string
  studentCode: string
  studentName: string | null
  status: "approved" | "rejected"
  reviewedAt: string
}

function getSocketOrigin(): string {
  const api = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/$/,
    ""
  )
  return api.replace(/\/api$/i, "")
}

function resolveSocketRole(): string {
  const session = readAdminSession()
  const primary = session?.roles?.[0]?.name?.trim()
  return primary ? primary.toLowerCase() : "admin"
}

const POLL_WHEN_DISCONNECTED_MS = 5_000
const POLL_WHEN_CONNECTED_MS = 45_000

export function useMyStudentsSocket(
  enabled: boolean,
  onReviewed?: (payload: ParentStudentReviewSocketPayload) => void
): {
  connected: boolean
  socketError: boolean
} {
  const socketRef = useRef<Socket | null>(null)
  const onReviewedRef = useRef(onReviewed)

  useEffect(() => {
    onReviewedRef.current = onReviewed
  }, [onReviewed])

  const [connected, setConnected] = useState(false)
  const [socketError, setSocketError] = useState(false)

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setConnected(false)
      setSocketError(false)
      return
    }

    const session = readAdminSession()
    const userId = session?.id != null ? String(session.id) : null
    if (!userId) {
      setConnected(false)
      setSocketError(true)
      return
    }

    let disposed = false

    const socket = io(getSocketOrigin(), {
      path: MY_STUDENTS_SOCKET_PATH,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      withCredentials: true,
      auth: {
        userId,
        role: resolveSocketRole(),
      },
    })

    socketRef.current = socket

    const onConnect = () => {
      if (disposed) return
      setConnected(true)
      setSocketError(false)
    }

    const onDisconnect = () => {
      if (disposed) return
      setConnected(false)
    }

    const onConnectError = () => {
      if (disposed) return
      setConnected(false)
      setSocketError(true)
    }

    const onReviewed = (payload: ParentStudentReviewSocketPayload) => {
      if (disposed || !payload?.id) return
      onReviewedRef.current?.(payload)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)
    socket.on("parent-student:reviewed", onReviewed)

    return () => {
      disposed = true
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      socket.off("parent-student:reviewed", onReviewed)
      socket.close()
      socketRef.current = null
      setConnected(false)
      setSocketError(false)
    }
  }, [enabled])

  return { connected, socketError }
}

export function myStudentsPollInterval(
  connected: boolean,
  hasPending: boolean
): number | false {
  if (!hasPending) return false
  return connected ? POLL_WHEN_CONNECTED_MS : POLL_WHEN_DISCONNECTED_MS
}
