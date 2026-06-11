/**
 * @workspace/api-server
 *
 * Shared NestJS types, interfaces, base classes, utilities, and module implementations
 * for building API servers in the hub-parent template ecosystem.
 *
 * @example
 * ```typescript
 * // Import types
 * import { UserRowDto, ListUsersParams } from '@workspace/api-server';
 *
 * // Import utilities
 * import { toEntityId, normalizePageLimit } from '@workspace/api-server';
 *
 * // Import base classes
 * import { BaseUsersService, BaseUsersController } from '@workspace/api-server';
 *
 * // Import module
 * import { BaseUsersModule } from '@workspace/api-server/modules/users';
 * ```
 */

// Types
export * from './types';

// Interfaces
export * from './interfaces';

// Base classes
export * from './bases';

// Utilities
export * from './utils';

// Modules
export * from './modules';
