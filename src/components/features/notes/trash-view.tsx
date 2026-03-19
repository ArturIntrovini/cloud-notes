'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Note } from '@/server/db'

export type TrashViewProps = {
  initialNotes: Note[]
}

function daysUntilDeletion(trashedAt: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const daysSinceTrash = Math.floor((Date.now() - trashedAt.getTime()) / msPerDay)
  return Math.min(30, Math.max(0, 30 - daysSinceTrash))
}

export function TrashView({ initialNotes }: TrashViewProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [restoring, setRestoring] = useState<string | null>(null)

  async function handleRestore(noteId: string) {
    setRestoring(noteId)
    try {
      const res = await fetch(`/api/notes/${noteId}/restore`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Restore failed')
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      setRestoring(null)
      router.refresh()
    } catch {
      setRestoring(null)
    }
  }

  return (
    <div>
      <Link href="/notes">← Back to Notes</Link>
      {notes.length === 0 ? (
        <p>Trash is empty</p>
      ) : (
        <ul>
          {notes.map((note) => {
            const displayTitle = note.title.trim() || 'Untitled'
            const days = note.trashedAt ? daysUntilDeletion(note.trashedAt) : 30
            const daysLabel = days > 0 ? `${days} ${days === 1 ? 'day' : 'days'} left` : 'deleting soon'
            const isRestoring = restoring === note.id

            return (
              <li key={note.id}>
                <span>{displayTitle}</span>
                <span>{daysLabel}</span>
                <button onClick={() => handleRestore(note.id)} disabled={restoring !== null}>
                  {isRestoring ? 'Restoring…' : 'Restore'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
