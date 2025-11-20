import { getMaintenanceLogById } from '@/app/actions/maintenance'
import { MaintenanceEditor } from '@/components/admin/MaintenanceEditor'
import { notFound } from 'next/navigation'

export default async function EditMaintenanceLogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getMaintenanceLogById(id)

  if (!result.success || !result.log) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <MaintenanceEditor
        logId={id}
        initialData={result.log}
        isEditing
      />
    </div>
  )
}
