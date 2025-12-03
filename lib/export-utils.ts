import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';
export type DataType = 'bookings' | 'events' | 'users' | 'backup';

interface ExportData {
  data: any[];
  filename: string;
  headers?: string[];
  title?: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(exportData: ExportData): Blob {
  const { data, headers } = exportData;

  const csv = Papa.unparse(data, {
    columns: headers,
    header: true,
  });

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Export data to Excel (XLSX) format
 */
export function exportToExcel(exportData: ExportData): Blob {
  const { data, filename } = exportData;

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    ) + 2
  }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Export data to JSON format
 */
export function exportToJSON(exportData: ExportData): Blob {
  const { data } = exportData;

  const json = JSON.stringify(data, null, 2);

  return new Blob([json], { type: 'application/json;charset=utf-8;' });
}

/**
 * Export data to PDF format
 */
export function exportToPDF(exportData: ExportData): Blob {
  const { data, title, headers } = exportData;

  const doc = new jsPDF();

  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }

  // Prepare table data
  const tableHeaders = headers || Object.keys(data[0] || {});
  const tableData = data.map(row =>
    tableHeaders.map(header => String(row[header] || ''))
  );

  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: title ? 25 : 15,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 211, 238] }, // Cyan color matching Xplorium theme
  });

  return doc.output('blob');
}

/**
 * Main export function that routes to the appropriate exporter
 */
export function exportData(
  format: ExportFormat,
  exportData: ExportData
): Blob {
  switch (format) {
    case 'csv':
      return exportToCSV(exportData);
    case 'xlsx':
      return exportToExcel(exportData);
    case 'json':
      return exportToJSON(exportData);
    case 'pdf':
      return exportToPDF(exportData);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Trigger download of a blob with a given filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV file to JSON
 */
export function parseCSV<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parse Excel file to JSON
 */
export async function parseExcel<T = any>(file: File): Promise<T[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet) as T[];
}

/**
 * Parse JSON file
 */
export async function parseJSON<T = any>(file: File): Promise<T[]> {
  const text = await file.text();
  return JSON.parse(text);
}

/**
 * Main import function that routes to the appropriate parser
 */
export async function importData<T = any>(
  file: File,
  format: 'csv' | 'xlsx' | 'json'
): Promise<T[]> {
  switch (format) {
    case 'csv':
      return parseCSV<T>(file);
    case 'xlsx':
      return parseExcel<T>(file);
    case 'json':
      return parseJSON<T>(file);
    default:
      throw new Error(`Unsupported import format: ${format}`);
  }
}

/**
 * Format date for export
 */
export function formatExportDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format datetime for export
 */
export function formatExportDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  const extensions: Record<ExportFormat, string> = {
    csv: 'csv',
    xlsx: 'xlsx',
    json: 'json',
    pdf: 'pdf',
  };
  return extensions[format];
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  dataType: DataType,
  format: ExportFormat
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = getFileExtension(format);
  return `xplorium-${dataType}-${timestamp}.${extension}`;
}
