"use server"

import { signUpSchema } from "@/lib/validations/auth"
import { createUser, EmailInUseError } from "@/server/services/users.service"
import { signIn } from "@/server/auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export type SignUpResult = { error: string } | undefined

export async function signUpAction(
  _prevState: SignUpResult,
  formData: FormData
): Promise<SignUpResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const result = signUpSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    await createUser(result.data.email, result.data.password)
  } catch (error) {
    if (error instanceof EmailInUseError) {
      return { error: "An account with this email already exists." }
    }
    return { error: "Something went wrong. Please try again." }
  }

  try {
    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirectTo: "/notes",
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { error: "Sign-in failed. Please try signing in manually." }
  }
}
