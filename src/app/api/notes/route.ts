import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'
import { createNoteSchema } from '@/lib/validations/notes'
import { getNotesForUserPaginated, createNoteForUser } from '@/server/services/notes.service'

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
    const result = await getNotesForUserPaginated(session.user.id, page, pageSize)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const result = createNoteSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }
  try {
    const note = await createNoteForUser(session.user.id, result.data)
    return NextResponse.json(note, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
