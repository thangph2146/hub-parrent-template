"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "../input"
import { cn } from "../../lib/utils"

export type DataTableUserSearchOption = {
  id: string
  label: string
  sublabel?: string
}

export type DataTableUserSearchHandlers = {
  onSearch: (query: string) => Promise<DataTableUserSearchOption[]>
  onResolveUser?: (id: string) => Promise<DataTableUserSearchOption | null>
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number
) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const debouncedFn = (...args: TArgs) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
  debouncedFn.cancel = () => {
    if (timer) clearTimeout(timer)
  }
  return debouncedFn
}

function formatUserOption(option: DataTableUserSearchOption): string {
  const label = option.label?.trim()
  const sub = option.sublabel?.trim()
  if (label && sub && label !== sub) return `${label} · ${sub}`
  return label || sub || option.id
}

type DataTableUserSearchFilterProps = {
  controlId: string
  value: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  handlers: DataTableUserSearchHandlers
}

export function DataTableUserSearchFilter({
  controlId,
  value,
  onChange,
  placeholder = "Tên, email hoặc ID…",
  disabled = false,
  handlers,
}: DataTableUserSearchFilterProps) {
  const listId = `${controlId}-suggestions`
  const rootRef = useRef<HTMLDivElement>(null)
  const [inputText, setInputText] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<DataTableUserSearchOption[]>(
    []
  )
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const debouncedSetSearch = useMemo(
    () => debounce((next: string) => setDebouncedSearch(next), 300),
    []
  )

  useEffect(
    () => () => {
      debouncedSetSearch.cancel()
    },
    [debouncedSetSearch]
  )

  useEffect(() => {
    const trimmed = value.trim()
    if (!trimmed) {
      setInputText("")
      return
    }
    if (!UUID_RE.test(trimmed) || !handlers.onResolveUser) {
      setInputText(trimmed)
      return
    }
    let cancelled = false
    void handlers
      .onResolveUser(trimmed)
      .then((user) => {
        if (!cancelled) {
          setInputText(user ? formatUserOption(user) : trimmed)
        }
      })
      .catch(() => {
        if (!cancelled) setInputText(trimmed)
      })
    return () => {
      cancelled = true
    }
  }, [handlers, value])

  useEffect(() => {
    const q = debouncedSearch.trim()
    if (!open || q.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    void handlers
      .onSearch(q)
      .then((items) => {
        if (!cancelled) setSuggestions(items)
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, handlers, open])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const applyUser = useCallback(
    (user: DataTableUserSearchOption) => {
      onChange(user.id)
      setInputText(formatUserOption(user))
      setOpen(false)
      setSuggestions([])
    },
    [onChange]
  )

  const handleInputChange = (next: string) => {
    setInputText(next)
    setOpen(true)
    debouncedSetSearch(next)
    onChange(next.trim() ? next : undefined)
  }

  const showSuggestions =
    open &&
    (loading || suggestions.length > 0 || debouncedSearch.trim().length >= 2)

  return (
    <div ref={rootRef} className="relative min-w-0">
      <Input
        id={controlId}
        value={inputText}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="h-8 w-full rounded-md text-sm shadow-none"
        disabled={disabled}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listId : undefined}
        aria-autocomplete="list"
        autoComplete="off"
      />
      {showSuggestions ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+4px)] z-50 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md"
        >
          {loading ? (
            <li className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Đang tìm…
            </li>
          ) : null}
          {!loading && suggestions.length === 0 ? (
            <li className="px-2 py-2 text-xs text-muted-foreground">
              Không tìm thấy — vẫn lọc theo ID nếu bạn nhập trực tiếp.
            </li>
          ) : null}
          {suggestions.map((user) => (
            <li key={user.id} role="option" aria-selected={value === user.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent",
                  value === user.id && "bg-accent/60"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyUser(user)}
              >
                <span className="font-medium text-foreground">
                  {user.label}
                </span>
                {user.sublabel ? (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {user.sublabel}
                    {user.id ? ` · ${user.id.slice(0, 8)}…` : null}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
