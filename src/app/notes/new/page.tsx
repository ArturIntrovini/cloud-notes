import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { createNoteForUser } from '@/server/services/notes.service'

export default async function NewNotePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const note = await createNoteForUser(session.user.id, { title: '', content: '' })
  redirect(`/notes/${note.id}`)
}
