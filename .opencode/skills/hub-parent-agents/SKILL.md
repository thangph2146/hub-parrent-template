---
name: hub-parent-agents
description: Use ONLY when the user requests any coding task, feature implementation, bug fix, or source code change in the hub-parent-template project. Enforces mandatory pre-code protocol, required reading list, step docs order, pnpm check commands, and microservice boundary rules from AGENTS.md before any source modification.
---

# hub-parent-agents Skill

This skill enforces the **mandatory workflow** from `AGENTS.md` before any code change in the `hub-parent-template` monorepo.

## Trigger

Use when the user asks to:

- Implement a feature, fix a bug, refactor code, or modify any source file
- Work on `apps/frontend`, `apps/backend`, `apps/api`, or `packages/*`
- Any task that involves reading or changing `.ts`, `.tsx`, `.js`, `.svelte`, `.vue`, `.css`, `.html`, or config files within the project

## Mandatory Pre-Code Protocol

Before editing **any** source file, the agent MUST follow this sequence:

### Step 1: Read the Pre-Code Protocol

1. Read `docs/admin-pattern/PRE_CODE_PROTOCOL.md`
2. Read any additional documents referenced inside that protocol file

### Step 2: Read Required Docs (in order)

Before making changes, read these files:

1. `docs/admin-pattern/README.md`
2. `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`
3. `docs/admin-pattern/AGENTS_GUIDE.md`
4. `docs/admin-pattern/FRONTEND_UX.md` (only when working on `apps/frontend`)
5. `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` (when implementing admin pages in `apps/backend`)
6. `.graphify/markdown/SUMMARY_FOR_AI.md` (monorepo index)
7. `packages/.graphify/markdown/SUMMARY_FOR_AI.md` (workspace packages)
8. `apps/frontend/.graphify/markdown/SUMMARY_FOR_AI.md` (when touching frontend)
9. `apps/backend/.graphify/markdown/SUMMARY_FOR_AI.md` (when touching backend)
10. `apps/api/.graphify/markdown/SUMMARY_FOR_AI.md` (when touching api)

After reading the `.graphify` summaries, use the **topic guide** section within those files to pick the right companion docs: `FOLDER_TREE.md`, `GRAPH_STATS.md`, `API_DOMAIN_IMPORTS.md`, or `WORKSPACE_DEPS.md` from the same `markdown/` directory.

### Step 3: Read Package-Specific Docs

When the task relates to a specific workspace package, consult the corresponding doc:

| Package                        | Path                          | Resource                                              |
| ------------------------------ | ----------------------------- | ----------------------------------------------------- |
| `@workspace/ui`                | `packages/ui/`                | `docs/ui-pattern/README.md` + `ADMIN_PAGE_PATTERN.md` |
| `@workspace/api-client`        | `packages/api-client/`        | `docs/api-client-pattern/README.md`                   |
| `@thangph2146/lexical-editor`  | `packages/editor/`            | `packages/editor/README.md`                           |
| `@workspace/logger`            | `packages/logger/`            | `docs/logger-pattern/README.md`                       |
| `@workspace/query-client`      | `packages/query-client/`      | `docs/query-client-pattern/README.md`                 |
| `@workspace/eslint-config`     | `packages/eslint-config/`     | config files, no doc needed                           |
| `@workspace/typescript-config` | `packages/typescript-config/` | config files, no doc needed                           |

### Step 4: Read Step Docs (relevant ones)

The step docs at `docs/steps/` are the primary roadmap for the agent:

- `docs/steps/step1_system_overview.md`
- `docs/steps/step2_clean_code_guidelines.md`
- `docs/steps/step3_admin_pattern_docs.md`
- `docs/steps/step4_graphify_reading.md`
- `docs/steps/step5_feature_implementation_guides.md`
- `docs/steps/step6_code_execution_and_change_tracking.md`
- `docs/steps/step7_review_pr_and_system_memory.md`
- `docs/steps/step8_architecture_maintenance.md`
- `docs/steps/step9_follow_up_rollback_legacy_tracking.md`
- `docs/steps/step10_agent_task_automation.md`

Read the steps relevant to the current task. At minimum, read step1 and step2 for context.

### Step 5: Admin Page Pattern Docs

If the task relates to admin pages in `apps/backend`, read `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` and `docs/pages/README.md` before touching source.

## Mandatory Commands

### Before/after any code change:

```bash
pnpm check
```

### After architecture/module/route changes:

1. Run `node scripts/graphify-update.cjs apps/<app>` for each affected app
2. Then run:

```bash
pnpm check:full
```

(`check:full` = `pnpm check` + `pnpm graphify:ai-summary`)

> Do NOT auto-run `update.cjs` — follow the checklist in `.graphify/README.md` first.

## Microservice Rules (enforce strictly)

- **NO cross-imports** between `apps/*` source files. Each app is isolated.
- Frontend/Backend communicate with API **only via HTTP + `@workspace/api-client`** — never write raw fetch to `apps/api`.
- Shared logic goes in `packages/*` **only when genuinely reused**.
- **All UI components (admin + site) MUST come from `@workspace/ui`** — never create local copies in `apps/backend/src/components/` or `apps/backend/src/app/**/_components/`. If missing, add to `packages/ui/src/`.
- **API Client calls MUST go through `@workspace/api-client`** — never write raw `fetch` to `apps/api`.
- **Editor component** uses `@thangph2146/lexical-editor` from `packages/editor/` — must be built first with `pnpm --filter @thangph2146/lexical-editor build`.
- **Logger** (`@workspace/logger`) used internally by `@workspace/api-client` for dev logging.
- **Query client** (`@workspace/query-client`) provides TanStack Query setup for frontend apps.
- **Config packages** (`@workspace/eslint-config`, `@workspace/typescript-config`) are dev-only, no runtime import.
- When editing `apps/api`: read `docs/api-pattern/README.md`.
- When editing `packages/api-client` or calling API from any app: read `docs/api-client-pattern/README.md`.
- Boundaries enforced by:
  - `packages/eslint-config/service-boundaries.js`
  - `scripts/verify-service-boundaries.mjs`

## Workflow Summary

1. User requests a task
2. Agent reads `docs/admin-pattern/PRE_CODE_PROTOCOL.md` + referenced docs
3. Agent reads required docs list (above) relevant to the task scope
4. Agent reads applicable step docs
5. Agent checks package-specific docs based on scope (see Step 3 table)
6. Agent reads `docs/admin-pattern/ADMIN_PAGE_PATTERN.md` + `docs/pages/README.md` if admin-page related
7. Agent reads package-specific doc (see Step 3 table): `docs/ui-pattern/README.md`, `docs/logger-pattern/README.md`, `docs/query-client-pattern/README.md`, `docs/api-pattern/README.md`, or `docs/api-client-pattern/README.md`
8. Agent implements the change
9. Agent runs `pnpm check` (and `pnpm check:full` if architecture changed)
10. Agent verifies no service boundary violations

## Notes

- `docs/steps/*.md` is the **primary roadmap** for the agent
- `docs/admin-pattern/` and `docs/pages/` are **supplementary**
- Only open `apps/*/.graphify/snapshot/context.json` when a specific excerpt is needed (files are large, embed full source)
- After architecture refactor: run graphify update → `pnpm graphify:ai-summary` → cross-check `.graphify/README.md` checklist
