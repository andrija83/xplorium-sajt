"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMaintenanceSchema, type CreateMaintenanceInput } from "@/lib/validations/maintenance"
import { createMaintenanceLog, updateMaintenanceLog } from "@/app/actions/maintenance"
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
import { Loader2, Save, ArrowLeft, Calendar as CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MaintenanceEditorProps {
    logId?: string
    initialData?: any
    isEditing?: boolean
}

export function MaintenanceEditor({ logId, initialData, isEditing = false }: MaintenanceEditorProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CreateMaintenanceInput>({
        resolver: zodResolver(createMaintenanceSchema),
        defaultValues: {
            equipment: initialData?.equipment || "",
            area: initialData?.area || "GENERAL",
            description: initialData?.description || "",
            type: initialData?.type || "PREVENTIVE",
            priority: initialData?.priority || "MEDIUM",
            status: initialData?.status || "SCHEDULED",
            scheduledDate: initialData?.scheduledDate ? new Date(initialData.scheduledDate) : new Date(),
            completedDate: initialData?.completedDate ? new Date(initialData.completedDate) : null,
            cost: initialData?.cost || null,
            performedBy: initialData?.performedBy || "",
            notes: initialData?.notes || "",
        },
    })

    const handleSubmit = async (data: CreateMaintenanceInput) => {
        try {
            setIsSubmitting(true)

            const result = isEditing && logId
                ? await updateMaintenanceLog(logId, data)
                : await createMaintenanceLog(data)

            if (result.success) {
                toast.success(isEditing ? "Maintenance log updated successfully" : "Maintenance log created successfully")
                router.push("/admin/maintenance")
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
                            {isEditing ? "Edit Maintenance Log" : "Schedule Maintenance"}
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
                        {isEditing ? "Update Log" : "Create Log"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-6">
                            <FormField
                                control={form.control}
                                name="equipment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Equipment / Area Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Coffee Machine, Slide, Air Conditioning"
                                                className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
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
                                                placeholder="Detailed description of the maintenance task..."
                                                className="min-h-[120px] bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-cyan-100/40">
                                            Describe what needs to be done, any issues, etc.
                                        </FormDescription>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="performedBy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-cyan-300">Performed By (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    value={field.value || ""}
                                                    placeholder="Staff member name"
                                                    className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-cyan-300">Cost (RSD, Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    step="0.01"
                                                    value={field.value || ""}
                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                                    placeholder="0.00"
                                                    className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Additional Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                value={field.value || ""}
                                                placeholder="Any additional information..."
                                                className="min-h-[80px] bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
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
                                                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Priority</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Area</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                                                    <SelectValue placeholder="Select area" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CAFE">Cafe</SelectItem>
                                                <SelectItem value="PLAYGROUND">Playground</SelectItem>
                                                <SelectItem value="SENSORY_ROOM">Sensory Room</SelectItem>
                                                <SelectItem value="GENERAL">General</SelectItem>
                                                <SelectItem value="EXTERIOR">Exterior</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-cyan-300">Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                                                <SelectItem value="REPAIR">Repair</SelectItem>
                                                <SelectItem value="INSPECTION">Inspection</SelectItem>
                                                <SelectItem value="CLEANING">Cleaning</SelectItem>
                                                <SelectItem value="UPGRADE">Upgrade</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="scheduledDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-cyan-300">Scheduled Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal bg-black/40 border-cyan-400/30 text-white hover:bg-black/60 hover:text-white",
                                                            !field.value && "text-cyan-100/50"
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
                                            <PopoverContent className="w-auto p-0 bg-black border-cyan-400/30" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    initialFocus
                                                    className="bg-black text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
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
