import { NextRequest, NextResponse } from 'next/server'
import { purgeTrashedNotes } from '@/server/services/notes.service'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Use UTC arithmetic to avoid DST-boundary non-determinism.
    // Vercel cron runs at 00:00 UTC (see vercel.json); midnight-UTC-aligned cutoff gives
    // an effective retention of approximately 31 calendar days (> 30 days from the user's perspective).
    // Idempotent for time-based expiry: once qualifying rows are deleted, subsequent runs
    // in the same window find 0 matching rows and return { deleted: 0 } cleanly.
    const cutoffDate = new Date()
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 31)
    cutoffDate.setUTCHours(0, 0, 0, 0)
    const deleted = await purgeTrashedNotes(cutoffDate)
    return NextResponse.json({ deleted })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
