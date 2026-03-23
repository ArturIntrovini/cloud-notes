import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { getNotesForUserPaginated } from '@/server/services/notes.service'
import { NoteListPaginated } from '@/components/features/notes/note-list-paginated'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CloudHub } from '@/components/features/notes/cloud-hub'

export default async function NotesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const { notes, nextPage } = await getNotesForUserPaginated(session.user.id, 0, 50)

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-500/20">
        <h1 className="text-2xl font-semibold text-neutral-900 flex-1">Cloud Notes</h1>
        <CloudHub mode="list" />
        <div className="flex-1 flex justify-end">
          <ThemeToggle />
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <NoteListPaginated initialNotes={notes} initialNextPage={nextPage} />
      </div>
    </main>
  )
}
