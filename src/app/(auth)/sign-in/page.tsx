"use client"

import { useActionState } from "react"
import { signInAction } from "./actions"
import Link from "next/link"

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, undefined)

  return (
    <main>
      <h1>Sign in to your account</h1>
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
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error && (
          <p role="alert">{state.error}</p>
        )}
        <button type="submit" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p>
        Don&apos;t have an account?{" "}
        <Link href="/sign-up">Create one</Link>
      </p>
    </main>
  )
}
