import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'
import {
  getTrashedNotesForUser,
  healNullTrashedAt,
  permanentlyDeleteNotes,
  emptyTrash,
} from '@/server/services/notes.service'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await healNullTrashedAt(session.user.id)
    const notes = await getTrashedNotesForUser(session.user.id)
    return NextResponse.json(notes)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let ids: string[] | undefined
  try {
    const body = await req.json()
    if (Array.isArray(body?.ids)) ids = body.ids
  } catch {
    // no body — delete all
  }
  try {
    const deleted = ids !== undefined
      ? await permanentlyDeleteNotes(ids, session.user.id)
      : await emptyTrash(session.user.id)
    return NextResponse.json({ deleted })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
