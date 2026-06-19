/**
 * Profile .env.example cho từng API deploy line — nguồn sự thật (không copy từ main/api).
 *
 * @see docs/env/README.md · script-system/lib/layout/storage-layout.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { ROOT } = require("../lib/monorepo-root.cjs");
const { allEnvApps, envAppsForCurrentRepo } = require("./manifest.cjs");

/** @typedef {{
 *   template: string;
 *   envStack: string;
 *   title: string;
 *   appPath: string;
 *   package: string;
 *   devHint: string;
 *   stackHint: string;
 *   database: string;
 *   serviceName: string;
 *   storageDir: string;
 *   allowedOrigins: string;
 *   bootstrapHint?: string;
 * }} ApiEnvProfile */

/** @type {Record<string, ApiEnvProfile>} */
const API_ENV_PROFILES = {
  "api-main": {
    template: "api-main",
    envStack: "main",
    title: "API (@api) — apps/main/api",
    appPath: "apps/main/api",
    package: "@api",
    devHint: "pnpm --filter @api dev",
    stackHint: "Source of truth — dev API + admin @backend :3001",
    database: "hub_parent",
    serviceName: "HUB API — Source of truth (main)",
    storageDir: "D:/HUB/data/main",
    allowedOrigins:
      "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
  },
  "api-hub-parent": {
    template: "api-hub-parent",
    envStack: "parent",
    title: "API (@hub-parent/api) — apps/hub-parent/api",
    appPath: "apps/hub-parent/api",
    package: "@hub-parent/api",
    devHint: "pnpm dev:parent",
    stackHint: "ecosystem/main — API :3002 + admin :3001 + storefront :3000",
    database: "hub_parent",
    serviceName: "HUB API — Site chính (hub-parent)",
    storageDir: "D:/HUB/data/hub-parent",
    allowedOrigins:
      "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
  },
  "api-hub-checkin": {
    template: "api-hub-checkin",
    envStack: "checkin",
    title: "API hub-checkin — apps/hub-checkin/api",
    appPath: "apps/hub-checkin/api",
    package: "@hub-checkin/api",
    devHint: "pnpm dev:checkin",
    stackHint:
      "ecosystem/checkin — API :3002 + hub-checkin frontend :3000 (admin /admin)",
    database: "hub_checkin",
    serviceName: "HUB API — Check-in sự kiện (hub-checkin)",
    storageDir: "D:/HUB/data/hub-checkin",
    allowedOrigins: "http://localhost:3000,http://127.0.0.1:3000",
    bootstrapHint: "pnpm db:bootstrap:checkin",
  },
  "api-store-sync": {
    template: "api-store-sync",
    envStack: "store",
    title: "API (@store-sync/api) — apps/store-sync/api",
    appPath: "apps/store-sync/api",
    package: "@store-sync/api",
    devHint: "pnpm dev:store",
    stackHint: "ecosystem/store — API :3002 + @store-sync-frontend :3000",
    database: "hub_store",
    serviceName: "HUB API — Store sync",
    storageDir: "D:/HUB/data/store-sync",
    allowedOrigins: "http://localhost:3000,http://127.0.0.1:3000",
    bootstrapHint: "pnpm db:bootstrap:store",
  },
};

/** @param {ApiEnvProfile} p */
function buildApiEnvExampleContent(p) {
  const initHint =
    p.envStack === "main"
      ? "cp .env.example .env"
      : `pnpm env:init ${p.envStack}`;
  const extra = p.bootstrapHint ? `# DB mới:  ${p.bootstrapHint}\n` : "";

  return `# ENV_TEMPLATE=${p.template}
# ENV_STACK=${p.envStack}
# ==============================================================================
# ${p.title}
# ==============================================================================
# Copy:  ${initHint}
# Doc:   docs/env/README.md
# Dev:   ${p.devHint}
# Stack: ${p.stackHint}
${extra}# ==============================================================================

NODE_ENV=development

# ------------------------------------------------------------------------------
# Database (bắt buộc) — schema: ${p.database}
# ------------------------------------------------------------------------------

DATABASE_URL=mysql://root@localhost:3306/${p.database}
# DB_CLIENT=mysql

# PostgreSQL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${p.database}
# DB_CLIENT=postgresql

# Tắt log SQL khi dev
# DB_DEBUG=false

# ------------------------------------------------------------------------------
# Application
# ------------------------------------------------------------------------------

PORT=3002
SERVICE_NAME=${p.serviceName}

# API_PUBLIC_URL=https://hub.example.com/api
HTTP_JSON_BODY_LIMIT=1gb

# ------------------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------------------

ALLOWED_ORIGINS=${p.allowedOrigins}

# ------------------------------------------------------------------------------
# Auth & bảo vệ admin
# ------------------------------------------------------------------------------

# JWT_SECRET=your-jwt-secret-change-me
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
PROTECTED_ADMIN_EMAILS=superadmin@hub.edu.vn

# ------------------------------------------------------------------------------
# Storage
# ------------------------------------------------------------------------------

STORAGE_DIR=${p.storageDir}

# ------------------------------------------------------------------------------
# API học tập bên ngoài (proxy /api/hub/students/...)
# ------------------------------------------------------------------------------

EXTERNAL_API_URL=http://localhost:5000
# EXTERNAL_API_TOKEN=your-token

# ------------------------------------------------------------------------------
# Sao lưu / import (admin /data)
# ------------------------------------------------------------------------------

# BACKUP_IMPORT_SECRET=
# SYSTEM_IMPORT_REFERENCE_FILE=data/exports/import-reference-2026-06-10.json
# IMPORT_FALLBACK_PASSWORD_PLAIN=ImportFallback#2026
# SEED_EXPORT_PATH=data/seed/full-export-2026-06-10.json

# ------------------------------------------------------------------------------
# Demo check-in (pnpm db:demo:checkin trên API hub-checkin)
# ------------------------------------------------------------------------------

# CHECKIN_DEMO_POSTS_EXPORT=data/seed/full-export-2026-06-10.json
CHECKIN_DEMO_EVENT_COUNT=15
CHECKIN_DEMO_SEED=hub-checkin-demo
${buildHanetEnvBlock(p)}
`;
}

