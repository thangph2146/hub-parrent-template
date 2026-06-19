/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */
/**
 * UploadsService Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const em: Partial<EntityManager> = {
      findOne: jest.fn(),
      getConnection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService, { provide: EntityManager, useValue: em }],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
