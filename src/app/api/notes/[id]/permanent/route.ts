import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'
import { permanentlyDeleteNote } from '@/server/services/notes.service'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const note = await permanentlyDeleteNote(id, session.user.id)
    if (!note) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
