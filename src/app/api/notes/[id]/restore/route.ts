import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'
import { restoreNote } from '@/server/services/notes.service'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const note = await restoreNote(id, session.user.id)
  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(note)
}
