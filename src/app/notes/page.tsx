import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { getNotesForUser } from '@/server/services/notes.service'
import { NoteList } from '@/components/features/notes/note-list'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { signOutAction } from './actions'
import Link from 'next/link'

export default async function NotesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const notes = await getNotesForUser(session.user.id)

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-500/20">
        <h1 className="text-2xl font-semibold text-neutral-900">Cloud Notes</h1>
        <div className="flex items-center gap-2">
          <Link href="/trash" className="text-sm text-neutral-500 px-3 py-2">Trash</Link>
          <ThemeToggle />
          <form action={signOutAction}>
            <button type="submit" className="text-sm text-neutral-500 px-3 py-2">Sign out</button>
          </form>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <NoteList notes={notes} />
      </div>
    </main>
  )
}
