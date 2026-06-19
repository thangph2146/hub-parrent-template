/**
 * @workspace/api-server
 *
 * Shared NestJS types, interfaces, base classes, common utilities, configs
 * and module implementations for building API servers in the template
 * ecosystem.
 *
 * Bám sát pattern `apps/main/api/src/`:
 *   - `common/*`  — utilities, decorators, guards, response formatters
 *   - `config/*`  — app constants, permission system
 *   - `bases/*`   — abstract base service/controller cho MỌI entity
 *   - `modules/*` — per-entity CRUD scaffold
 *   - `types/*`   — generic TypeScript types
 *
 * @example
 * ```typescript
 * // Import types
 * import { UserRowDto, ListUsersParams } from '@workspace/api-server';
 *
 * // Import utilities (mirror apps/main/api/src/common/)
 * import { toEntityId, normalizePageLimit, Permissions, createSuccessResponse } from '@workspace/api-server';
 *
 * // Import config (mirror apps/main/api/src/config/)
 * import { ADMIN_ROUTES, PERMISSIONS, RESOURCES, ACTIONS } from '@workspace/api-server';
 *
 * // Import base classes
 * import { BaseCrudService, BaseCrudController } from '@workspace/api-server';
 *
 * // Import module
 * import { BaseUsersModule } from '@workspace/api-server/modules/users';
 * ```
 */

// Types
export * from './types';

// Common utilities (mirror apps/main/api/src/common/)
export * from './common';

// Config (mirror apps/main/api/src/config/)
export * from './config';

// Base classes
export * from './bases';

// NOTE: `@workspace/api-server/utils/*` re-export `common/*` (backward compat).
// Root barrel không export utils/ để tránh trùng hằng pagination với `common/`.

// Modules
export * from './modules';
