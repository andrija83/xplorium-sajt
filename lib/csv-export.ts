/**
 * CSV Export Utility
 *
 * Provides functions to convert data to CSV format and trigger downloads
 */

/**
 * Convert array of objects to CSV string
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers (defaults to object keys)
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[]
): string {
  if (!data || data.length === 0) {
    return ''
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0])

  // Create header row
  const headerRow = csvHeaders.join(',')

  // Create data rows
  const dataRows = data.map((row) => {
    return csvHeaders
      .map((header) => {
        const value = row[header]

        // Handle different value types
        if (value === null || value === undefined) {
          return ''
        }

        // Convert dates to ISO string
        if (value instanceof Date) {
          return value.toISOString()
        }

        // Escape and quote strings that contain commas, quotes, or newlines
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }

        return stringValue
      })
      .join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Download CSV file in browser
 * @param csvContent - CSV string content
 * @param filename - Name of file to download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}

/**
 * Format date for CSV export
 * @param date - Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForCSV(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Format date and time for CSV export
 * @param date - Date to format
 * @returns Formatted datetime string (YYYY-MM-DD HH:MM:SS)
 */
export function formatDateTimeForCSV(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Generate filename with timestamp
 * @param prefix - Filename prefix (e.g., 'bookings', 'users')
 * @param extension - File extension (default: 'csv')
 * @returns Filename with timestamp
 */
export function generateFilename(prefix: string, extension = 'csv'): string {
  const now = new Date()
  const timestamp = formatDateTimeForCSV(now).replace(/[: ]/g, '-')
  return `${prefix}_${timestamp}.${extension}`
}

/**
 * Sanitize data for CSV export
 * Removes internal IDs, sensitive data, and formats dates
 * @param data - Data to sanitize
 * @param fieldsToRemove - Fields to exclude from export
 * @returns Sanitized data
 */
export function sanitizeForExport<T extends Record<string, unknown>>(
  data: T[],
  fieldsToRemove: string[] = []
): Partial<T>[] {
  const defaultFieldsToRemove = ['password', 'passwordHash', ...fieldsToRemove]

  return data.map((item) => {
    const sanitized = { ...item }

    // Remove specified fields
    defaultFieldsToRemove.forEach((field) => {
      delete sanitized[field]
    })

    return sanitized
  })
}
