import { getPricingPackageById, updatePricingPackage } from '@/app/actions/pricing'
import { PricingEditor } from '@/components/admin/PricingEditor'
import { notFound } from 'next/navigation'

export default async function EditPricingPackagePage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getPricingPackageById(params.id)

  if (!result.success || !result.package) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PricingEditor
        initialData={result.package}
        onSubmit={(data) => updatePricingPackage(params.id, data)}
        isEditing
      />
    </div>
  )
}
