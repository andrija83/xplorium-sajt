import { getPricingPackageById } from '@/app/actions/pricing'
import { PricingEditor } from '@/components/admin/PricingEditor'
import { notFound } from 'next/navigation'

export default async function EditPricingPackagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getPricingPackageById(id)

  if (!result.success || !result.package) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PricingEditor
        packageId={id}
        initialData={result.package}
        isEditing
      />
    </div>
  )
}
