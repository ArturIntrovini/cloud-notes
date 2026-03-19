import type { Metadata } from 'next'
import { auth } from '@/server/auth'

export const metadata: Metadata = { title: 'Trash — Cloud Notes' }
import { redirect } from 'next/navigation'
import { getTrashedNotesForUser } from '@/server/services/notes.service'
import { TrashView } from '@/components/features/notes/trash-view'

export default async function TrashPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const notes = await getTrashedNotesForUser(session.user.id)

  return (
    <main>
      <h1>Trash</h1>
      <TrashView initialNotes={notes} />
    </main>
  )
}
