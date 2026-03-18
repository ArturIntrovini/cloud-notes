"use client"

import { useActionState } from "react"
import { signUpAction } from "./actions"
import Link from "next/link"

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, undefined)

  return (
    <main>
      <h1>Create your account</h1>
      <form action={formAction}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            placeholder="At least 8 characters"
          />
        </div>
        {state?.error && (
          <p role="alert">{state.error}</p>
        )}
        <button type="submit" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <Link href="/sign-in">Sign in</Link>
      </p>
    </main>
  )
}
