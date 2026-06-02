"use client"



import { useEffect, useRef, useState } from "react"

import { DEFAULT_API_URL } from "@workspace/api-client"

import { io, type Socket } from "socket.io-client"

import { readAdminSession } from "@/lib/auth-session"

export const EVENT_ATTENDANCE_SOCKET_PATH = "/api/socket"



export type EventAttendanceSocketPayload = {

  kind: "checkin" | "checkout"

  eventId: string

  at: string

  email: string

  fullName: string

  source: "hanet" | "manual"

  deviceId?: string | null

  deviceName?: string | null

  registrationId?: string | null

  checkinId?: string | null

  duplicate?: boolean

  hasCheckin?: boolean

  hasCheckout?: boolean

}



function getSocketOrigin(): string {

  const api = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(

    /\/$/,

    "",

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



export function useEventAttendanceSocket(

  eventId: string,

  enabled: boolean,

  onAttendance?: (payload: EventAttendanceSocketPayload) => void,

): {

  connected: boolean

  socketError: boolean

} {

  const socketRef = useRef<Socket | null>(null)

  const onAttendanceRef = useRef(onAttendance)

  onAttendanceRef.current = onAttendance



  const [connected, setConnected] = useState(false)

  const [socketError, setSocketError] = useState(false)



  useEffect(() => {

    if (!enabled || !eventId || typeof window === "undefined") {

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

      path: EVENT_ATTENDANCE_SOCKET_PATH,

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

      socket.emit("event:join", { eventId })

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



    const onAttendance = (payload: EventAttendanceSocketPayload) => {

      if (disposed || payload?.eventId !== eventId) return

      onAttendanceRef.current?.(payload)

    }



    socket.on("connect", onConnect)

    socket.on("disconnect", onDisconnect)

    socket.on("connect_error", onConnectError)

    socket.on("event:attendance", onAttendance)



    return () => {

      disposed = true

      socket.off("connect", onConnect)

      socket.off("disconnect", onDisconnect)

      socket.off("connect_error", onConnectError)

      socket.off("event:attendance", onAttendance)

      if (socket.connected) {

        socket.emit("event:leave", { eventId })

      }

      socket.close()

      socketRef.current = null

      setConnected(false)

      setSocketError(false)

    }

  }, [enabled, eventId])



  return { connected, socketError }

}



export function eventRegistrationsPollInterval(connected: boolean): number | false {

  return connected ? POLL_WHEN_CONNECTED_MS : POLL_WHEN_DISCONNECTED_MS

}


