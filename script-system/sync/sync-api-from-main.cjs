/**
 * Đồng bộ source API từ apps/main/api → product line API (kế thừa).
 *
 * Usage:
 *   node script-system/sync-api-from-main.cjs hub-event
 *   node script-system/sync-api-from-main.cjs all
 *
 * Profile (tùy chọn): apps/<line>/api/api.sync-profile.json
 *   - mode: "exclude" | "include" | "app-config" (mặc định: copy toàn bộ như cũ)
 *   - app-config: tự lấy module/entity cần thiết từ api.app.config.json + graph closure
 *   - excludeDirs / includeDirs: đường dẫn tương đối API đích, vd "src/products"
 *   - includeFiles: file riêng lẻ khi mode include/app-config, vd "src/entities/user.entity.ts"
 *   - keepFiles: không ghi đè (vd src/app.module.ts)
 *   - prune: true → xóa thư mục/file ở đích không còn trong profile sau sync
 *
 * Legacy: api.sync-keep.json (mảng path) được merge vào keepFiles.
 */
const fs = require("node:fs");
const path = require("node:path");

const { ROOT } = require("../lib/monorepo-root.cjs");
const { PRODUCT_LINES, API_INHERITS_FROM_MAIN, MAIN_API_PATH } = require("../lib/monorepo-apps.cjs");
const { resolveApiModules } = require("../../packages/api-server/deploy/config/render.config.cjs");
const { listTemplateModuleIds } = require("../../packages/api-server/deploy/config/template.config.cjs");
const { resolveModuleClosure } = require("../../packages/api-server/deploy/cli/lib/render/resolve-module-closure.cjs");
const {
  RENDER_BOOTSTRAP_MODULES,
  patchRenderAppModule,
} = require("../../packages/api-server/deploy/cli/lib/render/patch-render-app-module.cjs");
const { resolveEntityClosureForModules } = require("../../packages/api-server/deploy/cli/lib/graph/resolve-entity-closure.cjs");
const { patchOrmEntities } = require("../../packages/api-server/deploy/cli/lib/prune/prune-entities-runtime.cjs");
const FALLBACK_TEMPLATE_API_PATH = "packages/api-server/deploy/nest";
const MAIN_SRC = path.join(ROOT, MAIN_API_PATH);
const FALLBACK_SRC = path.join(ROOT, FALLBACK_TEMPLATE_API_PATH);
const SOURCE_API_PATH = fs.existsSync(MAIN_SRC) ? MAIN_API_PATH : FALLBACK_TEMPLATE_API_PATH;
const SRC = path.join(ROOT, SOURCE_API_PATH);

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".cache",
  ".graphify",
  "coverage",
]);

const SKIP_FILES = new Set([".env", ".env.local", "api.sync-keep.json"]);

/** Script một lần — chỉ giữ trên apps/main/api/scripts/archive, không copy sang line kế thừa. */
const INHERITED_API_EXCLUDE_FILES = [
  "scripts/archive/migrate-entity-ids.mjs",
  "scripts/archive/migrate-entity-ids-queries.mjs",
  "scripts/archive/fix-entity-id-imports.mjs",
];

/** Mỗi product line có ENV_TEMPLATE/ENV_STACK riêng — không ghi đè từ main. */
const INHERITED_API_KEEP_FILES = [".env.example"];

const APP_CONFIG_ROOT_FILES = [
  "package.json",
  "nest-cli.json",
  "tsconfig.json",
  "tsconfig.build.json",
  "tsconfig.test.json",
  "eslint.config.mjs",
  "mikro-orm.config.ts",
  ".env.example",
  ".gitignore",
  ".prettierrc",
];

const APP_CONFIG_SHELL_DIRS = [
  "src/common",
  "src/config",
  "src/mikro-orm",
  "src/migrations",
  "src/seeders",
  "src/seeds",
];

const APP_CONFIG_SHELL_FILES = [
  "src/main.ts",
  "src/app.module.ts",
  "src/seed-superadmin.ts",
  "src/seed-demo.ts",
  "src/seed-guides.ts",
  "src/seed-checkin-demo.ts",
];

const MODULE_SCOPED_FILES = {
  "src/seed-demo.ts": ["events"],
  "src/seed-full-export.ts": ["groups", "messages"],
  "src/seed-guides.ts": ["page-contents"],
  "src/seeds/checkin-demo.runner.ts": ["events", "event-registrations"],
  "src/seeds/orders-sample.runner.ts": ["orders", "products"],
  "src/seeds/products-sample.runner.ts": ["products"],
  "src/seeds/promo-codes-sample.runner.ts": ["promo-codes"],
  "src/seeds/storesync-sample.data.ts": ["orders", "products"],
  "src/common/student-user-binding.ts": ["students"],
  "src/common/commerce/index.ts": ["products"],
  "src/common/commerce/gift-rules.ts": ["products"],
  "src/common/commerce/product-units.ts": ["products"],
  "src/common/commerce/promo-checkout.ts": ["promo-codes"],
  "src/common/gift-rules.ts": ["products"],
  "src/common/product-units.ts": ["products"],
  "src/common/promo-checkout.ts": ["promo-codes"],
};

const PERMISSION_RESOURCE_BY_MODULE = {
  "academic-years": "academic_years",
  "admission-results": "admission_results",
  accounts: "accounts",
  cameras: "cameras",
  categories: "categories",
  comments: "comments",
  "contact-requests": "contact_requests",
  courses: "courses",
  dashboard: "dashboard",
  departments: "departments",
  "event-checkins": "event_checkins",
  "event-checkouts": "event_checkouts",
  "event-registrations": "event_registrations",
  "event-speakers": "event_speakers",
  events: "events",
  "face-data": "face_data",
  groups: "groups",
  "imported-users": "imported_users",
  locations: "locations",
  majors: "majors",
  messages: "messages",
  notifications: "notifications",
  orders: "orders",
  "page-contents": "page_contents",
  "parent-students": "parent_students",
  posts: "posts",
  products: "products",
  "promo-codes": "promo_codes",
  roles: "roles",
  screens: "screens",
  "seo-metas": "seo_metas",
  sessions: "sessions",
  settings: "settings",
  speakers: "speakers",
  students: "students",
  system: "system",
  tags: "tags",
  templates: "templates",
  "training-levels": "training_levels",
  "training-systems": "training_systems",
  uploads: "uploads",
  users: "users",
};

