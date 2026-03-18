import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { getNotesForUser } from '@/server/services/notes.service'
import { NoteList } from '@/components/features/notes/note-list'
import { signOutAction } from './actions'

export default async function NotesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const notes = await getNotesForUser(session.user.id)

  return (
    <main>
      {/* Sign out — keep until Epic 3 cloud-hub replaces navigation */}
      <form action={signOutAction}>
        <button type="submit">Sign out</button>
      </form>
      <NoteList notes={notes} />
    </main>
  )
}
