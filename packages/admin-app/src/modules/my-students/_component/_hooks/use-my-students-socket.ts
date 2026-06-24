"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import {
  ADMIN_SOCKET_PATH,
  getAdminSocketOrigin,
  resolveAdminSocketAuth,
} from "@workspace/admin-app/lib/admin-socket"

export const MY_STUDENTS_SOCKET_PATH = ADMIN_SOCKET_PATH

export type ParentStudentReviewSocketPayload = {
  id: string
  parentId: string
  studentCode: string
  studentName: string | null
  status: "approved" | "rejected"
  reviewedAt: string
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

    const auth = resolveAdminSocketAuth()
    if (!auth) {
      setConnected(false)
      setSocketError(true)
      return
    }

    let disposed = false

    const socket = io(getAdminSocketOrigin(), {
      path: MY_STUDENTS_SOCKET_PATH,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      withCredentials: true,
      auth,
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
