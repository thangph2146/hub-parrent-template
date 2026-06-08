import type { ApiClient } from "../client";
import { normalizePagedResult, postData, unwrapApiEnvelope } from "./_shared";

export type StorageMediaKind =
	| "image"
	| "video"
	| "audio"
	| "document"
	| "archive"
	| "other";

/** Bốn dạng lưu trữ: images / files / videos / audio. */
export type StorageRealm = "images" | "files" | "videos" | "audio";

export interface StorageTab {
	id: string;
	label: string;
	count: number;
}

export interface ImageItem {
	fileName: string;
	originalName: string;
	size: number;
	mimeType: string;
	url: string;
	relativePath: string;
	createdAt: number;
	mediaKind: StorageMediaKind;
	storageTab: string;
	storageRealm: StorageRealm;
	/** ID người upload/chủ file — trích từ prefix tên file trên disk. */
	/** Người upload thực tế (bảng `storage_files`), không suy từ prefix tên file. */
	uploadOwnerId?: string | null;
	/** Họ tên hoặc email từ bảng users. */
	uploadOwnerName?: string | null;
}

export interface FolderItem {
	path: string;
	name: string;
	allowedExtensions?: string[];
	realm?: StorageRealm;
}

export interface ListImagesData {
	data: ImageItem[];
	folderTree: FolderItem | null;
	realms: StorageTab[];
	tabs: StorageTab[];
	/** Tab folder cấp 2 trong tab cha (vd. admincp/buh_slidehome). */
	subTabs: StorageTab[];
	/** Folder con trực tiếp tại folderPath (mọi cấp). */
	childFolders: StorageTab[];
	breadcrumb: Array<{ id: string; label: string }>;
	folderPath: string | null;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface ImportArchiveResult {
	restored: number;
	skipped: number;
	failed: number;
	totalEntries: number;
	skippedUnsupportedExt: number;
	skippedDuplicates: number;
	listedTotal: number;
	errors: string[];
}

export interface ExportArchiveMeta {
	fileCount: number;
	skipped: number;
}

export interface UploadsBulkDeleteResult {
	deleted: number;
	failed: number;
	errors: Array<{ path: string; message: string }>;
}

export interface CreateStorageFolderResult {
	folderName: string;
	folderPath: string;
}

export interface BulkMoveFilesResult {
	moved: number;
	skipped: number;
	renamed: number;
	errors: Array<{ from: string; to?: string; message: string }>;
}

export interface ReorganizeDateFoldersResult {
	dryRun: boolean;
	scopePath: string | null;
	candidates: number;
	moved: number;
	skipped: number;
	renamed: number;
	removedDirs: number;
	errors: Array<{ from: string; to?: string; message: string }>;
	preview: Array<{ from: string; to: string }>;
}

export class UploadsApi {
	constructor(private readonly http: ApiClient) {}

	async list(
		page: number,
		limit: number,
		options?: {
			realm?: StorageRealm;
			folderPath?: string;
			tab?: string;
			includeDescendants?: boolean;
			uploadOwnerId?: string;
		},
	): Promise<ListImagesData> {
		const query: Record<string, string> = {
			page: String(page),
			limit: String(limit),
		};
		if (options?.realm) query.realm = options.realm;
		const folderPath = options?.folderPath?.trim() || options?.tab?.trim();
		if (folderPath) query.folderPath = folderPath;
		if (options?.includeDescendants) query.includeDescendants = "true";
		if (options?.uploadOwnerId?.trim()) {
			query.uploadOwnerId = options.uploadOwnerId.trim();
		}
		const payload = await this.http.get<unknown>("/admin/uploads", { query });
		const body = unwrapApiEnvelope<ListImagesData>(payload);
		if (
			body !== null &&
			typeof body === "object" &&
			"data" in body &&
			Array.isArray((body as ListImagesData).data) &&
			"pagination" in body
		) {
			const typed = body as ListImagesData;
			return {
				data: typed.data,
				folderTree: typed.folderTree ?? null,
				realms: Array.isArray(typed.realms) ? typed.realms : [],
				tabs: Array.isArray(typed.tabs) ? typed.tabs : [],
				subTabs: Array.isArray(typed.subTabs) ? typed.subTabs : [],
				childFolders: Array.isArray(typed.childFolders)
					? typed.childFolders
					: [],
				breadcrumb: Array.isArray(typed.breadcrumb) ? typed.breadcrumb : [],
				folderPath: typed.folderPath ?? null,
				pagination: typed.pagination,
			};
		}
		const normalized = normalizePagedResult<ImageItem>(payload);
		return {
			data: normalized.items,
			folderTree: null,
			realms: [],
			tabs: [],
			subTabs: [],
			childFolders: [],
			breadcrumb: [],
			folderPath: null,
			pagination: {
				page: normalized.page ?? page,
				limit: normalized.limit ?? limit,
				total: normalized.total,
				totalPages: normalized.totalPages ?? 1,
			},
		};
	}

