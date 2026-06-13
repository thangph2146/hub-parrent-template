/**
 * System module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseSystemService,
  BaseSystemService as BaseSystemAdminService,
} from './system.service';
export type { ExportDataResult, ImportDataResult } from './system.service';
export {
  BaseSystemController,
  BaseSystemController as BaseSystemAdminController,
} from './system.controller';
export type { ISystemControllerService, ISystemMaintenanceAuth } from './system.controller';
/** @deprecated Dùng `ISystemControllerService`. */
export type { ISystemControllerService as ISystemAdminControllerService } from './system.controller';
export { BaseSystemModule } from './system.module';
export {
  isSkippableImportRowError,
  orderCategoryRowsForImport,
  pivotFk,
  sanitizePivotRowsInExportJson,
  stripHeroSlidesPermissions,
  stripLegacyHeroSlideFromBundle,
} from './import-helpers';
export type { ImportRow } from './import-helpers';
export {
  normalizeLegacyImportRow,
  resolveLegacyTableModelName,
} from './export-schema';
export {
  exportLegacyKey,
  IMPORT_ID_MAP_GROUP,
  LegacyImportIdMap,
} from './legacy-import-id-map';
export {
  buildImportVerification,
  getImportReferenceFilePath,
  loadImportReferenceManifest,
} from './import-reference';
export type { ImportVerificationResult } from './import-reference';
