'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { convertToCSV, downloadCSV, generateFilename } from '@/lib/csv-export'
import { useToast } from '@/hooks/use-toast'

interface ExportButtonProps {
  /**
   * Function that fetches data to export
   * Should return { success: boolean, data: any[], error?: string }
   */
  onExport: () => Promise<{ success: boolean; data?: any[]; error?: string; count?: number }>
  /**
   * Filename prefix (e.g., 'bookings', 'users')
   */
  filename: string
  /**
   * Button label
   */
  label?: string
  /**
   * Button variant
   */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  /**
   * Button size
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /**
   * Additional class name
   */
  className?: string
  /**
   * Show icon
   */
  showIcon?: boolean
}

export function ExportButton({
  onExport,
  filename,
  label = 'Export CSV',
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Fetch data
      const result = await onExport()

      if (!result.success || !result.data) {
        toast({
          title: 'Export Failed',
          description: result.error || 'Failed to export data',
          variant: 'destructive',
        })
        return
      }

      if (result.data.length === 0) {
        toast({
          title: 'No Data',
          description: 'There is no data to export',
          variant: 'default',
        })
        return
      }

      // Convert to CSV
      const csvContent = convertToCSV(result.data)

      // Download
      const csvFilename = generateFilename(filename)
      downloadCSV(csvContent, csvFilename)

      toast({
        title: 'Export Successful',
        description: `Exported ${result.count || result.data.length} records to ${csvFilename}`,
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <Download className="w-4 h-4 mr-2" />}
      {isExporting ? 'Exporting...' : label}
    </Button>
  )
}