function norm(rel) {
  return rel.replace(/\\/g, "/");
}

function ensureArray(value) {
  if (value instanceof Set) return [...value];
  return Array.isArray(value) ? value : [];
}

function mergeUnique(left, right) {
  return [...new Set([...ensureArray(left), ...ensureArray(right)].map(norm))];
}

function resolveAppConfigIncludeProfile(productKey, targetApiPath, profile) {
  const entry = PRODUCT_LINES[productKey]?.api;
  const configPath = path.join(targetApiPath, "api.app.config.json");
  if (!entry || !fs.existsSync(configPath)) {
    console.warn(
      `[sync-api] ${entry?.path ?? productKey}: thiếu api.app.config.json — fallback full`,
    );
    return { ...profile, mode: "full" };
  }

  const appRel = norm(entry.path);
  const templateRoot = SRC;
  const resolved = resolveApiModules(appRel);
  const excludedModules = new Set(resolved.config?.excludeModules ?? []);
  const excludedEntities = new Set(resolved.config?.excludeEntities ?? []);
  const bootstrapModules = RENDER_BOOTSTRAP_MODULES.filter((id) => !excludedModules.has(id));
  const seedModules = [...new Set([...bootstrapModules, ...resolved.modules])];
  const moduleIds = (
    resolved.renderAllModules
      ? listTemplateModuleIds(templateRoot)
      : resolveModuleClosure(seedModules, templateRoot)
  ).filter((id) => !excludedModules.has(id));

  let entityClosure = null;
  let entityFiles = [];
  if (!resolved.renderAllModules) {
    try {
      entityClosure = resolveEntityClosureForModules(moduleIds, {
        expandModuleClosure: false,
      });
      if (excludedEntities.size) {
        entityClosure = {
          ...entityClosure,
          classes: entityClosure.classes.filter((name) => !excludedEntities.has(name)),
          files: entityClosure.files.filter((name) => {
            const className = Object.entries(entityClosure.graph.entities).find(
              ([, entity]) => entity.fileName === name,
            )?.[0];
            return !className || !excludedEntities.has(className);
          }),
        };
      }
      entityFiles = entityClosure.files.map((name) => `src/entities/${name}`);
    } catch (error) {
      console.warn(
        `[sync-api] entity graph unavailable (${error.message}) — copy full src/entities`,
      );
    }
  }

  const includeDirs = mergeUnique(profile.includeDirs, [
    ...APP_CONFIG_SHELL_DIRS,
    ...((resolved.renderAllModules || entityFiles.length === 0) ? ["src/entities"] : []),
    ...moduleIds.map((id) => `src/${id}`),
  ]);
  const includeFiles = mergeUnique(profile.includeFiles, [
    ...APP_CONFIG_ROOT_FILES,
    ...APP_CONFIG_SHELL_FILES,
    ...(resolved.renderAllModules ? [] : ["src/entities/base.entity.ts", ...entityFiles]),
  ]);
  const moduleSet = new Set(moduleIds);
  const excludeFiles = new Set(ensureArray(profile.excludeFiles).map(norm));
  for (const [rel, deps] of Object.entries(MODULE_SCOPED_FILES)) {
    if (!deps.every((moduleId) => moduleSet.has(moduleId))) {
      excludeFiles.add(rel);
    }
  }

  console.log(
    `[sync-api] app-config profile: ${moduleIds.length} module · ${resolved.renderAllModules ? "full" : entityFiles.length || "full"} entity file`,
  );

  return {
    ...profile,
    mode: "include",
    prune: profile.prune ?? true,
    includeDirs,
    includeFiles,
    excludeFiles,
    appConfig: {
      appRel,
      moduleIds,
      renderAllModules: resolved.renderAllModules,
      excludeModules: [...excludedModules],
      excludeEntities: [...excludedEntities],
      entityFiles: entityClosure?.files ?? null,
      entityClasses: entityClosure?.classes ?? null,
    },
  };
}

function loadProfile(productKey, targetApiPath) {
  const profilePath = path.join(targetApiPath, "api.sync-profile.json");
  const keepLegacyPath = path.join(targetApiPath, "api.sync-keep.json");

  /** @type {{ mode?: string, includeDirs?: string[], includeFiles?: string[], excludeDirs?: string[], keepFiles?: string[], prune?: boolean }} */
  let profile = { keepFiles: ["src/app.module.ts"] };

  if (fs.existsSync(profilePath)) {
    try {
      Object.assign(profile, JSON.parse(fs.readFileSync(profilePath, "utf8")));
    } catch (e) {
      console.warn(`[sync-api] Invalid api.sync-profile.json: ${e.message}`);
    }
  }

  if (fs.existsSync(keepLegacyPath)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(keepLegacyPath, "utf8"));
      if (Array.isArray(legacy)) {
        profile.keepFiles = [...new Set([...(profile.keepFiles ?? []), ...legacy])];
      }
    } catch {
      /* ignore */
    }
  }

  profile.keepFiles = new Set(ensureArray(profile.keepFiles).map(norm));
  profile.includeDirs = (profile.includeDirs ?? []).map(norm);
  profile.includeFiles = (profile.includeFiles ?? []).map(norm);
  profile.excludeDirs = (profile.excludeDirs ?? []).map(norm);
  profile.excludeFiles = new Set((profile.excludeFiles ?? []).map(norm));

  if (["app-config", "api-app-config", "graph"].includes(profile.mode)) {
    profile = resolveAppConfigIncludeProfile(productKey, targetApiPath, profile);
    profile.keepFiles = new Set(ensureArray(profile.keepFiles).map(norm));
    profile.includeDirs = (profile.includeDirs ?? []).map(norm);
    profile.includeFiles = (profile.includeFiles ?? []).map(norm);
    profile.excludeDirs = (profile.excludeDirs ?? []).map(norm);
    profile.excludeFiles = new Set(ensureArray(profile.excludeFiles).map(norm));
  }
  profile.includeFiles = new Set(profile.includeFiles ?? []);

  return profile;
}

