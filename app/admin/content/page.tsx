import { getAllContent } from "@/app/actions/content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, Coffee, Sparkles, Gamepad2 } from "lucide-react"

const SECTIONS = {
  cafe: {
    title: "Cafe & Lounge",
    description: "Manage menu items, opening hours, and cafe details",
    icon: Coffee,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  sensory: {
    title: "Sensory Room",
    description: "Update equipment list, benefits, and room information",
    icon: Sparkles,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  igraonica: {
    title: "Playground",
    description: "Manage play areas, rules, and pricing",
    icon: Gamepad2,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
}

export default async function ContentPage() {
  const result = await getAllContent()
  const contentMap = new Map(result.content?.map(c => [c.section, c]) || [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cyan-400">Content Management</h1>
        <p className="text-sm text-cyan-100/60 mt-1">
          Manage website content for different sections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(SECTIONS).map(([key, config]) => {
          const Icon = config.icon
          const content = contentMap.get(key)

          return (
            <Card key={key} className="bg-black/20 border-cyan-400/20 backdrop-blur-sm hover:bg-cyan-400/5 transition-colors">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <CardTitle className="text-cyan-100">{config.title}</CardTitle>
                <CardDescription className="text-cyan-100/50">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-cyan-100/40 mb-4">
                  <span>Last updated:</span>
                  <span>
                    {content ? new Date(content.updatedAt).toLocaleDateString() : "Never"}
                  </span>
                </div>
                <Link href={`/admin/content/${key}`}>
                  <Button className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Content
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
