"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createInventorySchema, type CreateInventoryInput } from "@/lib/validations/inventory"
import { createInventoryItem, updateInventoryItem } from "@/app/actions/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface InventoryEditorProps {
    itemId?: string
    initialData?: any
    isEditing?: boolean
}

export function InventoryEditor({ itemId, initialData, isEditing = false }: InventoryEditorProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CreateInventoryInput>({
        resolver: zodResolver(createInventorySchema),
        defaultValues: {
            name: initialData?.name || "",
            category: initialData?.category || "GENERAL",
            quantity: initialData?.quantity || 0,
            unit: initialData?.unit || "",
            reorderPoint: initialData?.reorderPoint || 10,
            supplierName: initialData?.supplierName || "",
            supplierContact: initialData?.supplierContact || "",
            lastRestocked: initialData?.lastRestocked ? new Date(initialData.lastRestocked) : null,
            notes: initialData?.notes || "",
        },
    })

    const handleSubmit = async (data: CreateInventoryInput) => {
        try {
            setIsSubmitting(true)

            const result = isEditing && itemId
                ? await updateInventoryItem(itemId, data)
                : await createInventoryItem(data)

            if (result.success) {
                toast.success(isEditing ? "Item updated successfully" : "Item added successfully")
                router.push("/admin/inventory")
                router.refresh()
            } else {
                toast.error(result.error || "Something went wrong")
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()} className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold text-cyan-400">
                            {isEditing ? "Edit Inventory Item" : "Add Inventory Item"}
                        </h1>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isEditing ? "Update Item" : "Add Item"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300">Item Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Coffee Beans, Paper Towels" className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400" />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="quantity" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Current Quantity</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400" />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="unit" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Unit</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. kg, liters, pieces" className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400" />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="reorderPoint" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300">Reorder Point</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value) || 10)} className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400" />
                                    </FormControl>
                                    <FormDescription className="text-cyan-100/40">
                                        Alert when stock reaches this level
                                    </FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="supplierName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Supplier Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ""} placeholder="Supplier name" className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400" />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="supplierContact" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Supplier Contact (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ""} placeholder="Phone or email" className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400" />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300">Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={field.value || ""} placeholder="Additional information..." className="min-h-[100px] bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400" />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-6">
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300">Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CAFE">Cafe</SelectItem>
                                            <SelectItem value="PLAYGROUND">Playground</SelectItem>
                                            <SelectItem value="SENSORY_ROOM">Sensory Room</SelectItem>
                                            <SelectItem value="PARTY_SUPPLIES">Party Supplies</SelectItem>
                                            <SelectItem value="CLEANING">Cleaning</SelectItem>
                                            <SelectItem value="GENERAL">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
