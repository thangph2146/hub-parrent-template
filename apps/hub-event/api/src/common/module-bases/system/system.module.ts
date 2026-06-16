/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * System Module.
 *
 * Bám sát pattern của `apps/main/api/src/system/system.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseSystemController } from './system.controller';

@Module({})
export class BaseSystemModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseSystemController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseSystemController } from './system.controller';
export {
  BaseSystemService,
  type ExportDataResult,
  type ImportDataResult,
} from './system.service';