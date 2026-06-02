"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import {
  buildEventsHref,
  type EventsListQuery,
} from "@/lib/events-list-query"

type EventsSearchFormProps = {
  initialSearch: string
  query: EventsListQuery
}

export function EventsSearchForm({
  initialSearch,
  query,
}: EventsSearchFormProps) {
  const router = useRouter()
  const [value, setValue] = useState(initialSearch)

  useEffect(() => {
    setValue(initialSearch)
  }, [initialSearch])

  const navigate = (term: string) => {
    const trimmed = term.trim()
    router.push(
      buildEventsHref(query, { search: trimmed || undefined, page: 1 }),
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(value)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tìm theo tên sự kiện, địa điểm, ban tổ chức..."
        className="h-11 rounded-xl border-border/80 bg-card pl-10 pr-24 text-sm shadow-sm"
        aria-label="Tìm kiếm sự kiện"
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
        {value.trim() ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground"
            onClick={() => {
              setValue("")
              navigate("")
            }}
            aria-label="Xóa tìm kiếm"
          >
            <X className="size-4" />
          </Button>
        ) : null}
        <Button type="submit" size="sm" className="h-8 rounded-lg px-3 text-xs">
          Tìm
        </Button>
      </div>
    </form>
  )
}
