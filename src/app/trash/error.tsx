'use client'

import { useEffect } from 'react'

export default function TrashError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console for observability (architecture: basic console logging in serverless)
    console.error('[TrashError]', error)
  }, [error])

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center gap-4">
      <p className="text-lg font-semibold text-neutral-900">
        Something went wrong loading your trash.
      </p>
      <p className="text-sm text-neutral-500">
        Your notes are safe — this is a temporary issue.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold min-h-[44px] inline-flex items-center"
      >
        Try again
      </button>
    </main>
  )
}
