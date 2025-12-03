'use client';

import { motion } from 'framer-motion';
import { ExportImportSection } from '@/components/admin/ExportImportSection';

/**
 * Export/Import Admin Page
 *
 * Provides comprehensive export and import functionality for:
 * - Bookings data with date range filtering
 * - Events and campaigns
 * - User data (excluding sensitive info)
 * - Full database backups
 *
 * Supported formats:
 * - CSV (Comma Separated Values)
 * - XLSX (Excel)
 * - JSON (JavaScript Object Notation)
 * - PDF (Portable Document Format)
 */

export default function ExportImportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="text-3xl font-bold text-cyan-400 mb-2"
          style={{
            textShadow: '0 0 30px rgba(34, 211, 238, 0.6)',
          }}
        >
          Export / Import Data
        </h1>
        <p className="text-cyan-100/60">
          Export data in multiple formats or import data from CSV, Excel, or JSON files
        </p>
      </motion.div>

      {/* Export/Import Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ExportImportSection />
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        style={{
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h3 className="text-lg font-semibold text-cyan-300 mb-4">
          Export/Import Guidelines
        </h3>
        <div className="space-y-4 text-sm text-cyan-100/70">
          <div>
            <h4 className="font-medium text-cyan-200 mb-2">Exporting Data:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Choose the data type you want to export (Bookings, Events, Users, or Full Backup)</li>
              <li>Select your preferred format (CSV, Excel, JSON, or PDF)</li>
              <li>For bookings, optionally filter by date range</li>
              <li>Click "Export Data" to download the file</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-cyan-200 mb-2">Importing Data:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Download a template file to see the required format</li>
              <li>Fill in your data following the exact column names</li>
              <li>For bookings, ensure the user email exists in the system</li>
              <li>For events, type must be either "CAMPAIGN" or "EVENT"</li>
              <li>Upload your file and the system will validate before importing</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-cyan-200 mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Full backups are exported in JSON format only</li>
              <li>User exports exclude sensitive data like passwords</li>
              <li>Import validation will report errors before any data is saved</li>
              <li>Large imports may take a few moments to process</li>
              <li>All admin actions are logged in the audit log</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
