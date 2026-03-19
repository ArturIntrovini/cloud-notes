'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Note } from '@/server/db'

export type NoteListItemProps = {
  note: Note
}

function contentSnippet(content: string): string {
  if (!content.trim()) return '(No content)'
  return content.length > 120 ? Array.from(content).slice(0, 120).join('') + '…' : content
}

export function NoteListItem({ note }: NoteListItemProps) {
  const router = useRouter()
  const [trashing, setTrashing] = useState(false)
  const [trashed, setTrashed] = useState(false)

  const displayTitle = note.title.trim() || 'Untitled'
  const snippet = contentSnippet(note.content)
  const formattedDate = note.updatedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  useEffect(() => {
    if (!trashed) return
    // Fallback: if router.refresh() doesn't unmount this component within 3s, reset to normal
    const timer = setTimeout(() => setTrashed(false), 3000)
    return () => clearTimeout(timer)
  }, [trashed])

  async function handleTrash() {
    setTrashing(true)
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Trash failed')
      setTrashed(true)
      router.refresh()
    } catch {
      setTrashing(false)
    }
  }

  if (trashed) {
    return (
      <li>
        <span>Moved to Trash</span>
      </li>
    )
  }

  return (
    <li>
      <Link href={`/notes/${note.id}`}>
        <span>{displayTitle}</span>
        <span>{snippet}</span>
        <span>{formattedDate}</span>
      </Link>
      <button onClick={handleTrash} disabled={trashing}>
        {trashing ? 'Moving…' : 'Move to Trash'}
      </button>
    </li>
  )
}
