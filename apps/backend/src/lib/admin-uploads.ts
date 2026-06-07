import { api } from "./api"
import type {
	ImportArchiveResult,
	ListImagesData,
	ImageItem,
} from "@workspace/api-client"
import { fetchAllAdminList } from "./fetch-all-admin-list"

export type { ListImagesData, ImageItem, ImportArchiveResult }

export type FileStorageListType = "images" | "files"

export async function fetchImages(
	page: number,
	limit: number,
	type?: 'images' | 'files',
): Promise<ListImagesData> {
	return api.uploads.list(page, limit, type)
}

export async function deleteUploadedFile(
	relativePath: string,
): Promise<void> {
	await api.uploads.remove(relativePath)
}

/** Lấy toàn bộ file trong tab (images / files), không chỉ trang hiện tại. */
export async function fetchAllFileStorageRows(
	type: FileStorageListType,
): Promise<ImageItem[]> {
	return fetchAllAdminList(async ({ page, limit }) => {
		const data = await fetchImages(page, limit, type)
		return { items: data.data, total: data.pagination.total }
	})
}

/**
 * Lấy toàn bộ file trong kho lưu trữ (images/, files/, thư mục legacy).
 * Giữ nguyên relativePath như trên disk — dùng khi nén ZIP theo cấu trúc thư mục.
 */
export async function fetchAllStoredFileStorageRows(): Promise<ImageItem[]> {
	return fetchAllAdminList(async ({ page, limit }) => {
		const data = await fetchImages(page, limit)
		return { items: data.data, total: data.pagination.total }
	})
}

/** Khôi phục kho lưu trữ từ file ZIP backup. */
export async function importFileStorageArchive(
	file: File,
	options?: { overwrite?: boolean },
): Promise<ImportArchiveResult> {
	return api.uploads.importArchive(file, options)
}
