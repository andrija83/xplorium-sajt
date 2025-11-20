import { getPricingPackages } from '@/app/actions/pricing'
import { PricingTable } from '@/components/admin/PricingTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPricingPage() {
  const { packages } = await getPricingPackages({})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Pricing Packages</h1>
          <p className="text-white/70 mt-2">
            Manage pricing packages for Cafe, Playground, Sensory Room, and Parties
          </p>
        </div>
        <Link href="/admin/pricing/new">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Package
          </Button>
        </Link>
      </div>

      <PricingTable packages={packages || []} />

      {(!packages || packages.length === 0) && (
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">No pricing packages yet</p>
          <Link href="/admin/pricing/new">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create First Package
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
