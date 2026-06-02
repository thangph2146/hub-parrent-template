"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, QrCode, Ticket } from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"

export function EventsCodePanel() {
  const [code, setCode] = useState("")
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    router.push(`/tra-cuu?code=${encodeURIComponent(trimmed)}`)
  }

  return (
    <section className="border-t border-border bg-gradient-to-br from-secondary/90 via-secondary to-secondary/95 py-12 sm:py-14">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <div className="rounded-2xl border border-white/15 bg-card p-6 shadow-xl sm:p-8">
            <Ticket className="size-9 text-primary" aria-hidden />
            <p className="mt-3 text-base font-semibold text-foreground">Nhập mã sự kiện</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Mã thường được in trên poster hoặc gửi qua email đăng ký.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: HUB2026"
                className="h-11 rounded-lg border-border bg-background font-mono uppercase tracking-widest sm:flex-1"
                aria-label="Mã sự kiện"
              />
              <Button type="submit" className="h-11 shrink-0 rounded-lg px-6 font-semibold">
                Tiếp tục
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  )
}