function isUnderPrefix(relPath, prefix) {
  return relPath === prefix || relPath.startsWith(`${prefix}/`);
}

function shouldCopyRel(relPath, profile) {
  const rel = norm(relPath);
  if (!profile.mode || profile.mode === "full") return true;

  if (profile.includeFiles?.has(rel)) return true;

  if (profile.mode === "include") {
    if (profile.includeDirs.length === 0) return true;
    return profile.includeDirs.some((p) => isUnderPrefix(rel, p));
  }

  if (profile.mode === "exclude") {
    return !profile.excludeDirs.some((p) => isUnderPrefix(rel, p));
  }

  return true;
}

function shouldDescendRel(relPath, profile) {
  const rel = norm(relPath);
  if (!profile.mode || profile.mode === "full") return true;
  if (profile.mode !== "include") return false;
  return (
    profile.includeDirs.some((p) => isUnderPrefix(p, rel)) ||
    [...(profile.includeFiles ?? [])].some((p) => isUnderPrefix(p, rel))
  );
}

function copyTree(from, to, profile, rel = "", stats = { copied: 0, kept: 0, skipped: 0 }) {
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${ent.name}` : ent.name;
    const relNorm = norm(relPath);

    if (SKIP_FILES.has(ent.name)) continue;

    if (!shouldCopyRel(relNorm, profile)) {
      if (ent.isDirectory() && shouldDescendRel(relNorm, profile)) {
        const destDir = path.join(to, ent.name);
        fs.mkdirSync(destDir, { recursive: true });
        copyTree(path.join(from, ent.name), destDir, profile, relPath, stats);
        continue;
      }
      stats.skipped++;
      continue;
    }

    if (!ent.isDirectory() && profile.excludeFiles?.has(relNorm)) {
      stats.skipped++;
      continue;
    }

    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      const destDir = path.join(to, ent.name);
      fs.mkdirSync(destDir, { recursive: true });
      copyTree(path.join(from, ent.name), destDir, profile, relPath, stats);
      continue;
    }

    if (profile.keepFiles.has(relNorm)) {
      console.log(`  keep ${relNorm}`);
      stats.kept++;
      continue;
    }

    fs.copyFileSync(path.join(from, ent.name), path.join(to, ent.name));
    stats.copied++;
  }
  return stats;
}

function collectPaths(dir, rel = "", acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      acc.push(norm(relPath));
      collectPaths(full, relPath, acc);
    } else {
      acc.push(norm(relPath));
    }
  }
  return acc;
}

function pruneDest(dest, profile) {
  if (!profile.prune || !profile.mode || profile.mode === "full") return 0;

  let removed = 0;
  const srcRoot = path.join(dest, "src");
  if (!fs.existsSync(srcRoot)) return 0;

  for (const ent of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const relDir = norm(`src/${ent.name}`);
    if (!shouldCopyRel(relDir, profile) && !shouldDescendRel(relDir, profile)) {
      const target = path.join(srcRoot, ent.name);
      fs.rmSync(target, { recursive: true, force: true });
      console.log(`  prune ${relDir}`);
      removed++;
    }
  }

  return removed;
}

function pruneExcludedFiles(dest, profile) {
  if (!profile.prune || !profile.excludeFiles?.size) return 0;
  let removed = 0;
  for (const rel of profile.excludeFiles) {
    const abs = path.join(dest, rel);
    if (fs.existsSync(abs)) {
      fs.rmSync(abs, { force: true });
      console.log(`  prune file ${rel}`);
      removed++;
    }
  }
  return removed;
}

function pruneAppConfigEntityFiles(dest, profile) {
  if (!profile.prune || !profile.appConfig?.entityFiles) return 0;
  const entitiesDir = path.join(dest, "src", "entities");
  if (!fs.existsSync(entitiesDir)) return 0;

  const keep = new Set(["base.entity.ts", ...profile.appConfig.entityFiles]);
  let removed = 0;
  for (const name of fs.readdirSync(entitiesDir)) {
    if (!name.endsWith(".entity.ts") || keep.has(name)) continue;
    fs.rmSync(path.join(entitiesDir, name), { force: true });
    console.log(`  prune src/entities/${name}`);
    removed++;
  }
  return removed;
}

function pruneExcludedModuleBases(dest, profile) {
  if (!profile.prune || !profile.appConfig?.excludeModules?.length) return 0;
  const baseRoot = path.join(dest, "src", "common", "module-bases");
  if (!fs.existsSync(baseRoot)) return 0;

  let removed = 0;
  for (const moduleId of profile.appConfig.excludeModules) {
    const target = path.join(baseRoot, moduleId);
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`  prune src/common/module-bases/${moduleId}`);
    removed++;
  }
  return removed;
}

function patchDatabaseSeeder(dest, profile) {
  if (!profile.appConfig) return false;
  const moduleSet = new Set(profile.appConfig.moduleIds);
  if (moduleSet.has("orders") || moduleSet.has("products") || moduleSet.has("promo-codes")) {
    return false;
  }

  const seederPath = path.join(dest, "src", "seeders", "DatabaseSeeder.ts");
  if (!fs.existsSync(seederPath)) return false;
  fs.writeFileSync(
    seederPath,
    [
      "import { Seeder } from '@mikro-orm/seeder';",
      "import type { EntityManager } from '@mikro-orm/core';",
      "import { runSuperadminBootstrap } from '../seeds/superadmin-bootstrap.runner';",
      "",
      "export class DatabaseSeeder extends Seeder {",
      "  async run(em: EntityManager): Promise<void> {",
      "    await runSuperadminBootstrap(em);",
      "  }",
      "}",
      "",
    ].join("\n"),
  );
  console.log("  patch src/seeders/DatabaseSeeder.ts (superadmin-only)");
  return true;
}

function patchCommonIndex(dest, profile) {
  if (!profile.appConfig) return false;
  const moduleSet = new Set(profile.appConfig.moduleIds);
  if (moduleSet.has("products") || moduleSet.has("orders") || moduleSet.has("promo-codes")) {
    return false;
  }

  const indexPath = path.join(dest, "src", "common", "index.ts");
  if (!fs.existsSync(indexPath)) return false;
  const before = fs.readFileSync(indexPath, "utf8");
  const after = before
    .split(/\r?\n/)
    .filter((line) => !line.includes("from './commerce'"))
    .join("\n");
  if (after === before) return false;
  fs.writeFileSync(indexPath, after.endsWith("\n") ? after : `${after}\n`);
  console.log("  patch src/common/index.ts (remove commerce export)");
  return true;
}

function patchSuperadminWithoutPageContent(dest, profile) {
  if (!profile.appConfig?.excludeModules?.includes("page-contents")) return false;

  let patched = false;
  const seedPath = path.join(dest, "src", "seed-superadmin.ts");
  if (fs.existsSync(seedPath)) {
    const before = fs.readFileSync(seedPath, "utf8");
    const after = before
      .split(/\r?\n/)
      .filter((line) => !line.includes("./entities/page-content.entity"))
      .join("\n")
      .replace(/, PageContent/g, "");
    if (after !== before) {
      fs.writeFileSync(seedPath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/seed-superadmin.ts (remove page contents)");
      patched = true;
    }
  }

  const runnerPath = path.join(dest, "src", "seeds", "superadmin-bootstrap.runner.ts");
  if (fs.existsSync(runnerPath)) {
    const before = fs.readFileSync(runnerPath, "utf8");
    let after = before
      .split(/\r?\n/)
      .filter((line) => {
        if (line.includes("../entities/page-content.entity")) return false;
        if (line.includes("import * as fs from 'fs'")) return false;
        if (line.includes("import * as path from 'path'")) return false;
        return true;
      })
      .join("\n");
    after = after.replace(
      /\ntype PageContentSeedRow = \{[\s\S]*?\n\};\n\nfunction loadOptionalPageContent\(\): PageContentSeedRow\[\] \{[\s\S]*?\n\}\n/s,
      "\n",
    );
    after = after.replace(
      /\n\s+const pageContentData = loadOptionalPageContent\(\);\n\s+L\('Seeding page contents\.\.\.'\);[\s\S]*?\n\s+await em\.flush\(\);\n\s+L\('Page contents committed\.'\);\n/s,
      "\n",
    );
    if (after !== before) {
      fs.writeFileSync(runnerPath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/seeds/superadmin-bootstrap.runner.ts (remove page contents)");
      patched = true;
    }
  }

  return patched;
}

function patchExcludedEntityRelations(dest, profile) {
  if (!profile.appConfig?.excludeEntities?.length) return false;
  const excluded = new Set(profile.appConfig.excludeEntities);
  const userPath = path.join(dest, "src", "entities", "user.entity.ts");
  let patched = false;

  if (fs.existsSync(userPath)) {
    const before = fs.readFileSync(userPath, "utf8");
    const lines = before.split(/\r?\n/);
    const out = [];
    let skipNextProperty = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        (excluded.has("Group") && line.includes("./group.entity")) ||
        (excluded.has("GroupMember") && line.includes("./group-member.entity")) ||
        (excluded.has("Message") && line.includes("./message.entity")) ||
        (excluded.has("MessageRead") && line.includes("./message-read.entity")) ||
        (excluded.has("Comment") && line.includes("./comment.entity")) ||
        (excluded.has("ContactRequest") && line.includes("./contact-request.entity")) ||
        (excluded.has("ParentStudent") && line.includes("./parent-student.entity")) ||
        (excluded.has("Student") && line.includes("./student.entity"))
      ) {
        continue;
      }
      if (
        (excluded.has("Message") && line.includes("@OneToMany(() => Message")) ||
        (excluded.has("Group") && line.includes("@OneToMany(() => Group")) ||
        (excluded.has("GroupMember") && line.includes("@OneToMany(() => GroupMember")) ||
        (excluded.has("MessageRead") && line.includes("@OneToMany(() => MessageRead")) ||
        (excluded.has("Comment") && line.includes("@OneToMany(() => Comment")) ||
        (excluded.has("ParentStudent") && line.includes("@OneToMany(() => ParentStudent")) ||
        (excluded.has("Student") && line.includes("@OneToMany(() => Student"))
      ) {
        skipNextProperty = true;
        continue;
      }
      if (skipNextProperty) {
        if (/^\s+\w+!:\s+\w+\[\];\s*$/.test(line)) {
          skipNextProperty = false;
        }
        continue;
      }
      out.push(line);
    }

    let after = out.join("\n");
    if (excluded.has("ContactRequest")) {
      after = after
        .replace(/\n\s+@OneToMany\(\n\s+\(\) => ContactRequest,[\s\S]*?\n\s+contactRequestsSubmitted!:\s+ContactRequest\[\];/s, "")
        .replace(/\n\s+@OneToMany\(\n\s+\(\) => ContactRequest,[\s\S]*?\n\s+contactRequestsAssigned!:\s+ContactRequest\[\];/s, "");
    }
    if (after !== before) {
      fs.writeFileSync(userPath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/entities/user.entity.ts (remove excluded relations)");
      patched = true;
    }
  }

  const postPath = path.join(dest, "src", "entities", "post.entity.ts");
  if ((excluded.has("Comment") || excluded.has("PostTag")) && fs.existsSync(postPath)) {
    const before = fs.readFileSync(postPath, "utf8");
    const lines = before.split(/\r?\n/);
    const out = [];
    let skipNextProperty = false;
    for (const line of lines) {
      if (excluded.has("Comment") && line.includes("./comment.entity")) continue;
      if (excluded.has("PostTag") && line.includes("./post-tag.entity")) continue;
      if (
        (excluded.has("Comment") && line.includes("@OneToMany(() => Comment")) ||
        (excluded.has("PostTag") && line.includes("@OneToMany(() => PostTag"))
      ) {
        skipNextProperty = true;
        continue;
      }
      if (skipNextProperty) {
        if (/^\s+\w+!:\s+\w+\[\];\s*$/.test(line)) {
          skipNextProperty = false;
        }
        continue;
      }
      out.push(line);
    }
    const after = out.join("\n");
    if (after !== before) {
      fs.writeFileSync(postPath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/entities/post.entity.ts (remove excluded relations)");
      patched = true;
    }
  }

  return patched;
}

function patchNotificationsWithoutMessages(dest, profile) {
  if (!profile.appConfig?.excludeEntities?.includes("Message")) return false;
  const excludesContactRequest = profile.appConfig?.excludeEntities?.includes("ContactRequest");
  const filePath = path.join(dest, "src", "notifications", "notifications.service.ts");
  if (!fs.existsSync(filePath)) return false;

  const before = fs.readFileSync(filePath, "utf8");
  let after = before
    .split(/\r?\n/)
    .filter((line) => {
      if (line.includes("../entities/message.entity")) return false;
      if (excludesContactRequest && line.includes("../entities/contact-request.entity")) return false;
      return true;
    })
    .join("\n");
  const unreadCountsReplacement = excludesContactRequest
    ? "\n  protected getMessageEntity() {\n    return Notification as unknown as new () => Record<string, unknown>;\n  }\n\n  protected getContactRequestEntity() {\n    return Notification as unknown as new () => Record<string, unknown>;\n  }\n\n  async getUnreadCounts(userId: string | number) {\n    const NotificationEntity = this.getNotificationEntity();\n    const uid = typeof userId === 'number' ? userId : Number.parseInt(userId, 10);\n    const unreadNotifications = await this.getEm().count(NotificationEntity, {\n      user: uid,\n      isRead: false,\n    });\n    return { unreadNotifications, unreadMessages: 0, contactRequests: 0 };\n  }\n"
    : "\n  protected getMessageEntity() {\n    return Notification as unknown as new () => Record<string, unknown>;\n  }\n\n  async getUnreadCounts(userId: string | number) {\n    const NotificationEntity = this.getNotificationEntity();\n    const ContactRequestEntity = this.getContactRequestEntity();\n    const uid = typeof userId === 'number' ? userId : Number.parseInt(userId, 10);\n    const [unreadNotifications, contactRequests] = await Promise.all([\n      this.getEm().count(NotificationEntity, { user: uid, isRead: false }),\n      this.getEm().count(ContactRequestEntity, { isRead: false, deletedAt: null }),\n    ]);\n    return { unreadNotifications, unreadMessages: 0, contactRequests };\n  }\n";
  after = after.replace(
    /\n\s+protected getMessageEntity\(\) \{\n\s+return Message as unknown as new \(\) => Record<string, unknown>;\n\s+\}\n/s,
    unreadCountsReplacement,
  );
  if (excludesContactRequest) {
    after = after.replace(
      /\n\s+protected getContactRequestEntity\(\) \{\n\s+return ContactRequest as unknown as new \(\) => Record<string, unknown>;\n\s+\}\n/s,
      "\n",
    );
  }
  if (after === before) return false;
  fs.writeFileSync(filePath, after.endsWith("\n") ? after : `${after}\n`);
  console.log("  patch src/notifications/notifications.service.ts (disable message counts)");
  return true;
}

function patchStoreSyncWithoutStudentBindings(dest, profile) {
  const excludesStudent = profile.appConfig?.excludeEntities?.includes("Student");
  const excludesHanet = profile.appConfig?.excludeModules?.includes("hanet");
  if (!excludesStudent && !excludesHanet) return false;

  let patched = false;

  const accountsModulePath = path.join(dest, "src", "accounts", "accounts.module.ts");
  if (fs.existsSync(accountsModulePath) && excludesHanet) {
    const before = fs.readFileSync(accountsModulePath, "utf8");
    const after = before
      .split(/\r?\n/)
      .filter((line) => !line.includes("../hanet/hanet.module"))
      .join("\n")
      .replace(/imports:\s*\[UploadsModule,\s*HanetModule\]/g, "imports: [UploadsModule]");
    if (after !== before) {
      fs.writeFileSync(accountsModulePath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/accounts/accounts.module.ts (remove hanet binding)");
      patched = true;
    }
  }

  const accountsServicePath = path.join(dest, "src", "accounts", "accounts.service.ts");
  if (fs.existsSync(accountsServicePath)) {
    const before = fs.readFileSync(accountsServicePath, "utf8");
    const after =
      excludesStudent || excludesHanet
        ? `/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import {
  BaseAccountsService,
  type UpdateAccountDto,
  type UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';
import { resolveAvatarFolderPath } from '../common/student-code-resolve';

export type {
  AccountProfileDto,
  UpdateAccountDto,
  UpdateAccountResult,
} from '../common/module-bases/accounts/accounts.service';

@Injectable()
export class AccountsService extends BaseAccountsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity() {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected override async resolveStudentCode(): Promise<string | null> {
    return null;
  }

  override async resolveAvatarUploadFolder(userId: string): Promise<
    { ok: true; folderPath: string } | { ok: false; message: string }
  > {
    const profile = await this.getProfile(userId);
    if (!profile) {
      return { ok: false, message: 'Không tìm thấy tài khoản' };
    }

    return {
      ok: true,
      folderPath: resolveAvatarFolderPath({
        studentCode: profile.studentCode,
        userId: profile.id,
      }),
    };
  }

  override async updateProfile(
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<UpdateAccountResult> {
    const { studentCode: _studentCode, ...profileDto } = dto;
    return super.updateProfile(userId, profileDto);
  }
}
`
        : before;
    if (after !== before) {
      fs.writeFileSync(accountsServicePath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/accounts/accounts.service.ts (remove student/hanet binding)");
      patched = true;
    }
  }

  const usersServicePath = path.join(dest, "src", "users", "users.service.ts");
  if (fs.existsSync(usersServicePath) && excludesStudent) {
    const before = fs.readFileSync(usersServicePath, "utf8");
    const after = `/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Setting } from '../entities/setting.entity';
import { BaseUsersService } from '../common/module-bases/users/users.service';
import { resolveAvatarFolderPath } from '../common/student-code-resolve';
import type {
  UserRowDto,
  ListUsersParams,
  PaginatedResult,
  DevLoginOption,
  DevLoginOptionsQuery,
  DevLoginRole,
  UpdateUserData,
} from '../common/module-types';
export type {
  UserRowDto,
  ListUsersParams,
  PaginatedResult,
  DevLoginOption,
  DevLoginOptionsQuery,
  DevLoginRole,
};
export type ListUsersResult = PaginatedResult<UserRowDto>;
export type DevLoginOptionDto = DevLoginOption;
export type DevLoginRoleDto = DevLoginRole;

export { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '../common/module-bases/users/users.service';

@Injectable()
export class UsersService extends BaseUsersService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getRoleEntity() {
    return Role as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity() {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getSettingEntity() {
    return Setting as unknown as new () => Record<string, unknown>;
  }

  override async getById(id: string): Promise<UserRowDto | null> {
    const row = await super.getById(id);
    return row ? { ...row, studentCode: null } : null;
  }

  async resolveAvatarUploadFolder(
    userId: string,
  ): Promise<
    { ok: true; folderPath: string } | { ok: false; message: string }
  > {
    const row = await this.getById(userId);
    if (!row) {
      return { ok: false, message: 'Không tìm thấy người dùng' };
    }
    return {
      ok: true,
      folderPath: resolveAvatarFolderPath({
        studentCode: row.studentCode,
        userId: row.id,
      }),
    };
  }

  override async update(
    id: string,
    data: UpdateUserData,
    actorEmail?: string | null,
  ): Promise<UserRowDto | null> {
    const { studentCode: _studentCode, ...rest } = data;
    const updated = await super.update(id, rest, actorEmail);
    return updated ? { ...updated, studentCode: null } : null;
  }
}
`;
    if (after !== before) {
      fs.writeFileSync(usersServicePath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/users/users.service.ts (remove student binding)");
      patched = true;
    }
  }

  return patched;
}

function patchStoreSyncPublicDevLoginOptions(dest, profile) {
  if (!profile.appConfig?.excludeModules?.includes("public")) return false;

  let patched = false;
  const controllerPath = path.join(dest, "src", "auth", "auth.controller.ts");
  if (fs.existsSync(controllerPath)) {
    const before = fs.readFileSync(controllerPath, "utf8");
    let after = before;
    if (!/\bQuery\b/.test(after.split("from '@nestjs/common';")[0] ?? "")) {
      after = after.replace(
        /(\r?\n\s*)Res,(\r?\n\} from '@nestjs\/common';)/,
        "$1Query,$1Res,$2",
      );
    }
    after = after.replace(
      /import \{ ADMIN_ROUTES, APP_HEADERS \} from '\.\.\/config\/constants';/,
      "import { ADMIN_ROUTES, APP_HEADERS, PUBLIC_ROUTES } from '../config/constants';",
    );
    const authControllerBody = after.split(/@Public\(\)\r?\n@ApiTags\('Public'\)/)[0] ?? after;
    if (!authControllerBody.includes("@Get('dev-login-options')")) {
      const adminDevLoginOptionsMethod = `
  @Public()
  @Get('dev-login-options')
  async devLoginOptions(
    @Query('role') role: string | undefined,
    @Query('roles') roles: string | undefined,
    @Query('excludeRoles') excludeRoles: string | undefined,
    @Query('emailSuffix') emailSuffix: string | undefined,
    @Query('activeOnly') activeOnly: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body } = createSuccessResponse([]);
      return res.status(statusCode).json(body);
    }

    const data = await this.service.listDevelopmentLoginOptions({
      role,
      roles,
      excludeRoles,
      emailSuffix,
      activeOnly: activeOnly === 'false' ? false : undefined,
    });
    const { statusCode, body } = createSuccessResponse(data);
    return res.status(statusCode).json(body);
  }

`;
      after = after.replace(
        /(\r?\n\s*)@Public\(\)(\r?\n\s*)@Get\('google\/config'\)/,
        `$1${adminDevLoginOptionsMethod.trimEnd()}$1@Public()$2@Get('google/config')`,
      );
    }
    if (!after.includes("StorePublicDevLoginOptionsController")) {
      after = `${after.trimEnd()}

@Public()
@ApiTags('Public')
@Controller(PUBLIC_ROUTES.BASE)
export class StorePublicDevLoginOptionsController {
  constructor(@Inject(AuthService) private readonly service: AuthService) {}

  @Get('dev-login-options')
  async devLoginOptions(
    @Query('role') role: string | undefined,
    @Query('roles') roles: string | undefined,
    @Query('excludeRoles') excludeRoles: string | undefined,
    @Query('emailSuffix') emailSuffix: string | undefined,
    @Query('activeOnly') activeOnly: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body } = createSuccessResponse([]);
      return res.status(statusCode).json(body);
    }

    const data = await this.service.listDevelopmentLoginOptions({
      role,
      roles,
      excludeRoles,
      emailSuffix,
      activeOnly: activeOnly === 'false' ? false : undefined,
    });
    const { statusCode, body } = createSuccessResponse(data);
    return res.status(statusCode).json(body);
  }
}
`;
    }
    if (after !== before) {
      fs.writeFileSync(controllerPath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/auth/auth.controller.ts (public dev-login options)");
      patched = true;
    }
  }

  const modulePath = path.join(dest, "src", "auth", "auth.module.ts");
  if (fs.existsSync(modulePath)) {
    const before = fs.readFileSync(modulePath, "utf8");
    let after = before.replace(
      /import \{ AuthController \} from '\.\/auth\.controller';/,
      "import { AuthController, StorePublicDevLoginOptionsController } from './auth.controller';",
    );
    after = after.replace(
      /controllers:\s*\[AuthController\]/,
      "controllers: [AuthController, StorePublicDevLoginOptionsController]",
    );
    if (after !== before) {
      fs.writeFileSync(modulePath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/auth/auth.module.ts (public dev-login options)");
      patched = true;
    }
  }

  return patched;
}

function collectUsedPermissionKeys(dest) {
  const srcDir = path.join(dest, "src");
  if (!fs.existsSync(srcDir)) return [];
  const keys = new Set();
  const ignoredDirs = new Set(["node_modules", "dist", ".cache", ".graphify", "coverage"]);

  function walk(abs) {
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      if (ignoredDirs.has(path.basename(abs))) return;
      for (const name of fs.readdirSync(abs)) {
        walk(path.join(abs, name));
      }
      return;
    }
    if (!abs.endsWith(".ts")) return;
    if (norm(path.relative(dest, abs)) === "src/config/permissions.ts") return;

    const text = fs.readFileSync(abs, "utf8");
    for (const match of text.matchAll(/\bPERMISSIONS\.([A-Z0-9_]+)\b/g)) {
      keys.add(match[1]);
    }
  }

  walk(srcDir);
  return [...keys].sort((a, b) => a.localeCompare(b));
}

function patchProfileAwarePermissions(dest, profile) {
  if (!profile.appConfig?.moduleIds?.length) return false;
  const permissionKeys = collectUsedPermissionKeys(dest);
  if (!permissionKeys.length) return false;

  let patched = false;
  const permissionsPath = path.join(dest, "src", "config", "permissions.ts");
  if (fs.existsSync(permissionsPath)) {
    const before = fs.readFileSync(permissionsPath, "utf8");
    const markerStart = "\n// Profile-aware permission catalog";
    const base = before.includes(markerStart)
      ? before.slice(0, before.indexOf(markerStart)).trimEnd()
      : before.trimEnd();
    const keyLines = permissionKeys
      .map((key) => `  '${key}',`)
      .join("\n");
    const block = `${markerStart}
