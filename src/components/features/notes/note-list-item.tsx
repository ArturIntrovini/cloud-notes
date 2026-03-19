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
      <li className="bg-surface-elevated rounded-xl px-4 py-3">
        <span className="text-sm text-neutral-500">Moved to Trash</span>
      </li>
    )
  }

  return (
    <li className="bg-surface-elevated rounded-xl px-4 py-3 flex items-start justify-between gap-3">
      <Link href={`/notes/${note.id}`} className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-base font-semibold text-neutral-900 truncate">{displayTitle}</span>
        <span className="text-sm text-neutral-500 line-clamp-2">{snippet}</span>
        <span className="text-xs text-neutral-500">{formattedDate}</span>
      </Link>
      <button
        onClick={handleTrash}
        disabled={trashing}
        className="text-danger text-sm shrink-0 disabled:opacity-60 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {trashing ? 'Moving…' : 'Move to Trash'}
      </button>
    </li>
  )
}
