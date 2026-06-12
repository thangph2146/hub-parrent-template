---
name: hub-parent-agents
description: Use ONLY when the user requests any coding task, feature implementation, bug fix, or source code change in the hub-parent-template project. Enforces mandatory pre-code protocol, required reading list, step docs order, pnpm check commands, and microservice boundary rules from AGENTS.md before any source modification.
---

# hub-parent-agents Skill

This skill enforces the **mandatory workflow** from `AGENTS.md` before any code change in the `hub-parent-template` monorepo.

**Entry point:** `AGENTS.md` (Vietnamese, UTF-8). **Real app paths** — dev: `apps/main/*`; deploy lines under `apps/hub-parent/*`, `apps/hub-event/*`, `apps/store-sync/*`. Legacy shorthand `apps/api` / `apps/backend` / `apps/frontend` must not be used for new work.

## Trigger

Use when the user asks to:

- Implement a feature, fix a bug, refactor code, or modify any source file
- Work on any app under `apps/*` or `packages/*`
- Any task that involves reading or changing source or config within the project

## Mandatory Pre-Code Protocol

Before editing **any** source file, the agent MUST follow this sequence:

### Step 1: Read the Pre-Code Protocol

1. Read `docs/admin-pattern/PRE_CODE_PROTOCOL.md`
2. Read any additional documents referenced inside that protocol file
3. Read `AGENTS.md` — task ? doc ? folder table

### Step 2: Read Required Docs (in order)

Before making changes, read these files:

1. `docs/admin-pattern/README.md`
2. `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
3. `docs/admin-pattern/AGENTS_GUIDE.md`
4. `docs/admin-pattern/FRONTEND_UX.md` (storefront: `apps/hub-parent/hub-parent-frontend`)
5. `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` (admin: `apps/main/backend` or `@workspace/admin-app`)
6. `.graphify/markdown/SUMMARY_FOR_AI.md` (monorepo index)
7. `packages/.graphify/markdown/SUMMARY_FOR_AI.md` (workspace packages)
8. App Graphify summary for the task scope (see table below)

| Scope | `SUMMARY_FOR_AI.md` |
|-------|---------------------|
| API dev (`@api`) | `apps/main/api/.graphify/markdown/` |
| Admin dev (`@backend`) | `apps/main/backend/.graphify/markdown/` |
| Storefront (`@frontend`) | `apps/hub-parent/hub-parent-frontend/.graphify/markdown/` |
| Check-in API | `apps/hub-event/api/.graphify/markdown/` |
| Check-in UI | `apps/hub-event/hub-event-checkin-frontend/.graphify/markdown/` |
| Store Sync | `apps/store-sync/*/.graphify/markdown/` |

After reading summaries, use **Ch? d?n theo ch? ??** ? `FOLDER_TREE.md`, `GRAPH_STATS.md`, `API_DOMAIN_IMPORTS.md`, `WORKSPACE_DEPS.md`.

### Step 3: Read Package-Specific Docs

| Package | Resource |
| ------- | -------- |
| `@workspace/ui` | `docs/ui-pattern/README.md` + `ADMIN_PAGE_PATTERN.md` |
| `@workspace/api-client` | `docs/api-client-pattern/README.md` |
| `@workspace/api-server` | `packages/api-server/README.md` |
| `@workspace/admin-app` | `docs/admin-pattern/ADMIN_APP_PACKAGE.md` |
| `@thangph2146/lexical-editor` | `packages/editor/README.md` |
| `@workspace/logger` | `docs/logger-pattern/README.md` |
| `@workspace/query-client` | `docs/query-client-pattern/README.md` |

### Step 4: Read Step Docs (relevant ones)

Primary roadmap: `docs/steps/step1` … `step10`. At minimum: `step1_system_overview.md`, `step2_clean_code_guidelines.md`.

### Step 5: Admin / API generate

- Admin pages: `ADMIN_PAGE_PATTERN.md` + `docs/pages/README.md`; check-in CRUD ? `ADMIN_APP_PACKAGE.md`
- Hub-event API scaffold: `packages/api-server/README.md`, `pnpm api:generate:checkin`

## Mandatory Commands

```bash
pnpm check
```

After architecture/module/route changes:

```bash
pnpm graphify:refresh
# or: node script-system/graphify/graphify-update.cjs apps/<real-path> && pnpm graphify:ai-summary
pnpm check:full
```

## Microservice Rules (enforce strictly)

- **NO cross-imports** between `apps/*`
- Next apps ? API **only** via `@workspace/api-client` (no raw `fetch` to API)
- Shared logic in `packages/*` when genuinely reused
- Admin UI from `@ui/components/...` — not local in `apps/main/backend`
- API Nest: `@workspace/*` only — no React / `@ui`
- Dev daily: edit `apps/main/` + `packages/*`; deploy lines via `pnpm pull:checkin` / sync
- Boundaries: `packages/eslint-config/service-boundaries.js`, `pnpm verify:bounds`

## Workflow Summary

1. User requests a task
2. Read `PRE_CODE_PROTOCOL.md` + `AGENTS.md` scope table
3. Read Graphify + pattern docs for the scope
4. Implement change
5. `pnpm check` (and `graphify:refresh` + `check:full` if architecture changed)

## Notes

- Docs language: **Vietnamese UTF-8** in `docs/` and `AGENTS.md`
- Do not create random `.md` files — follow `AGENTS.md` section 4
- Only open `snapshot/context.json` when a specific excerpt is needed
