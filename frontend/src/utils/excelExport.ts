import * as XLSX from "xlsx";

export interface ExcelInterviewRow {
  Username: string;
  Email: string;
  "Interview Domain": string;
  Difficulty: string;
  Score: string | number;
  Percentage: string;
  Date: string;
  Duration: string;
  "AI Overall Feedback"?: string;
  "Strengths"?: string;
  "Areas for Improvement"?: string;
}

/**
 * Export interview records array to formatted Excel file (.xlsx)
 */
export function exportInterviewsToExcel(
  records: ExcelInterviewRow[],
  filename: string = "Interview_Results.xlsx"
) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(records);

    // Auto-fit column widths for clear presentation
    const columnWidths = [
      { wch: 22 }, // Username
      { wch: 28 }, // Email
      { wch: 30 }, // Interview Domain
      { wch: 14 }, // Difficulty
      { wch: 10 }, // Score
      { wch: 12 }, // Percentage
      { wch: 18 }, // Date
      { wch: 14 }, // Duration
      { wch: 45 }, // Feedback
      { wch: 40 }, // Strengths
      { wch: 40 }, // Areas for Improvement
    ];
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Interview Results");

    XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
  } catch (error) {
    console.error("[ExcelExport] Failed to generate Excel file:", error);
    // Fallback to native CSV download if xlsx binary stream is interrupted
    downloadCSV(records, filename.replace(/\.xlsx$/, ".csv"));
  }
}

function downloadCSV(records: ExcelInterviewRow[], filename: string) {
  if (!records || !records.length) return;
  const headers = Object.keys(records[0]).join(",");
  const rows = records.map((r) =>
    Object.values(r)
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
