import * as fs from 'fs';

import { resolveImportReferencePath } from '../../data-paths';

export type ImportReferenceManifest = {
  source: string;
  exportedAt: string;
  description?: string;
  expectedCounts: Record<string, number>;
  notes?: Record<string, string>;
};

export function getImportReferenceFilePath(): string {
  return resolveImportReferencePath();
}

export function loadImportReferenceManifest(): ImportReferenceManifest | null {
  const filePath = getImportReferenceFilePath();
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, 'utf8'),
    ) as ImportReferenceManifest;
    if (!raw?.expectedCounts || typeof raw.expectedCounts !== 'object') {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export type ImportVerificationModel = {
  exportModelName: string;
  expected: number;
  actual: number;
  status: 'ok' | 'over' | 'under';
  note?: string;
};

export type ImportVerificationResult = {
  referenceSource: string;
  referenceExportedAt: string;
  referenceFile: string;
  isComplete: boolean;
  matchedModels: number;
  mismatchedModels: number;
  expectedBusinessTotalRows: number;
  actualBusinessTotalRows: number;
  models: ImportVerificationModel[];
};

export function buildImportVerification(
  manifest: ImportReferenceManifest,
  referenceFile: string,
  actualByModel: Map<string, { rowCount: number; note?: string }>,
): ImportVerificationResult {
  const models: ImportVerificationModel[] = [];
  let matchedModels = 0;
  let mismatchedModels = 0;
  let expectedBusinessTotalRows = 0;
  let actualBusinessTotalRows = 0;

  for (const [exportModelName, expected] of Object.entries(
    manifest.expectedCounts,
  )) {
    if (expected <= 0) continue;
    const actualEntry = actualByModel.get(exportModelName);
    const actual = actualEntry?.rowCount ?? 0;
    const status: ImportVerificationModel['status'] =
      actual === expected ? 'ok' : actual > expected ? 'over' : 'under';
    if (status === 'ok') matchedModels += 1;
    else mismatchedModels += 1;
    expectedBusinessTotalRows += expected;
    actualBusinessTotalRows += actual;
    models.push({
      exportModelName,
      expected,
      actual,
      status,
      note: actualEntry?.note ?? manifest.notes?.[exportModelName],
    });
  }

  models.sort((a, b) => {
    if (a.status !== b.status) {
      const rank = { under: 0, over: 1, ok: 2 };
      return rank[a.status] - rank[b.status];
    }
    return b.expected - a.expected;
  });

  return {
    referenceSource: manifest.source,
    referenceExportedAt: manifest.exportedAt,
    referenceFile,
    isComplete: mismatchedModels === 0,
    matchedModels,
    mismatchedModels,
    expectedBusinessTotalRows,
    actualBusinessTotalRows,
    models,
  };
}