export const ENABLED_PERMISSION_KEYS = new Set<keyof typeof PERMISSIONS>([
${keyLines}
]);

export const ENABLED_PERMISSION_CODES = new Set<Permission>(
  Array.from(ENABLED_PERMISSION_KEYS).map((key) => PERMISSIONS[key]),
);

export function isEnabledPermission(permission: string): permission is Permission {
  return ENABLED_PERMISSION_CODES.has(permission as Permission);
}

export function listEnabledPermissions(): Permission[] {
  return Object.values(PERMISSIONS).filter(isEnabledPermission);
}

export function filterEnabledPermissions(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.filter(
    (permission): permission is Permission =>
      typeof permission === 'string' && isEnabledPermission(permission),
  );
}
`;
    const after = `${base}\n${block}`;
    if (after !== before) {
      fs.writeFileSync(permissionsPath, after);
      console.log(
        `  patch src/config/permissions.ts (${permissionKeys.length} used permissions)`,
      );
      patched = true;
    }
  }

  const rolesControllerPath = path.join(dest, "src", "roles", "roles.controller.ts");
  if (fs.existsSync(rolesControllerPath)) {
    const before = fs.readFileSync(rolesControllerPath, "utf8");
    let after = before.replace(
      /import \{ RESOURCES, ACTIONS, PERMISSIONS \} from '\.\.\/config\/permissions';/,
      "import { RESOURCES, ACTIONS, PERMISSIONS, listEnabledPermissions } from '../config/permissions';",
    );
    after = after.replace(/Object\.values\(PERMISSIONS\)/g, "listEnabledPermissions()");
    if (after !== before) {
      fs.writeFileSync(rolesControllerPath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/roles/roles.controller.ts (profile permission catalog)");
      patched = true;
    }
  }

  const rolesServicePath = path.join(dest, "src", "common", "module-bases", "roles", "role.service.ts");
  if (fs.existsSync(rolesServicePath)) {
    const before = fs.readFileSync(rolesServicePath, "utf8");
    let after = before;
    if (!after.includes("filterEnabledPermissions")) {
      after = after.replace(
        /import \{ isSystemSuperAdminRoleName \} from '..\/..\/..\/config\/system-role';/,
        "import { isSystemSuperAdminRoleName } from '../../../config/system-role';\nimport { filterEnabledPermissions } from '../../../config/permissions';",
      );
    }
    after = after
      .replace(/permissions: r\.permissions,/g, "permissions: filterEnabledPermissions(r.permissions),")
      .replace(/created\.permissions = data\.permissions;/g, "created.permissions = filterEnabledPermissions(data.permissions);")
      .replace(/row\.permissions = data\.permissions;/g, "row.permissions = filterEnabledPermissions(data.permissions);");
    if (after !== before) {
      fs.writeFileSync(rolesServicePath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/common/module-bases/roles/role.service.ts (filter permissions)");
      patched = true;
    }
  }

  const runnerPath = path.join(dest, "src", "seeds", "superadmin-bootstrap.runner.ts");
  if (fs.existsSync(runnerPath)) {
    const before = fs.readFileSync(runnerPath, "utf8");
    let after = before;
    if (!after.includes("filterEnabledPermissions")) {
      after = after.replace(
        /import \{\r?\n  SUPERADMIN_ROLES_DATA,/,
        "import { filterEnabledPermissions, listEnabledPermissions } from '../config/permissions';\nimport {\n  SUPERADMIN_ROLES_DATA,",
      );
    } else if (!after.includes("listEnabledPermissions")) {
      after = after.replace(
        /import \{ filterEnabledPermissions \} from '\.\.\/config\/permissions';/,
        "import { filterEnabledPermissions, listEnabledPermissions } from '../config/permissions';",
      );
    }
    if (!after.includes("const rolePermissions =")) {
      after = after.replace(
        /for \(const roleData of SUPERADMIN_ROLES_DATA\) \{\r?\n\s+const existing = await em\.findOne\(Role, \{ name: roleData\.name \}\);/,
        "for (const roleData of SUPERADMIN_ROLES_DATA) {\n    const rolePermissions =\n      roleData.name === 'super_admin'\n        ? listEnabledPermissions()\n        : filterEnabledPermissions(roleData.permissions);\n    const existing = await em.findOne(Role, { name: roleData.name });",
      );
    }
    after = after.replace(/role\.permissions = roleData\.permissions;/g, "role.permissions = rolePermissions;");
    after = after.replace(/existing\.permissions = roleData\.permissions;/g, "existing.permissions = rolePermissions;");
    after = after.replace(/role\.permissions = filterEnabledPermissions\(roleData\.permissions\);/g, "role.permissions = rolePermissions;");
    after = after.replace(/existing\.permissions = filterEnabledPermissions\(roleData\.permissions\);/g, "existing.permissions = rolePermissions;");
    if (after !== before) {
      fs.writeFileSync(runnerPath, after.endsWith("\n") ? after : `${after}\n`);
      console.log("  patch src/seeds/superadmin-bootstrap.runner.ts (filter role seed permissions)");
      patched = true;
    }
  }

  return patched;
}

function finalizeAppConfigSync(dest, profile) {
  if (!profile.appConfig) {
    return { patchedAppModule: false, patchedOrm: false, prunedEntities: 0, prunedModuleBases: 0 };
  }

  const patchedAppModule = patchRenderAppModule(dest, profile.appConfig.moduleIds, {
    quiet: false,
    excludeModules: profile.appConfig.excludeModules,
  });
  const prunedModuleBases = pruneExcludedModuleBases(dest, profile);
  patchExcludedEntityRelations(dest, profile);
  patchNotificationsWithoutMessages(dest, profile);
  patchStoreSyncWithoutStudentBindings(dest, profile);
  patchStoreSyncPublicDevLoginOptions(dest, profile);
  const prunedEntities = pruneAppConfigEntityFiles(dest, profile);
  patchDatabaseSeeder(dest, profile);
  patchCommonIndex(dest, profile);
  patchSuperadminWithoutPageContent(dest, profile);
  patchProfileAwarePermissions(dest, profile);
  let patchedOrm = false;

  if (profile.appConfig.entityClasses && profile.appConfig.entityFiles) {
    const result = patchOrmEntities(
      dest,
      profile.appConfig.entityClasses,
      profile.appConfig.entityFiles,
    );
    patchedOrm = Boolean(result.patched);
  }

  if (profile.appConfig.entityFiles) {
    console.log(
      `  verify app-config scope: ${profile.appConfig.moduleIds.length} module · ${profile.appConfig.entityFiles.length} entity`,
    );
  }

  return { patchedAppModule, patchedOrm, prunedEntities, prunedModuleBases };
}

function removeInheritedOnlyScripts(dest) {
  let removed = 0;
  for (const rel of INHERITED_API_EXCLUDE_FILES) {
    const abs = path.join(dest, rel);
    if (fs.existsSync(abs)) {
      fs.rmSync(abs, { force: true });
      console.log(`  removed inherited-only ${rel}`);
      removed++;
    }
  }
  return removed;
}

function patchProductPackageScripts(dest) {
  const pkgPath = path.join(dest, "package.json");
  if (!fs.existsSync(pkgPath)) return false;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const scripts = pkg.scripts;
  if (!scripts || typeof scripts !== "object") return false;

  let changed = false;
  const replacements = {
    predev: "node ../../../script-system/dev/dev-prep-api.cjs 3002",
    kill: "node ../../../script-system/dev/kill-ports.cjs 3002",
  };
  for (const [name, value] of Object.entries(replacements)) {
    if (scripts[name] && scripts[name] !== value) {
      scripts[name] = value;
      changed = true;
    }
  }

  if (!changed) return false;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("  patch package scripts → app-relative dev helpers");
  return true;
}

function preserveProductPackageName(productKey, dest) {
  const pkgName = PRODUCT_LINES[productKey]?.api?.package;
  if (!pkgName) return;
  const pkgPath = path.join(dest, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.name === pkgName) return;
  pkg.name = pkgName;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`  set package name → ${pkgName}`);
}

function syncProduct(productKey) {
  const entry = PRODUCT_LINES[productKey]?.api;
  if (!entry) {
    console.error(`Unknown product: ${productKey}`);
    process.exit(1);
  }
  const dest = path.join(ROOT, entry.path);
  if (!fs.existsSync(SRC)) {
    console.error(`Missing source: ${MAIN_API_PATH} or ${FALLBACK_TEMPLATE_API_PATH}`);
    process.exit(1);
  }

  const profile = loadProfile(productKey, dest);
  for (const rel of INHERITED_API_EXCLUDE_FILES) {
    profile.excludeFiles.add(rel);
  }
  for (const rel of INHERITED_API_KEEP_FILES) {
    profile.keepFiles.add(rel);
  }
  const modeLabel = profile.mode ?? "full";
  console.log(`[sync-api] ${SOURCE_API_PATH} → ${entry.path} (mode: ${modeLabel})`);

  const stats = copyTree(SRC, dest, profile);
  const prunedDirs = pruneDest(dest, profile);
  const prunedFiles = pruneExcludedFiles(dest, profile);
  const finalized = finalizeAppConfigSync(dest, profile);
  removeInheritedOnlyScripts(dest);
  patchProductPackageScripts(dest);
  preserveProductPackageName(productKey, dest);

  console.log(
    `[sync-api] Done: ${productKey} — copied ${stats.copied}, kept ${stats.kept}, skipped ${stats.skipped}, pruned ${prunedDirs} dirs, ${prunedFiles + finalized.prunedEntities} files`,
  );
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node script-system/sync-api-from-main.cjs <hub-event|hub-parent|store-sync|all>");
  process.exit(1);
}

if (arg === "all") {
  for (const key of API_INHERITS_FROM_MAIN) syncProduct(key);
} else {
  if (!API_INHERITS_FROM_MAIN.includes(arg)) {
    console.error(`Product must be one of: ${API_INHERITS_FROM_MAIN.join(", ")}, all`);
    process.exit(1);
  }
  syncProduct(arg);
}
