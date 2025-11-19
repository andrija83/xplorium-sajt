import { getContentBySection } from "@/app/actions/content"
import { JsonEditor } from "@/components/admin/JsonEditor"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PageProps {
    params: Promise<{
        section: string
    }>
}

const SECTION_TITLES: Record<string, string> = {
    cafe: "Cafe & Lounge",
    sensory: "Sensory Room",
    igraonica: "Playground",
}

export default async function ContentEditorPage({ params }: PageProps) {
    const { section } = await params

    if (!['cafe', 'sensory', 'igraonica'].includes(section)) {
        notFound()
    }

    const result = await getContentBySection(section as any)
    const initialContent = result.success && result.content ? result.content.content : {}

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/content">
                    <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-cyan-400">
                        Edit {SECTION_TITLES[section] || section} Content
                    </h1>
                    <p className="text-sm text-cyan-100/60">
                        Edit the raw JSON content for this section
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
                <JsonEditor section={section} initialContent={initialContent} />
            </div>
        </div>
    )
}
