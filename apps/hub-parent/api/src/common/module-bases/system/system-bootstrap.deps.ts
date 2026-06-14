/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { EntityManager } from '@mikro-orm/core';

export type SystemBootstrapResult = Record<string, unknown>;

export interface SystemBootstrapDeps {
  runSuperadminBootstrap(em: EntityManager): Promise<SystemBootstrapResult>;
  ensureSeedUserRoleLinks(em: EntityManager): Promise<void>;
  ensureActingUserRoleAfterImport(
    em: EntityManager,
    actingUserId?: number,
  ): Promise<void>;
}
