import * as fs from 'fs';
import * as path from 'path';

/** Tên file export seed theo thứ tự ưu tiên (mới → cũ). */
export const SEED_EXPORT_BASENAMES = [
  'full-export-2026-06-10.json',
  'full-export-2026-05-14.json',
] as const;

export const IMPORT_REFERENCE_BASENAMES = [
  'import-reference-2026-06-10.json',
] as const;

/** Tìm monorepo root (thư mục có `pnpm-workspace.yaml`). */
export function findMonorepoRoot(startDir: string = __dirname): string {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 16; i += 1) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'Không tìm thấy monorepo root (pnpm-workspace.yaml). Chạy seed từ repo hub-parrent-template.',
  );
}

/** Đường dẫn dưới `{repo}/data/`. */
export function dataDir(...segments: string[]): string {
  return path.join(findMonorepoRoot(), 'data', ...segments);
}

export function seedExportPath(basename: string): string {
  return dataDir('seed', basename);
}

export type ResolveSeedExportOptions = {
  /** Đường dẫn tường minh (env hoặc argv) — ưu tiên cao nhất. */
  explicitPath?: string | null;
  /** Thư mục legacy cạnh `src/` (deprecated). */
  legacyDir?: string;
};

/**
 * Đường dẫn file import reference (admin /data verify).
 * Trả về path mặc định ngay cả khi file chưa tồn tại.
 */
export function resolveImportReferencePath(
  explicitRel?: string | null,
): string {
  const raw =
    explicitRel?.trim() ||
    process.env.SYSTEM_IMPORT_REFERENCE_FILE?.trim() ||
    `data/exports/${IMPORT_REFERENCE_BASENAMES[0]}`;

  if (path.isAbsolute(raw)) return raw;

  const normalized = raw.replace(/\\/g, '/').replace(/^data\//, '');
  const viaData = dataDir(...normalized.split('/'));
  if (fs.existsSync(viaData)) return viaData;

  const viaCwd = path.resolve(process.cwd(), raw);
  if (fs.existsSync(viaCwd)) return viaCwd;

  return viaData;
}

/**
 * Tìm file export seed: explicit → `data/seed/*` → legacy `src/`.
 */
export function resolveSeedExportPath(
  options: ResolveSeedExportOptions = {},
): string {
  const explicit = options.explicitPath?.trim();
  if (explicit) {
    const resolved = path.isAbsolute(explicit)
      ? explicit
      : path.resolve(process.cwd(), explicit);
    if (fs.existsSync(resolved)) return resolved;
    throw new Error(`Không tìm thấy file export: ${resolved}`);
  }

  for (const basename of SEED_EXPORT_BASENAMES) {
    const candidate = seedExportPath(basename);
    if (fs.existsSync(candidate)) return candidate;
  }

  if (options.legacyDir) {
    for (const basename of SEED_EXPORT_BASENAMES) {
      const legacy = path.join(options.legacyDir, basename);
      if (fs.existsSync(legacy)) {
        console.warn(
          `[data-paths] Dùng export legacy ${legacy} — chuyển sang data/seed/${basename}.`,
        );
        return legacy;
      }
    }
  }

  throw new Error(
    `Không tìm thấy file export seed. Đặt SEED_EXPORT_PATH hoặc copy export vào data/seed/ (${SEED_EXPORT_BASENAMES.join(', ')}).`,
  );
}
