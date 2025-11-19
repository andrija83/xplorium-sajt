"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createEventSchema, type CreateEventInput } from "@/lib/validations"
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
import { ImageUpload } from "@/components/admin/ImageUpload"
import { Loader2, Save, ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface EventEditorProps {
    initialData?: any
    onSubmit: (data: any) => Promise<any>
    isEditing?: boolean
}

export function EventEditor({ initialData, onSubmit, isEditing = false }: EventEditorProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CreateEventInput>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            date: initialData?.date ? new Date(initialData.date) : new Date(),
            time: initialData?.time || "12:00",
            category: initialData?.category || "",
            image: initialData?.image || "",
            status: initialData?.status || "DRAFT",
        },
    })

    // Auto-generate slug from title if not editing and slug is empty
    const title = form.watch("title")
    useEffect(() => {
        if (!isEditing && title && !form.getValues("slug")) {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "")
            form.setValue("slug", slug)
        }
    }, [title, isEditing, form])

    const handleSubmit = async (data: CreateEventInput) => {
        try {
            setIsSubmitting(true)
            const result = await onSubmit(data)

            if (result.success) {
                toast.success(isEditing ? "Event updated successfully" : "Event created successfully")
                router.push("/admin/events")
            } else {
                toast.error(result.error || "Something went wrong")
            }
        } catch (error) {
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
                            {isEditing ? "Edit Event" : "Create New Event"}
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
                        {isEditing ? "Update Event" : "Create Event"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Event Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Summer Workshop"
                                                className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Slug</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. summer-workshop"
                                                className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-cyan-100/40">
                                            URL-friendly version of the title. Must be unique.
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
                                        <FormLabel className="text-cyan-300">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Event details..."
                                                className="min-h-[200px] bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />
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
                                                <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                                <SelectItem value="PARTY">Party</SelectItem>
                                                <SelectItem value="EDUCATION">Education</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-cyan-300">Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal bg-black/40 border-cyan-400/30 text-white hover:bg-cyan-400/10 hover:text-cyan-300",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Time</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                                                <Input
                                                    {...field}
                                                    type="time"
                                                    className="pl-10 bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Featured Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
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
