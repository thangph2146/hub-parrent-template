/**
 * Dashboard Module.
 *
 * Bám sát pattern của `apps/main/api/src/dashboard/dashboard.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseDashboardController } from './dashboard.controller';

@Module({})
export class BaseDashboardModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseDashboardController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseDashboardController } from './dashboard.controller';
export { BaseDashboardService } from './dashboard.service';
export type { DashboardStatsDto } from './dashboard.types';