/** Khối env HANET — OAuth + webhook push data (main + checkin). */
function buildHanetEnvBlock(p) {
  if (p.envStack !== "checkin" && p.envStack !== "main") return "";

  const stackNote =
    p.envStack === "main"
      ? "# Stack dev:main:checkin cũng dùng @api (main) — copy block này sang apps/main/api/.env"
      : "# Stack deploy: pnpm dev:checkin · PM2 ecosystem.checkin";

  return `
# ------------------------------------------------------------------------------
# HANET — camera AI, OAuth, webhook push (https://developers.hanet.ai)
# ------------------------------------------------------------------------------
# Credential: developers.hanet.ai → Apps → Client ID / Client secret / tokens
# Admin: Sự kiện → Cấu hình HANET → Test OAuth
# API: GET /api/admin/hanet/status?eventId={id}
#      POST /api/admin/hanet/test-connection
#      GET /api/public/hanet/webhook/info?eventId={id}
${stackNote}
#
# Webhook URL đăng ký trên portal HANET:
#   Dev:  http://localhost:3002/api/public/hanet/webhook
#         http://localhost:3002/api/public/hanet/webhook/{eventId}
#   Prod: {API_PUBLIC_URL}/api/public/hanet/webhook/{eventId}
#
# Tài liệu:
#   API:     https://documenter.getpostman.com/view/13088306/TVeqcn2C
#   Webhook: https://documenter.getpostman.com/view/13088306/TVmFmMEx

HANET_CLIENT_ID=
HANET_CLIENT_SECRET=
HANET_ACCESS_TOKEN=
HANET_REFRESH_TOKEN=
HANET_API_BASE_URL=https://partner.hanet.ai
HANET_OAUTH_URL=https://oauth.hanet.com/token
HANET_WEBHOOK_VERIFY=true
# Bắt buộc hash MD5(client_secret + id) — nên bật production:
# HANET_WEBHOOK_VERIFY_REQUIRED=true
# keycode tùy chọn trong payload webhook (OAuth app):
# HANET_WEBHOOK_KEYCODE=
# placeID mặc định khi gọi partner API (getPlaces, register, checkin):
# HANET_DEFAULT_PLACE_ID=
# Tự động registerByUrl khi SV lưu avatar / đăng ký sự kiện (mặc định bật):
# HANET_AUTO_REGISTER_FACE=true
`;
}

