import { getInventoryItemById } from '@/app/actions/inventory'
import { InventoryEditor } from '@/components/admin/InventoryEditor'
import { notFound } from 'next/navigation'

export default async function EditInventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getInventoryItemById(id)

  if (!result.success || !result.item) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <InventoryEditor
        itemId={id}
        initialData={result.item}
        isEditing
      />
    </div>
  )
}
