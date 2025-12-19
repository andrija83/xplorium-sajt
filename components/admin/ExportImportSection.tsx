'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { exportBookings, exportEvents, exportUsers, exportBackup } from '@/app/actions/export';
import { importBookings, importEvents, validateImportData } from '@/app/actions/import';
import {
  exportData,
  downloadBlob,
  importData,
  generateFilename,
  type ExportFormat,
  type DataType,
} from '@/lib/export-utils';
import { Download, Upload, FileDown, FileUp, Database, Calendar, Users, Package } from 'lucide-react';
import { logger } from '@/lib/logger';

export function ExportImportSection() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dataType, setDataType] = useState<DataType>('bookings');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Export handlers
  const handleExport = async () => {
    try {
      setIsExporting(true);

      let result;
      let title = '';

      switch (dataType) {
        case 'bookings':
          result = await exportBookings(startDate || undefined, endDate || undefined);
          title = 'Xplorium Bookings Export';
          break;
        case 'events':
          result = await exportEvents();
          title = 'Xplorium Events Export';
          break;
        case 'users':
          result = await exportUsers();
          title = 'Xplorium Users Export';
          break;
        case 'backup':
          result = await exportBackup();
          title = 'Xplorium Full Backup';
          break;
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'No data returned from export');
      }

      const filename = generateFilename(dataType, exportFormat);
      const blob = await exportData(exportFormat, {
        data: result.data as any[],
        filename,
        title,
      });

      downloadBlob(blob, filename);

      toast({
        title: 'Export Successful',
        description: `${dataType} data exported as ${exportFormat.toUpperCase()}`,
      });

      logger.info('Data exported', { dataType, format: exportFormat, filename });
    } catch (error) {
      logger.error('Export failed', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import handlers
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      // Determine format from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'json'].includes(extension || '')) {
        throw new Error('Unsupported file format. Please use CSV, XLSX, or JSON files.');
      }

      const format = extension as 'csv' | 'xlsx' | 'json';

      // Parse the file
      const parsedData = await importData(file, format);

      if (!parsedData || parsedData.length === 0) {
        throw new Error('No data found in file');
      }

      // Validate data format
      const validation = await validateImportData(
        parsedData,
        dataType === 'bookings' ? 'bookings' : 'events'
      );

      if (!validation.success) {
        throw new Error(validation.error || validation.errors?.join(', ') || 'Validation failed');
      }

      // Import data
      let result;
      if (dataType === 'bookings') {
        result = await importBookings(parsedData);
      } else if (dataType === 'events') {
        result = await importEvents(parsedData);
      } else {
        throw new Error('Import is only supported for bookings and events');
      }

      if (!result.success || !result.results) {
        throw new Error(result.error || 'No results returned from import');
      }

      const { results } = result;

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${results.success} records. ${
          results.failed > 0 ? `${results.failed} failed.` : ''
        }`,
        variant: results.failed > 0 ? 'default' : 'default',
      });

      if (results.errors && results.errors.length > 0) {
        logger.warn('Import completed with errors', {
          dataType,
          success: results.success,
          failed: results.failed,
          errors: results.errors.slice(0, 5), // Log first 5 errors
        });
      } else {
        logger.info('Import successful', {
          dataType,
          count: results.success,
        });
      }

      // Reset file input
      event.target.value = '';
    } catch (error) {
      logger.error('Import failed', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Export data in various formats (CSV, Excel, JSON, PDF)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Data Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="export-data-type">Data Type</Label>
              <Select value={dataType} onValueChange={(value) => setDataType(value as DataType)}>
                <SelectTrigger id="export-data-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookings">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Bookings
                    </div>
                  </SelectItem>
                  <SelectItem value="events">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Events
                    </div>
                  </SelectItem>
                  <SelectItem value="users">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Users
                    </div>
                  </SelectItem>
                  <SelectItem value="backup">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Full Backup
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filter (for bookings) */}
          {dataType === 'bookings' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date (Optional)</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import data from CSV, Excel, or JSON files (Bookings and Events only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-data-type">Data Type</Label>
            <Select value={dataType} onValueChange={(value) => setDataType(value as DataType)}>
              <SelectTrigger id="import-data-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookings">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Bookings
                  </div>
                </SelectItem>
                <SelectItem value="events">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Events
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-file">Select File</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileImport}
              disabled={isImporting}
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: CSV, XLSX, JSON
            </p>
          </div>

          {isImporting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileUp className="h-4 w-4 animate-pulse" />
              Importing data...
            </div>
          )}

          {/* Import Requirements */}
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="font-medium text-sm">Required Fields:</h4>
            {dataType === 'bookings' && (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Date</li>
                <li>Time Slot</li>
                <li>User Email (must exist in system)</li>
                <li>Number of Children</li>
                <li>Number of Adults</li>
                <li>Total Price</li>
              </ul>
            )}
            {dataType === 'events' && (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Title</li>
                <li>Start Date</li>
                <li>Type (CAMPAIGN or EVENT)</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Export Templates</CardTitle>
          <CardDescription>
            Download empty templates for importing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              const template = [
                {
                  Date: '2025-01-15',
                  'Time Slot': '10:00-12:00',
                  'Number of Children': 2,
                  'Number of Adults': 1,
                  'Total Price': 2000,
                  'User Email': 'example@email.com',
                  'Special Requests': '',
                },
              ];
              const blob = await exportData('csv', {
                data: template,
                filename: 'bookings-template.csv',
              });
              downloadBlob(blob, 'xplorium-bookings-template.csv');
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download Bookings Template (CSV)
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              const template = [
                {
                  Title: 'Example Event',
                  Description: 'Event description here',
                  'Start Date': '2025-01-15 10:00:00',
                  'End Date': '2025-01-15 18:00:00',
                  Type: 'EVENT',
                  'Image URL': '',
                },
              ];
              const blob = await exportData('csv', {
                data: template,
                filename: 'events-template.csv',
              });
              downloadBlob(blob, 'xplorium-events-template.csv');
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download Events Template (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
