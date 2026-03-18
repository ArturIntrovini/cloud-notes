import { NextRequest, NextResponse } from 'next/server'
import { purgeTrashedNotes } from '@/server/services/notes.service'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 30)

  const deleted = await purgeTrashedNotes(cutoffDate)
  return NextResponse.json({ deleted })
}
