"use server"

import { signIn } from "@/server/auth"
import { AuthError } from "next-auth"
import { signInSchema } from "@/lib/validations/auth"

export type SignInResult = { error: string } | undefined

export async function signInAction(
  _prevState: SignInResult,
  formData: FormData
): Promise<SignInResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const result = signInSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" }
  }

  try {
    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirectTo: "/notes",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password. Please try again." }
        default:
          return { error: "Something went wrong. Please try again." }
      }
    }
    throw error // NEXT_REDIRECT must propagate
  }
}
