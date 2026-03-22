import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'
import {
  getTrashedNotesForUserPaginated,
  healNullTrashedAt,
  permanentlyDeleteNotes,
  emptyTrash,
} from '@/server/services/notes.service'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const rawPage = parseInt(searchParams.get('page') ?? '0', 10)
    const page = Math.min(9999, Math.max(0, Number.isNaN(rawPage) ? 0 : rawPage))
    const rawPageSize = parseInt(searchParams.get('pageSize') ?? '50', 10)
    const pageSize = Math.min(50, Math.max(1, Number.isNaN(rawPageSize) ? 50 : rawPageSize))
    await healNullTrashedAt(session.user.id)
    const result = await getTrashedNotesForUserPaginated(session.user.id, page, pageSize)
    return NextResponse.json(result)
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
