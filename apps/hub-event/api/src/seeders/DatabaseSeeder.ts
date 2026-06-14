/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Seeder } from '@mikro-orm/seeder';
import type { EntityManager } from '@mikro-orm/core';
import { runSuperadminBootstrap } from '../seeds/superadmin-bootstrap.runner';
import { seedSampleOrders } from '../seeds/orders-sample.runner';
import { seedSampleProducts } from '../seeds/products-sample.runner';
import { seedSamplePromoCodes } from '../seeds/promo-codes-sample.runner';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await runSuperadminBootstrap(em);
    await seedSampleProducts(em);
    await seedSamplePromoCodes(em);
    await seedSampleOrders(em);
  }
}