	async listFolders(): Promise<FolderItem[]> {
		const payload = await this.http.get<unknown>("/admin/uploads", {
			query: { listFolders: "true" },
		});
		const body = unwrapApiEnvelope<unknown>(payload);
		if (Array.isArray(body)) {
			return body as FolderItem[];
		}
		if (
			body &&
			typeof body === "object" &&
			Array.isArray((body as { data?: unknown }).data)
		) {
			return (body as { data: FolderItem[] }).data;
		}
		return [];
	}

	/** Tạo thư mục mới trong kho lưu trữ. */
	async createFolder(options: {
		folderName: string;
		parentPath?: string;
		resourceType?: "images" | "files" | "videos" | "audio";
		allowedExtensions?: string[];
	}): Promise<CreateStorageFolderResult> {
		const fd = new FormData();
		fd.append("action", "createFolder");
		fd.append("folderName", options.folderName.trim());
		if (options.parentPath?.trim()) {
			fd.append("parentPath", options.parentPath.trim());
		}
		if (
			options.resourceType === "files" ||
			options.resourceType === "videos" ||
			options.resourceType === "images"
		) {
			fd.append("resourceType", options.resourceType);
		}
		if (options.allowedExtensions?.length) {
			fd.append(
				"allowedExtensions",
				JSON.stringify(options.allowedExtensions),
			);
		}
		return postData<CreateStorageFolderResult>(
			this.http,
			"/admin/uploads",
			fd,
		);
	}

	async remove(path: string): Promise<void> {
		await this.http.delete<unknown>("/admin/uploads", {
			query: { path },
		});
	}

	async deleteFolder(path: string): Promise<void> {
		await this.http.delete<unknown>("/admin/uploads", {
			query: { path, deleteFolder: "true" },
		});
	}

	async bulkMoveFiles(
		paths: string[],
		destinationFolder: string,
	): Promise<BulkMoveFilesResult> {
		return postData<BulkMoveFilesResult>(
			this.http,
			"/admin/uploads/bulk-move",
			{ paths, destinationFolder },
			{ timeoutMs: 300_000 },
		);
	}

	/** Xóa hàng loạt — một request, server xử lý toàn bộ danh sách paths. */
	/** Gom file từ folder ngày/tháng/năm về folder chính. */
	async reorganizeDateFolders(options?: {
		scopePath?: string;
		dryRun?: boolean;
	}): Promise<ReorganizeDateFoldersResult> {
		return postData<ReorganizeDateFoldersResult>(
			this.http,
			"/admin/uploads/reorganize-date-folders",
			{
				scopePath: options?.scopePath?.trim() || undefined,
				dryRun: options?.dryRun === true,
			},
			{ timeoutMs: 600_000 },
		);
	}

	async bulkRemove(paths: string[]): Promise<UploadsBulkDeleteResult> {
		return postData<UploadsBulkDeleteResult>(
			this.http,
			"/admin/uploads/bulk-delete",
			{ paths },
			{ timeoutMs: 300_000 },
		);
	}

	async uploadFile(
		file: File,
		folderPathOrOptions?:
			| string
			| {
					folderPath?: string;
					isExistingFolder?: boolean;
					ownerUserId?: string;
			  },
	): Promise<{ url: string }> {
		const fd = new FormData();
		fd.append("file", file);
		let folderPath: string | undefined;
		let isExistingFolder: boolean | undefined;
		let ownerUserId: string | undefined;
		if (typeof folderPathOrOptions === "string") {
			folderPath = folderPathOrOptions;
		} else if (folderPathOrOptions) {
			folderPath = folderPathOrOptions.folderPath;
			isExistingFolder = folderPathOrOptions.isExistingFolder;
			ownerUserId = folderPathOrOptions.ownerUserId;
		}
		if (folderPath?.trim()) fd.append("folderPath", folderPath.trim());
		if (isExistingFolder) fd.append("isExistingFolder", "true");
		if (ownerUserId?.trim()) {
			fd.append("ownerUserId", ownerUserId.trim());
		}
		return postData<{ url: string }>(this.http, "/admin/uploads", fd);
	}

	/** Xuất ZIP toàn bộ kho lưu trữ (server quét disk). */
	async exportArchive(): Promise<{ blob: Blob; meta: ExportArchiveMeta }> {
		const { blob, headers } = await this.http.downloadBlob(
			"/admin/uploads/export",
			{ timeoutMs: 600_000 },
		);
		const fileCount = Number.parseInt(
			headers.get("X-Export-File-Count") ?? "0",
			10,
		);
		const skipped = Number.parseInt(headers.get("X-Export-Skipped") ?? "0", 10);
		return {
			blob,
			meta: {
				fileCount: Number.isFinite(fileCount) ? fileCount : 0,
				skipped: Number.isFinite(skipped) ? skipped : 0,
			},
		};
	}

	/** Khôi phục kho lưu trữ từ file ZIP (export trước đó). */
	async importArchive(
		file: File,
		options?: { overwrite?: boolean },
	): Promise<ImportArchiveResult> {
		const fd = new FormData();
		fd.append("file", file);
		if (options?.overwrite) fd.append("overwrite", "true");
		return postData<ImportArchiveResult>(
			this.http,
			"/admin/uploads/import",
			fd,
			{ timeoutMs: 600_000 },
		);
	}
}
