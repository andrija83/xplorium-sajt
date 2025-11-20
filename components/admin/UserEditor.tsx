"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserSchema, type CreateUserInput } from "@/lib/validations"
import { createUser } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, ArrowLeft, User, Mail, Lock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function UserEditor() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "USER",
        },
    })

    const handleSubmit = async (data: CreateUserInput) => {
        try {
            setIsSubmitting(true)

            const result = await createUser(data)

            if (result.success) {
                toast.success("User created successfully")
                router.push("/admin/users")
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
                            Create New User
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
                        Create User
                    </Button>
                </div>

                <div className="max-w-2xl space-y-6">
                    <div className="p-6 rounded-xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 space-y-6">
                        <div className="flex items-center gap-2 text-cyan-300 mb-4">
                            <User className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">User Information</h2>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300">Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="John Doe"
                                            className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-cyan-100/40">
                                        The user's full name
                                    </FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="user@example.com"
                                            className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-cyan-100/40">
                                        Must be a valid email address
                                    </FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300 flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="••••••••"
                                            className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-cyan-100/40">
                                        Minimum 8 characters
                                    </FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-cyan-300 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Role
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-black/40 border-cyan-400/30 text-white focus:border-cyan-400">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-black/90 border-cyan-400/20">
                                            <SelectItem value="USER" className="text-white hover:bg-cyan-400/10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    <span>User</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="ADMIN" className="text-white hover:bg-cyan-400/10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                                    <span>Admin</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="SUPER_ADMIN" className="text-white hover:bg-cyan-400/10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                                    <span>Super Admin</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-cyan-100/40">
                                        User permissions level. Only Super Admins can create other Super Admins.
                                    </FormDescription>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="p-4 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-sm text-cyan-100/70">
                        <p className="font-medium text-cyan-300 mb-2">Note:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>The user will receive the credentials you set here</li>
                            <li>Recommend sending login details securely to the user</li>
                            <li>Users can change their password after first login</li>
                        </ul>
                    </div>
                </div>
            </form>
        </Form>
    )
}
