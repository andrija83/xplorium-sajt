"use client"

import { useTransition } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { publishContent, revertContentVersion } from "@/app/actions/content"
import { toast } from "sonner"
import { Loader2, RotateCcw, Send } from "lucide-react"

type Version = {
  id: string
  version: number
  status: string
  createdAt: string | Date
  createdBy?: string | null
}

type VersionHistoryProps = {
  section: string
  versions: Version[]
}

export function VersionHistory({ section, versions }: VersionHistoryProps) {
  const [isPending, startTransition] = useTransition()

  const handlePublish = () => {
    startTransition(async () => {
      const res = await publishContent(section as any)
      if (res.success) {
        toast.success("Published successfully")
        window.location.reload()
      } else {
        toast.error(res.error || "Failed to publish")
      }
    })
  }

  const handleRollback = (version: number) => {
    startTransition(async () => {
      const res = await revertContentVersion(section as any, version)
      if (res.success) {
        toast.success(`Rolled back to version ${version}`)
        window.location.reload()
      } else {
        toast.error(res.error || "Failed to roll back")
      }
    })
  }

  return (
    <Card className="bg-black/15 border-cyan-400/20 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-cyan-100">Version History</CardTitle>
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={handlePublish}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Publish current
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {versions.length === 0 && (
          <p className="text-sm text-cyan-100/60">No versions yet. Save to create a version.</p>
        )}
        {versions.map((version) => (
          <div
            key={version.id}
            className="flex items-center justify-between rounded-md border border-cyan-400/20 bg-black/20 px-3 py-2"
          >
            <div>
              <p className="text-sm text-cyan-50">Version {version.version} • {version.status}</p>
              <p className="text-xs text-cyan-100/60">
                {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-cyan-200 hover:text-white hover:bg-cyan-400/10"
              onClick={() => handleRollback(version.version)}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Rollback
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
