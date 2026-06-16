/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Event Checkouts Module.
 *
 * Bám sát pattern của `apps/main/api/src/event-checkouts/event-checkouts.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseEventCheckoutsController } from './event-checkout.controller';

@Module({})
export class BaseEventCheckoutsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseEventCheckoutsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseEventCheckoutsController } from './event-checkout.controller';
export { BaseEventCheckoutsService } from './event-checkout.service';
