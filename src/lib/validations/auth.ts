import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be 72 characters or fewer"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
