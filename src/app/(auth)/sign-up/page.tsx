"use client"

import { useActionState } from "react"
import { signUpAction } from "./actions"
import Link from "next/link"

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, undefined)

  return (
    <main className="w-full max-w-sm px-4">
      <div className="bg-surface-elevated rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Create your account</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-900">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="rounded-lg border border-neutral-500/30 bg-surface px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-900">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              placeholder="At least 8 characters"
              className="rounded-lg border border-neutral-500/30 bg-surface px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            />
          </div>
          {state?.error && (
            <p role="alert" className="text-danger text-sm">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-white rounded-lg px-4 py-2 text-base font-semibold disabled:opacity-60 mt-2 min-h-[44px] w-full flex items-center justify-center"
          >
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary font-medium inline-block leading-[44px]">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
