/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AdmissionResult } from '../entities/admission-result.entity';
import { BaseAdmissionResultsService } from '../common/module-bases/admission-results/admission-result.service';

export type {
  AdmissionResultsRowDto,
  ListAdmissionResultsParams,
  ListAdmissionResultsResult,
  AdmissionResultsCreateData,
  AdmissionResultsUpdateData,
} from '../common/module-bases/admission-results/admission-result.service';

@Injectable()
export class AdmissionResultsService extends BaseAdmissionResultsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return AdmissionResult as unknown as new () => Record<string, unknown>;
  }
}
