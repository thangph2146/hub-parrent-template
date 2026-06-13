/**
 * Gộp *-admin.service.ts vào *.service.ts (uploads, system).
 * Usage: node script-system/api/merge-binding-service-files.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')

const SYSTEM_TYPES = `import type {
  DatabaseSchemaResponse,
  ImportConfigResponse,
} from './system.types';

export interface ExportDataResult {
  modelOrder: string[];
  data: Record<string, unknown[]>;
  exportedAt: string;
}

export interface ImportDataResult {
  affected: number;
  message: string;
  errors?: string[];
}

`

function mergeSystem() {
  const dir = path.join(ROOT, 'packages/api-server/src/modules/system')
  const adminPath = path.join(dir, 'system-admin.service.ts')
  const outPath = path.join(dir, 'system.service.ts')
  if (!fs.existsSync(adminPath)) {
    console.log('[merge-binding] skip system: no system-admin.service.ts')
    return
  }
  const admin = fs.readFileSync(adminPath, 'utf8')
  fs.writeFileSync(outPath, `${SYSTEM_TYPES}\n${admin}`, 'utf8')
  fs.unlinkSync(adminPath)
  console.log('[merge-binding] system.service.ts ← system-admin.service.ts')
}

function mergeUploads() {
  const dir = path.join(ROOT, 'packages/api-server/src/modules/uploads')
  const adminPath = path.join(dir, 'uploads-admin.service.ts')
  const servicePath = path.join(dir, 'uploads.service.ts')
  const diskPath = path.join(dir, 'uploads-disk.service.ts')
  if (!fs.existsSync(adminPath)) {
    console.log('[merge-binding] skip uploads: no uploads-admin.service.ts')
    return
  }
  const service = fs.readFileSync(servicePath, 'utf8')
  const reExportIdx = service.indexOf('\nexport {\n  BaseUploadsService,')
  const diskBlock =
    reExportIdx > 0
      ? service.slice(0, reExportIdx).trimEnd()
      : service.trimEnd()
  const diskBanner = `/**
 * Disk-only uploads helper — unit test filesystem (không EM).
 * Production dùng \`BaseUploadsService\` trong uploads.service.ts.
 */
`
  fs.writeFileSync(diskPath, `${diskBanner}${diskBlock.replace(/^\/\*\*[\s\S]*?\*\/\n/, '')}\n`, 'utf8')

  const admin = fs.readFileSync(adminPath, 'utf8')
  fs.writeFileSync(servicePath, admin, 'utf8')
  fs.unlinkSync(adminPath)
  console.log('[merge-binding] uploads.service.ts ← uploads-admin.service.ts')
  console.log('[merge-binding] uploads-disk.service.ts (BaseUploadsDiskService)')
}

mergeSystem()
mergeUploads()
console.log('[merge-binding] done')
