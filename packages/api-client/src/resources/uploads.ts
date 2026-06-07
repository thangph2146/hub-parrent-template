import type { ApiClient } from "../client";
import { normalizePagedResult, postData } from "./_shared";

export interface ImageItem {
	fileName: string;
	originalName: string;
	size: number;
	mimeType: string;
	url: string;
	relativePath: string;
	createdAt: number;
}

export interface FolderItem {
	path: string;
	name: string;
}

export interface ListImagesData {
	data: ImageItem[];
	folderTree: FolderItem | null;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export class UploadsApi {
	constructor(private readonly http: ApiClient) {}

	async list(
		page: number,
		limit: number,
		type?: 'images' | 'files',
	): Promise<ListImagesData> {
		const query: Record<string, string> = { page: String(page), limit: String(limit) };
		if (type) query.type = type;
		const payload = await this.http.get<unknown>("/admin/uploads", { query });
		const unwrapped =
			payload !== null &&
			typeof payload === "object" &&
			"data" in payload &&
			"pagination" in payload
				? payload
				: null;
		if (!unwrapped) {
			const normalized = normalizePagedResult<unknown>(payload);
			return {
				data: normalized.items as ImageItem[],
				folderTree: null,
				pagination: {
					page: normalized.page ?? page,
					limit: normalized.limit ?? limit,
					total: normalized.total,
					totalPages: normalized.totalPages ?? 1,
				},
			};
		}
		return unwrapped as unknown as ListImagesData;
	}

	async listFolders(): Promise<FolderItem[]> {
		const payload = await this.http.get<unknown>("/admin/uploads", {
			query: { listFolders: "true" },
		});
		if (Array.isArray(payload)) return payload as FolderItem[];
		return [];
	}

	async remove(path: string): Promise<void> {
		await this.http.delete<unknown>("/admin/uploads", {
			query: { path },
		});
	}

	async uploadFile(
		file: File,
		folderPathOrOptions?:
			| string
			| { folderPath?: string; isExistingFolder?: boolean },
	): Promise<{ url: string }> {
		const fd = new FormData();
		fd.append("file", file);
		let folderPath: string | undefined;
		let isExistingFolder: boolean | undefined;
		if (typeof folderPathOrOptions === "string") {
			folderPath = folderPathOrOptions;
		} else if (folderPathOrOptions) {
			folderPath = folderPathOrOptions.folderPath;
			isExistingFolder = folderPathOrOptions.isExistingFolder;
		}
		if (folderPath?.trim()) fd.append("folderPath", folderPath.trim());
		if (isExistingFolder) fd.append("isExistingFolder", "true");
		return postData<{ url: string }>(this.http, "/admin/uploads", fd);
	}
}
