"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPricingSchema, type CreatePricingInput } from "@/lib/validations/pricing"
import { createPricingPackage, updatePricingPackage } from "@/app/actions/pricing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, ArrowLeft, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PricingEditorProps {
    packageId?: string
    initialData?: any
    isEditing?: boolean
}

export function PricingEditor({ packageId, initialData, isEditing = false }: PricingEditorProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [features, setFeatures] = useState<string[]>(
        initialData?.features || [""]
    )

    const form = useForm<CreatePricingInput>({
        resolver: zodResolver(createPricingSchema),
        defaultValues: {
            name: initialData?.name || "",
            price: initialData?.price || "",
            category: initialData?.category || "PLAYGROUND",
            popular: initialData?.popular || false,
            features: initialData?.features || [],
            description: initialData?.description || "",
            status: initialData?.status || "PUBLISHED",
        },
    })

    const handleSubmit = async (data: CreatePricingInput) => {
        try {
            setIsSubmitting(true)

            // Filter out empty features
            const filteredFeatures = features.filter(f => f.trim() !== "")

            // Validate features
            if (filteredFeatures.length === 0) {
                toast.error("Please add at least one feature")
                setIsSubmitting(false)
                return
            }

            const submitData = {
                ...data,
                features: filteredFeatures,
            }

            // Call the appropriate server action
            const result = isEditing && packageId
                ? await updatePricingPackage(packageId, submitData)
                : await createPricingPackage(submitData)

            if (result.success) {
                toast.success(isEditing ? "Package updated successfully" : "Package created successfully")
                router.push("/admin/pricing")
                router.refresh()
            } else {
                toast.error(result.error || "Something went wrong")
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error("An error occurred: " + (error instanceof Error ? error.message : String(error)))
        } finally {
            setIsSubmitting(false)
        }
    }

    const addFeature = () => {
        const newFeatures = [...features, ""]
        setFeatures(newFeatures)
        // Update form field as well
        form.setValue('features', newFeatures.filter(f => f.trim() !== ''))
    }

    const removeFeature = (index: number) => {
        const newFeatures = features.filter((_, i) => i !== index)
        setFeatures(newFeatures)
        // Update form field as well
        form.setValue('features', newFeatures.filter(f => f.trim() !== ''))
    }

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...features]
        newFeatures[index] = value
        setFeatures(newFeatures)
        // Update form field as well
        form.setValue('features', newFeatures.filter(f => f.trim() !== ''))
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold text-cyan-400">
                            {isEditing ? "Edit Package" : "Create New Package"}
                        </h1>
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isEditing ? "Update Package" : "Create Package"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Package Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. 1 Sat Igre"
                                                className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. 500 RSD"
                                                className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-cyan-100/40">
                                            Include currency (e.g. RSD, EUR, USD)
                                        </FormDescription>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Additional details about this package..."
                                                className="min-h-[100px] bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-cyan-300">Features</FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addFeature}
                                        className="text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Feature
                                    </Button>
                                </div>

                                {features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                            placeholder={`Feature ${index + 1}`}
                                            className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                        />
                                        {features.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFeature(index)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <FormDescription className="text-cyan-100/40">
                                    List the benefits and features included in this package
                                </FormDescription>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">Draft</SelectItem>
                                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PLAYGROUND">Playground (Igraonica)</SelectItem>
                                                <SelectItem value="SENSORY_ROOM">Sensory Room</SelectItem>
                                                <SelectItem value="CAFE">Cafe</SelectItem>
                                                <SelectItem value="PARTY">Party (Rođendan)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="popular"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-cyan-400/20 p-4 bg-black/20">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="border-cyan-400/40 data-[state=checked]:bg-cyan-500"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-cyan-300">
                                                Mark as Popular
                                            </FormLabel>
                                            <FormDescription className="text-cyan-100/40">
                                                This package will be highlighted with a badge
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
