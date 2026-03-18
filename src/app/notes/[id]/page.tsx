import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { getNoteById } from '@/server/services/notes.service'
import { NoteEditor } from '@/components/features/notes/note-editor'

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const note = await getNoteById(id, session.user.id)
  if (!note) notFound()

  return <NoteEditor note={note} />
}
