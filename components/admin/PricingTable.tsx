'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePricingPackage } from '@/app/actions/pricing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

interface PricingPackage {
  id: string
  name: string
  price: string
  category: string
  popular: boolean
  status: string
  createdAt: Date
}

interface PricingTableProps {
  packages: PricingPackage[]
}

export function PricingTable({ packages }: PricingTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      setIsDeleting(id)
      const result = await deletePricingPackage(id)

      if (result.success) {
        toast.success('Package deleted successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete package')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsDeleting(null)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      PLAYGROUND: 'Igraonica',
      SENSORY_ROOM: 'Sensory Room',
      CAFE: 'Café',
      PARTY: 'Rođendan',
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
        <Input
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-cyan-400/20 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyan-400/20 bg-cyan-400/5">
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-300">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-300">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-300">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-300">
                  Popular
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-cyan-300">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-cyan-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/60">
                    {searchTerm ? 'No packages found' : 'No packages yet'}
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white/90">{pkg.name}</td>
                    <td className="px-6 py-4 text-white/90 font-medium">
                      {pkg.price}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {getCategoryLabel(pkg.category)}
                    </td>
                    <td className="px-6 py-4">
                      {pkg.popular ? (
                        <span className="text-yellow-400">⭐ Yes</span>
                      ) : (
                        <span className="text-white/40">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          pkg.status === 'PUBLISHED'
                            ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                            : pkg.status === 'DRAFT'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                        }`}
                      >
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/pricing/${pkg.id}/edit`)
                          }
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pkg.id, pkg.name)}
                          disabled={isDeleting === pkg.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          {isDeleting === pkg.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-white/60">
        Showing {filteredPackages.length} of {packages.length} packages
      </div>
    </div>
  )
}
