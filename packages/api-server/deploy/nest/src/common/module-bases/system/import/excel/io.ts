import * as ExcelJS from 'exceljs';
import {
  encodeExcelCellValue,
  EXCEL_META_SHEET,
  parseExcelCellValue,
} from './value';
import {
  addWorkbookMetadataSheet,
  getExcelColumns,
  getWorkbookSheetName,
  type ExcelWorkbookContext,
} from './workbook';

type ExcelWorkbookLoadInput = Parameters<ExcelJS.Workbook['xlsx']['load']>[0];

export async function buildExcelExportBuffer(
  data: Record<string, Record<string, unknown>[]>,
  excel: ExcelWorkbookContext,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HUB API';
  workbook.created = new Date();
  workbook.modified = new Date();

  addWorkbookMetadataSheet(workbook, data, excel);

  for (const [currentModelName, rows] of Object.entries(data)) {
    const sheet = workbook.addWorksheet(
      getWorkbookSheetName(excel, currentModelName),
    );
    const columns = getExcelColumns(excel, currentModelName, rows);

    if (columns.length === 0) {
      sheet.addRow(['id']);
      continue;
    }

    sheet.columns = columns.map((column) => ({
      header: column,
      key: column,
      width: Math.max(14, Math.min(40, column.length + 4)),
    }));
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };

    for (const row of rows) {
      const encodedRow: Record<string, string | number | boolean> = {};
      for (const column of columns) {
        encodedRow[column] = encodeExcelCellValue(row[column]);
      }
      sheet.addRow(encodedRow);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function parseExcelImportBuffer(
  fileBuffer: Buffer,
  options: {
    targetModel?: string;
    resolveModelName: (name?: string | null) => string | undefined;
  },
): Promise<{ data: Record<string, any[]>; resolvedTargetModel?: string }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as unknown as ExcelWorkbookLoadInput);

  const metaSheet = workbook.getWorksheet(EXCEL_META_SHEET);
  const sheetMap = new Map<string, string>();
  if (metaSheet) {
    metaSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const modelName = row.getCell(1).text?.trim();
      const sheetName = row.getCell(2).text?.trim();
      const tableName = row.getCell(3).text?.trim();
      if (modelName && sheetName) {
        sheetMap.set(modelName, sheetName);
        if (tableName) sheetMap.set(tableName, sheetName);
      }
    });
  }

  const resolvedTargetModel =
    options.resolveModelName(options.targetModel) ?? options.targetModel;
  const modelNames = resolvedTargetModel
    ? [resolvedTargetModel]
    : sheetMap.size > 0
      ? [...sheetMap.keys()]
      : workbook.worksheets
          .map((sheet) => sheet.name)
          .filter((name) => name !== EXCEL_META_SHEET);

  const data: Record<string, any[]> = {};

  for (const rawModelName of modelNames) {
    const modelName = options.resolveModelName(rawModelName) ?? rawModelName;
    const worksheet =
      workbook.getWorksheet(sheetMap.get(rawModelName) ?? rawModelName) ??
      workbook.getWorksheet(rawModelName) ??
      workbook.getWorksheet(modelName);
    if (!worksheet) continue;

    const headerRow = worksheet.getRow(1);
    const headerValues = Array.isArray(headerRow.values)
      ? headerRow.values.slice(1)
      : [];
    const headers = headerValues
      .map((value) => String(value ?? '').trim())
      .filter(Boolean);
    if (headers.length === 0) {
      data[modelName] = [];
      continue;
    }

    const rows: Record<string, unknown>[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const record: Record<string, unknown> = {};
      let hasValue = false;

      headers.forEach((header, index) => {
        const parsed = parseExcelCellValue(row.getCell(index + 1).value);
        if (parsed === undefined) return;
        record[header] = parsed;
        hasValue = true;
      });

      if (hasValue) rows.push(record);
    });

    data[modelName] = rows;
  }

  return { data, resolvedTargetModel };
}
