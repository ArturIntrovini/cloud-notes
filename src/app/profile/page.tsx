import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/features/profile/sign-out-button'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-elevated rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Profile</h1>
        <p className="text-sm text-neutral-500 mb-1">Signed in as</p>
        <p className="text-base text-neutral-900 font-medium mb-8 break-all">{session.user.email ?? 'No email on record'}</p>
        <div className="flex flex-col gap-4">
          <SignOutButton />
          <Link
            href="/notes"
            className="text-primary text-sm text-center min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg"
          >
            ← Back to notes
          </Link>
        </div>
      </div>
    </main>
  )
}
