import { api } from "./api"
import type { ListImagesData, ImageItem } from "@workspace/api-client"

export type { ListImagesData, ImageItem }

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
