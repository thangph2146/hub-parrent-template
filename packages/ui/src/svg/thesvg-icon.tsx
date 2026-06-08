"use client"

import { forwardRef, useId, useMemo } from "react"
import type { SVGProps } from "react"

export type TheSvgIconModule = {
  title: string
  svg: string
}

function namespaceSvgIds(svg: string, prefix: string): string {
  const ids = new Set<string>()
  const idRegex = /\bid="([^"]+)"/g
  let match: RegExpExecArray | null = idRegex.exec(svg)
  while (match) {
    const id = match[1]
    if (id) ids.add(id)
    match = idRegex.exec(svg)
  }

  let result = svg
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const namespaced = `${prefix}-${id}`
    result = result
      .replace(new RegExp(`id="${escaped}"`, "g"), `id="${namespaced}"`)
      .replace(new RegExp(`url\\(#${escaped}\\)`, "g"), `url(#${namespaced})`)
      .replace(new RegExp(`href="#${escaped}"`, "g"), `href="#${namespaced}"`)
  }
  return result
}

function parseSvgMarkup(svg: string, idPrefix: string) {
  const namespaced = namespaceSvgIds(svg, idPrefix)
  const viewBox = namespaced.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24"
  const innerHtml =
    namespaced.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)?.[1] ?? namespaced
  return { viewBox, innerHtml }
}

export function createTheSvgIcon(icon: TheSvgIconModule) {
  const TheSvgIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
    function TheSvgIcon({ className, ...props }, ref) {
      const uid = useId().replace(/:/g, "")
      const { viewBox, innerHtml } = useMemo(
        () => parseSvgMarkup(icon.svg, uid),
        [uid]
      )

      return (
        <svg
          ref={ref}
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label={icon.title}
          {...props}
          dangerouslySetInnerHTML={{ __html: innerHtml }}
        />
      )
    }
  )

  TheSvgIcon.displayName = `${icon.title.replace(/\s+/g, "")}Icon`
  return TheSvgIcon
}
