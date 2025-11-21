"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { X, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    disabled?: boolean
    onUploadInfo?: (info: { url: string; width: number; height: number }) => void
}

const MAX_FILE_SIZE_MB = 4

export function ImageUpload({ value, onChange, disabled, onUploadInfo }: ImageUploadProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleRemove = () => {
        onChange("")
    }

    if (value) {
        return (
            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-cyan-400/20 group">
                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className="object-cover"
                />
                <div className="absolute top-2 right-2 z-10">
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={disabled || isDeleting}
                        className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <X className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">Current Image</p>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "w-full rounded-xl border border-dashed border-cyan-400/30 bg-black/20 hover:bg-cyan-400/5 transition-colors overflow-hidden",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}>
            <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                    const url = res?.[0].url
                    if (!url) {
                        toast.error("Upload failed: no URL returned")
                        return
                    }

                    // capture dimensions for downstream SEO/OG usage
                    if (onUploadInfo) {
                        const img = new window.Image()
                        img.src = url
                        img.onload = () => {
                            onUploadInfo({ url, width: img.width, height: img.height })
                        }
                    }

                    onChange(url)
                    toast.success("Image uploaded successfully")
                }}
                onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`)
                }}
                appearance={{
                    button: "bg-cyan-500 hover:bg-cyan-600 text-white",
                    label: "text-cyan-400 hover:text-cyan-300",
                    allowedContent: "text-cyan-100/50",
                    container: "border-none",
                }}
                content={{
                    uploadIcon: <ImageIcon className="w-10 h-10 text-cyan-400/50 mb-2" />,
                    label: "Drag & drop or click to upload",
                    allowedContent: `Images only • Max ${MAX_FILE_SIZE_MB}MB`,
                }}
            />
        </div>
    )
}
