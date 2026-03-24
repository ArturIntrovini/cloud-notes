import { Suspense } from 'react'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { getNotesForUserPaginated } from '@/server/services/notes.service'
import { NoteListPaginated } from '@/components/features/notes/note-list-paginated'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CloudHub } from '@/components/features/notes/cloud-hub'

async function NotesListLoader({ userId }: { userId: string }) {
  const { notes, nextPage } = await getNotesForUserPaginated(userId, 0, 50)
  return <NoteListPaginated initialNotes={notes} initialNextPage={nextPage} />
}

function NotesSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading notes…">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface-elevated rounded-xl px-4 py-3 animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-1" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function NotesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

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
        <Suspense fallback={<NotesSkeleton />}>
          <NotesListLoader userId={session.user.id} />
        </Suspense>
      </div>
    </main>
  )
}
