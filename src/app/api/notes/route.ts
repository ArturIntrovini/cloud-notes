import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'
import { createNoteSchema } from '@/lib/validations/notes'
import { getNotesForUser, createNoteForUser } from '@/server/services/notes.service'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const notes = await getNotesForUser(session.user.id)
  return NextResponse.json(notes)
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
  const note = await createNoteForUser(session.user.id, result.data)
  return NextResponse.json(note, { status: 201 })
}
