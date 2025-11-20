import { PricingEditor } from '@/components/admin/PricingEditor'
import { createPricingPackage } from '@/app/actions/pricing'

export default function NewPricingPackagePage() {
  return (
    <div className="space-y-6">
      <PricingEditor onSubmit={createPricingPackage} />
    </div>
  )
}
