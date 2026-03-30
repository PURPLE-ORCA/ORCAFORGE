import * as XLSX from "xlsx";

export interface ExcelSheetConfig<T = Record<string, unknown>> {
  sheetName: string;
  data: T[];
}

export function downloadExcel(
  sheets: ExcelSheetConfig[],
  fileNamePrefix = "export",
): void {
  const wb = XLSX.utils.book_new();
  let hasData = false;

  sheets.forEach(({ sheetName, data }) => {
    if (data.length > 0) {
      hasData = true;
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });

  if (!hasData) {
    console.warn("No data provided for Excel export.");
    return;
  }

  const now = new Date();
  const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now.getHours()}${now.getMinutes()}`;

  XLSX.writeFile(wb, `${fileNamePrefix}_${timestamp}.xlsx`);
}
