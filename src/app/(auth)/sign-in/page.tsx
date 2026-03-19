"use client"

import { useActionState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { signInAction } from "./actions"
import Link from "next/link"

function CallbackUrlInput() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/notes"
  return <input type="hidden" name="callbackUrl" value={callbackUrl} />
}

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, undefined)

  return (
    <main className="w-full max-w-sm px-4">
      <div className="bg-surface-elevated rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Sign in to your account</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <CallbackUrlInput />
          </Suspense>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-900">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="rounded-lg border border-neutral-500/30 bg-surface px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-900">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-neutral-500/30 bg-surface px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {state?.error && (
            <p role="alert" className="text-danger text-sm">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-white rounded-lg px-4 py-2 text-base font-semibold disabled:opacity-60 mt-2"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary font-medium">Create one</Link>
        </p>
      </div>
    </main>
  )
}
