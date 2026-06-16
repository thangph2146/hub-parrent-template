"use client"

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import {
  deriveFolderNavSearchState,
  diskPathToNavPath,
} from "../folder-domain"
import type { StorageRealm } from "../types"
import { filterStorageFoldersByQuery } from "../utils"
import { useStorageFolders } from "./use-storage-folders"

export const FOLDER_SEARCH_DEBOUNCE_MS = 300

export function useFolderNavSearch(
  realm: StorageRealm,
  foldersRefreshKey = 0
) {
  const searchInputId = useId()
  const listId = `${searchInputId}-results`
  const searchRootRef = useRef<HTMLDivElement>(null)
  const [folderQuery, setFolderQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const debouncedFolderQuery = useDebouncedValue(
    folderQuery,
    FOLDER_SEARCH_DEBOUNCE_MS
  )
  const { folders, loading: loadingFolders } =
    useStorageFolders(foldersRefreshKey)

  const searchState = deriveFolderNavSearchState(
    folderQuery,
    debouncedFolderQuery,
    searchOpen
  )

  const searchResults = useMemo(() => {
    if (!searchState.searchActive) return []
    return filterStorageFoldersByQuery(
      folders,
      debouncedFolderQuery,
      realm
    )
  }, [debouncedFolderQuery, folders, realm, searchState.searchActive])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchRootRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const clearSearch = () => {
    setFolderQuery("")
    setSearchOpen(false)
  }

  const openSearch = () => setSearchOpen(true)

  const onQueryChange = (value: string) => {
    setFolderQuery(value)
    setSearchOpen(true)
  }

  const pickSearchResult = (
    diskPath: string,
    onNavigate: (navPath: string) => void
  ) => {
    clearSearch()
    onNavigate(diskPathToNavPath(realm, diskPath))
  }

  const navigateAndClear = (navPath: string, onNavigate: (path: string) => void) => {
    clearSearch()
    onNavigate(navPath)
  }

  return {
    searchInputId,
    listId,
    searchRootRef,
    folderQuery,
    onQueryChange,
    openSearch,
    clearSearch,
    loadingFolders,
    searchResults,
    searchState,
    pickSearchResult,
    navigateAndClear,
  }
}
