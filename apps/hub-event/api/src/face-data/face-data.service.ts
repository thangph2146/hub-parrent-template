/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FaceData } from '../entities/face-data.entity';
import { BaseFaceDatasService } from '../common/module-bases/face-data/face-data.service';
export type {
  FaceDatasRowDto,
  FaceDatasCreateData,
  FaceDatasUpdateData,
} from '../common/module-bases/face-data/face-data.service';

@Injectable()
export class FaceDataService extends BaseFaceDatasService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return FaceData as unknown as new () => Record<string, unknown>;
  }
}
