"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline as UnderlineIcon, Link2, List, ListOrdered, Undo2, Redo2, Heading1, Heading2, Heading3, Save, Loader2, RotateCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { updateContent } from "@/app/actions/content"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

type RichTextEditorProps = {
  section: string
  initialContent: Record<string, unknown>
  fieldKey?: string
  label?: string
  description?: string
}

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "" }],
    },
  ],
}

const isValidDoc = (value: unknown): value is JSONContent => {
  return Boolean(
    value &&
    typeof value === "object" &&
    (value as any).type === "doc" &&
    Array.isArray((value as any).content),
  )
}

const sanitizeDoc = (value: JSONContent): JSONContent => {
  if (!isValidDoc(value)) return EMPTY_DOC

  const cleanNode = (node: any): any => {
    if (!node || typeof node !== "object") return null

    // Remove empty text nodes
    if (node.type === "text") {
      if (typeof node.text !== "string" || node.text.trim() === "") return null
      return { type: "text", text: node.text }
    }

    // Recurse children
    const cleanedChildren = Array.isArray(node.content)
      ? node.content.map(cleanNode).filter(Boolean)
      : []

    return {
      ...node,
      content: cleanedChildren,
    }
  }

  const cleaned = {
    type: "doc",
    content: Array.isArray(value.content) ? value.content.map(cleanNode).filter(Boolean) : [],
  } as JSONContent

  // If nothing valid remains, return a single paragraph with placeholder text
  if (!cleaned.content || cleaned.content.length === 0) {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: " " }],
        },
      ],
    }
  }

  return cleaned
}

const toJSONContent = (value: unknown): JSONContent => {
  if (!value) return EMPTY_DOC
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return isValidDoc(parsed) ? parsed : EMPTY_DOC
    } catch {
      return EMPTY_DOC
    }
  }
  if (isValidDoc(value)) return value
  return EMPTY_DOC
}

const toolbarButtonClasses =
  "h-9 w-9 inline-flex items-center justify-center rounded-md border border-cyan-400/40 bg-black/40 text-cyan-100 hover:bg-cyan-400/10 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60 disabled:cursor-not-allowed"

export function RichTextEditor({
  section,
  initialContent,
  fieldKey = "richText",
  label = "Content",
  description = "Edit the main content for this section",
}: RichTextEditorProps) {
  const initialDoc = useMemo(
    () => sanitizeDoc(toJSONContent((initialContent as any)?.[fieldKey])),
    [initialContent, fieldKey],
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto", "tel"],
      }),
    ],
    content: EMPTY_DOC,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[320px] p-4 bg-black/20 border border-cyan-400/30 rounded-md focus:outline-none",
      },
    },
    onUpdate: () => setIsDirty(true),
    immediatelyRender: false,
    enableContentCheck: true,
  })

  useEffect(() => {
    if (!editor) return
    try {
      editor.commands.setContent(initialDoc)
      setIsDirty(false)
    } catch (err) {
      logger.error("Failed to set editor content", err instanceof Error ? err : new Error(String(err)))
      editor.commands.setContent(EMPTY_DOC)
      setIsDirty(false)
    }
  }, [editor, initialDoc])

  const handleSave = useCallback(async () => {
    if (!editor) return
    try {
      setIsSaving(true)
      const nextContent = {
        ...initialContent,
        [fieldKey]: editor.getJSON(),
      }
      const result = await updateContent({ section: section as any, content: nextContent })
      if (result.success) {
        toast.success("Content updated successfully")
        setIsDirty(false)
      } else {
        toast.error(result.error || "Failed to update content")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }, [editor, fieldKey, initialContent, section])

  const handleReset = useCallback(() => {
    if (!editor) return
    editor.commands.setContent(initialDoc)
    editor.commands.focus("start")
    setIsDirty(false)
  }, [editor, initialDoc])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Enter URL", prev || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-100">{label}</p>
          <p className="text-xs text-cyan-100/60">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-400/10"
            disabled={!isDirty || isSaving}
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton
          icon={Bold}
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        />
        <ToolbarButton
          icon={UnderlineIcon}
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        />
        <Separator className="h-8 bg-cyan-400/40" orientation="vertical" />
        <ToolbarButton
          icon={Heading1}
          label="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        />
        <ToolbarButton
          icon={Heading2}
          label="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        />
        <ToolbarButton
          icon={Heading3}
          label="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        />
        <Separator className="h-8 bg-cyan-400/40" orientation="vertical" />
        <ToolbarButton
          icon={List}
          label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        />
        <ToolbarButton icon={Link2} label="Link" onClick={setLink} active={editor.isActive("link")} />
        <Separator className="h-8 bg-cyan-400/40" orientation="vertical" />
        <ToolbarButton icon={Undo2} label="Undo" onClick={() => editor.chain().focus().undo().run()} />
        <ToolbarButton icon={Redo2} label="Redo" onClick={() => editor.chain().focus().redo().run()} />
        <ToolbarButton
          icon={Trash2}
          label="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

type ToolbarButtonProps = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  active?: boolean
}

function ToolbarButton({ icon: Icon, label, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(toolbarButtonClasses, active && "border-cyan-300 bg-cyan-400/10 text-cyan-50")}
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
