import { getContentBySection } from "@/app/actions/content"
import { JsonEditor } from "@/components/admin/JsonEditor"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
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
    const initialContent = (result.success && result.content ? result.content.content : {}) as Record<string, unknown>

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
                        Manage structured content for this section
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20">
                    <RichTextEditor
                        section={section}
                        initialContent={initialContent}
                        fieldKey="richText"
                        label="Rich Text Content"
                        description="Use the editor for main page copy. Saved as structured JSON (TipTap)."
                    />
                </div>

                <div className="p-6 rounded-xl bg-black/10 backdrop-blur-sm border border-cyan-400/10">
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold text-cyan-100">Advanced: Raw JSON</h2>
                        <p className="text-xs text-cyan-100/60">
                            Directly edit the underlying JSON stored for this section. Useful for advanced fields or structured data.
                        </p>
                    </div>
                    <JsonEditor section={section} initialContent={initialContent} />
                </div>
            </div>
        </div>
    )
}
