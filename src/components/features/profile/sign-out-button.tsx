'use client'
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/sign-in' })}
      className="w-full bg-danger text-white rounded-lg px-4 py-2 text-base font-semibold min-h-[44px] focus-visible:ring-2 focus-visible:ring-danger focus-visible:outline-none"
    >
      Sign out
    </button>
  )
}
