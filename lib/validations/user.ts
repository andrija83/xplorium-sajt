import { z } from "zod"

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").nullable().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
  image: z.string().url("Invalid image URL").nullable().optional(),
  blocked: z.boolean().default(false),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(1, "Name is required").nullable().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  image: z.string().url("Invalid image URL").nullable().optional(),
  blocked: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
