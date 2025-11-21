"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { updateContent } from "@/app/actions/content"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save } from "lucide-react"

type SeoImage = {
  url?: string
  alt?: string
  width?: number
  height?: number
}

type SeoData = {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  canonicalUrl?: string
  robots?: {
    noindex?: boolean
    nofollow?: boolean
  }
  ogImage?: SeoImage
}

type SeoSettingsProps = {
  section: string
  initialContent: Record<string, unknown>
}

export function SeoSettings({ section, initialContent }: SeoSettingsProps) {
  const initialSeo = useMemo(() => (initialContent.seo as SeoData) || {}, [initialContent])
  const [metaTitle, setMetaTitle] = useState(initialSeo.metaTitle || "")
  const [metaDescription, setMetaDescription] = useState(initialSeo.metaDescription || "")
  const [keywords, setKeywords] = useState((initialSeo.keywords || []).join(", "))
  const [ogTitle, setOgTitle] = useState(initialSeo.ogTitle || "")
  const [ogDescription, setOgDescription] = useState(initialSeo.ogDescription || "")
  const [canonicalUrl, setCanonicalUrl] = useState(initialSeo.canonicalUrl || "")
  const [noindex, setNoindex] = useState(Boolean(initialSeo.robots?.noindex))
  const [nofollow, setNofollow] = useState(Boolean(initialSeo.robots?.nofollow))
  const [ogImage, setOgImage] = useState<SeoImage>(initialSeo.ogImage || {})
  const [isSaving, setIsSaving] = useState(false)

  const parsedKeywords = useMemo(
    () =>
      keywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean),
    [keywords],
  )

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const nextContent = {
        ...initialContent,
        seo: {
          metaTitle,
          metaDescription,
          keywords: parsedKeywords,
          ogTitle,
          ogDescription,
          canonicalUrl,
          robots: { noindex, nofollow },
          ogImage,
        } as SeoData,
      }

      const result = await updateContent({ section: section as any, content: nextContent })
      if (result.success) {
        toast.success("SEO settings saved")
      } else {
        toast.error(result.error || "Failed to save SEO settings")
      }
    } catch (err) {
      toast.error("An error occurred while saving SEO settings")
    } finally {
      setIsSaving(false)
    }
  }, [
    canonicalUrl,
    initialContent,
    metaDescription,
    metaTitle,
    nofollow,
    noindex,
    ogDescription,
    ogImage,
    ogTitle,
    parsedKeywords,
    section,
  ])

  return (
    <Card className="bg-black/20 border-cyan-400/20 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-cyan-100">SEO Settings</CardTitle>
          <p className="text-sm text-cyan-100/60">
            Per-section meta tags, Open Graph, and crawl settings
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save SEO
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-cyan-300">Meta Title</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={60}
              placeholder="Up to 60 characters"
              className="bg-black/40 border-cyan-400/30 text-white"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-cyan-300">Meta Description</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              placeholder="120–160 characters recommended"
              className="bg-black/40 border-cyan-400/30 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-cyan-300">Keywords</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="comma,separated,keywords"
              className="bg-black/40 border-cyan-400/30 text-white"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-cyan-300">Canonical URL</Label>
            <Input
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://xplorium.com/..."
              className="bg-black/40 border-cyan-400/30 text-white"
            />
          </div>
        </div>

        <Separator className="bg-cyan-400/20" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-cyan-300">Open Graph Title</Label>
            <Input
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Defaults to meta title if empty"
              className="bg-black/40 border-cyan-400/30 text-white"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-cyan-300">Open Graph Description</Label>
            <Textarea
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Defaults to meta description if empty"
              className="bg-black/40 border-cyan-400/30 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            <Label className="text-cyan-300">Open Graph Image</Label>
            <ImageUpload
              value={ogImage.url || ""}
              onChange={(url) => setOgImage((prev) => ({ ...prev, url }))}
              onUploadInfo={(info) => setOgImage({ url: info.url, width: info.width, height: info.height })}
            />
            <Input
              value={ogImage.alt || ""}
              onChange={(e) => setOgImage((prev) => ({ ...prev, alt: e.target.value }))}
              placeholder="Alt text (required for accessibility)"
              className="bg-black/40 border-cyan-400/30 text-white"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-cyan-300">Robots</Label>
            <div className="flex items-center gap-3">
              <Switch checked={noindex} onCheckedChange={setNoindex} />
              <span className="text-sm text-cyan-100/80">noindex</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={nofollow} onCheckedChange={setNofollow} />
              <span className="text-sm text-cyan-100/80">nofollow</span>
            </div>
          </div>
        </div>

        <Separator className="bg-cyan-400/20" />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-cyan-100">SERP Preview</p>
          <div className="rounded-md border border-cyan-400/20 bg-black/30 p-3">
            <p className="text-indigo-300 text-base line-clamp-1">{metaTitle || ogTitle || "Page title"}</p>
            <p className="text-green-400 text-xs">{canonicalUrl || "https://xplorium.com/section"}</p>
            <p className="text-white/70 text-sm line-clamp-2 mt-1">
              {metaDescription || ogDescription || "Meta description preview will appear here."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