/** Thay tên schema trong connection URL (giữ user/host/port). */
function setDatabaseInConnectionUrl(urlValue, newDb) {
  const trimmed = urlValue.trim().split(/\s+#/)[0]
  const m = trimmed.match(/^(mysql|postgresql):\/\/(.+?)\/([^/?\s#]+)/)
  if (!m) return trimmed
  return `${m[1]}://${m[2]}/${newDb}`
}

/**
 * Cập nhật .env hiện có theo profile — giữ secret (JWT, Google, …).
 * @param {string} content
 * @param {ApiEnvProfile} profile
 */
function patchEnvContentFromProfile(content, profile) {
  /** @type {string[]} */
  const patchedKeys = []
  const scalarKeys = {
    SERVICE_NAME: profile.serviceName,
    STORAGE_DIR: profile.storageDir,
    ALLOWED_ORIGINS: profile.allowedOrigins,
  }

  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')
  const next = lines.map((line) => {
    const row = line.replace(/\r$/, '')

    if (/^#\s*ENV_TEMPLATE=/.test(row)) {
      patchedKeys.push('ENV_TEMPLATE')
      return `# ENV_TEMPLATE=${profile.template}`
    }
    if (/^#\s*ENV_STACK=/.test(row)) {
      patchedKeys.push('ENV_STACK')
      return `# ENV_STACK=${profile.envStack}`
    }

    const dbLine = row.match(/^(\s*(?:#\s*)?)(DATABASE_URL=)(.+)$/)
    if (dbLine) {
      const valuePart = dbLine[3].trim()
      const urlOnly = valuePart.split(/\s+#/)[0]
      if (urlOnly.startsWith('mysql://') || urlOnly.startsWith('postgresql://')) {
        patchedKeys.push('DATABASE_URL')
        const newUrl = setDatabaseInConnectionUrl(urlOnly, profile.database)
        const inlineComment = valuePart.includes('#')
          ? ` ${valuePart.slice(valuePart.indexOf('#'))}`
          : ''
        return `${dbLine[1]}${dbLine[2]}${newUrl}${inlineComment}`
      }
    }

    for (const [key, value] of Object.entries(scalarKeys)) {
      const m = row.match(new RegExp(`^(\\s*)${key}=`))
      if (m && !row.trimStart().startsWith('#')) {
        patchedKeys.push(key)
        return `${m[1]}${key}=${value}`
      }
    }

    return row
  })

  return {
    content: next.join('\n'),
    patchedKeys: [...new Set(patchedKeys)],
  }
}

/**
 * Áp profile vào .env — tạo mới nếu thiếu; patch DATABASE_URL + field stack nếu đã có.
 * @param {string} appPathRel
 * @param {{ createIfMissing?: boolean, force?: boolean }} [options]
 */
function applyApiEnvProfileToDotEnv(appPathRel, options = {}) {
  const createIfMissing = options.createIfMissing ?? true
  const force = options.force ?? false
  const profile = getApiEnvProfileForAppPath(appPathRel)
  if (!profile) {
    return { skipped: true, reason: 'no-profile' }
  }

  const appRoot = path.join(ROOT, profile.appPath)
  const example = path.join(appRoot, '.env.example')
  const dest = path.join(appRoot, '.env')

  if (!fs.existsSync(example)) {
    return { skipped: true, reason: 'no-example' }
  }

  if (force) {
    const existed = fs.existsSync(dest)
    fs.copyFileSync(example, dest)
    return {
      created: !existed,
      overwritten: existed,
      via: 'force',
      database: profile.database,
    }
  }

  if (!fs.existsSync(dest)) {
    if (!createIfMissing) {
      return { skipped: true, reason: 'missing-dotenv' }
    }
    fs.copyFileSync(example, dest)
    return { created: true, via: 'copy', database: profile.database }
  }

  const raw = fs.readFileSync(dest, 'utf8')
  const rawNorm = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const { content, patchedKeys } = patchEnvContentFromProfile(rawNorm, profile)
  if (content !== rawNorm) {
    fs.writeFileSync(dest, content, 'utf8')
    return {
      patched: true,
      patchedKeys,
      database: profile.database,
      via: 'patch',
    }
  }

  return { patched: false, database: profile.database, via: 'unchanged' }
}

/** @param {string} appPathRel */
function getApiEnvProfileForAppPath(appPathRel) {
  const normalized = appPathRel.replace(/\\/g, "/");
  for (const app of allEnvApps()) {
    if (app.path === normalized && app.template.startsWith("api-")) {
      return API_ENV_PROFILES[app.template] ?? null;
    }
  }
  return API_ENV_PROFILES[
    allEnvApps().find((a) => a.path === normalized)?.template ?? ""
  ];
}

/** @param {string} appPathRel */
function writeApiEnvExampleForAppPath(appPathRel) {
  const profile = getApiEnvProfileForAppPath(appPathRel);
  if (!profile) {
    console.warn(
      `[env:api-profile] bỏ qua — không có profile API: ${appPathRel}`,
    );
    return false;
  }
  const dest = path.join(ROOT, profile.appPath, ".env.example");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buildApiEnvExampleContent(profile), "utf8");
  return true;
}

/** Ghi lại .env.example cho mọi API trong manifest. */
function writeAllApiEnvExamples() {
  let count = 0;
  for (const app of envAppsForCurrentRepo()) {
    if (!app.template.startsWith("api-")) continue;
    if (writeApiEnvExampleForAppPath(app.path)) count += 1;
  }
  console.log(`[env:sync-api-examples] đã ghi ${count} file .env.example API`);
}

module.exports = {
  API_ENV_PROFILES,
  buildApiEnvExampleContent,
  getApiEnvProfileForAppPath,
  writeApiEnvExampleForAppPath,
  writeAllApiEnvExamples,
  setDatabaseInConnectionUrl,
  patchEnvContentFromProfile,
  applyApiEnvProfileToDotEnv,
};

if (require.main === module) {
  writeAllApiEnvExamples();
}
