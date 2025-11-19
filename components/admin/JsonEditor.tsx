"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react"
import { updateContent } from "@/app/actions/content"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface JsonEditorProps {
    section: string
    initialContent: any
}

export function JsonEditor({ section, initialContent }: JsonEditorProps) {
    const [value, setValue] = useState(JSON.stringify(initialContent, null, 2))
    const [isValid, setIsValid] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        try {
            JSON.parse(value)
            setIsValid(true)
        } catch (e) {
            setIsValid(false)
        }
    }, [value])

    const handleSave = async () => {
        if (!isValid) {
            toast.error("Invalid JSON")
            return
        }

        try {
            setIsSaving(true)
            const content = JSON.parse(value)
            const result = await updateContent({ section: section as any, content })

            if (result.success) {
                toast.success("Content updated successfully")
            } else {
                toast.error(result.error || "Failed to update content")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isValid ? (
                        <div className="flex items-center text-green-400 text-sm">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Valid JSON
                        </div>
                    ) : (
                        <div className="flex items-center text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Invalid JSON
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!isValid || isSaving}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>

            <div className="relative">
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={cn(
                        "font-mono text-sm min-h-[600px] bg-black/40 border-cyan-400/30 text-cyan-100 focus:border-cyan-400",
                        !isValid && "border-red-400/50 focus:border-red-400"
                    )}
                    spellCheck={false}
                />
            </div>
        </div>
    )
}
