import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'
import { getTrashedNotesForUser } from '@/server/services/notes.service'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const notes = await getTrashedNotesForUser(session.user.id)
    return NextResponse.json(notes)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
