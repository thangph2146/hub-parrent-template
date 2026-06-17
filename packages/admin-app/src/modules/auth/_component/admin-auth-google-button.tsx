"use client"

import { useEffect, useRef, useState } from "react"

import { Field } from "@ui/components/field"
import { useClientReady } from "@workspace/admin-app/runtime"

import { fetchGoogleOAuthConfig } from "../_lib/auth-api"

export type AdminAuthGoogleButtonProps = {
  disabled?: boolean
  onCredential: (credential: string) => void | Promise<void>
  notConfiguredMessage?: string
}

/** Nút Google Identity Services — `signin_with` (Đăng nhập bằng Google). */
export function AdminAuthGoogleButton({
  disabled = false,
  onCredential,
  notConfiguredMessage = "Đăng nhập Google chưa được cấu hình.",
}: AdminAuthGoogleButtonProps) {
  const clientReady = useClientReady()
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const googleInitializedRef = useRef(false)
  const onCredentialRef = useRef(onCredential)

  useEffect(() => {
    onCredentialRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientReady) return
    if (googleInitializedRef.current) return

    let cancelled = false

    fetchGoogleOAuthConfig()
      .then((resolved) => {
        if (cancelled) return
        setGoogleClientId(resolved.clientId)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [clientReady])

  useEffect(() => {
    if (!clientReady || !googleClientId || googleInitializedRef.current) return
    if (!googleBtnRef.current) return

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      const googleId = window.google?.accounts?.id
      if (!googleId || googleInitializedRef.current) return
      googleInitializedRef.current = true
      googleId.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential || disabled) return
          await onCredentialRef.current(response.credential)
        },
      })
      googleId.renderButton(googleBtnRef.current!, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "signin_with",
        size: "large",
        width: googleBtnRef.current!.clientWidth || 300,
      })
    }
    document.head.appendChild(script)

    return () => {}
  }, [clientReady, disabled, googleClientId])

  return (
    <Field>
      <div
        ref={googleBtnRef}
        className="flex min-h-11 w-full items-center justify-center"
      >
        {!googleClientId ? (
          <span className="text-sm text-muted-foreground">
            {notConfiguredMessage}
          </span>
        ) : null}
      </div>
    </Field>
  )
}
