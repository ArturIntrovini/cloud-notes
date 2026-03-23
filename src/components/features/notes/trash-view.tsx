'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Note } from '@/server/db'

export type TrashViewProps = {
  initialNotes: Note[]
  initialNextPage: number | null
}

function daysUntilDeletion(trashedAt: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const daysSinceTrash = Math.floor((Date.now() - trashedAt.getTime()) / msPerDay)
  return Math.min(31, Math.max(0, 31 - daysSinceTrash))
}

export function TrashView({ initialNotes, initialNextPage }: TrashViewProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [nextPage, setNextPage] = useState<number | null>(initialNextPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const isBusy = restoring !== null || deleting !== null || deletingBulk
  const allSelected = notes.length > 0 && selected.size === notes.length

  async function handleRestore(noteId: string) {
    setRestoring(noteId)
    try {
      const res = await fetch(`/api/notes/${noteId}/restore`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Restore failed')
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      setNextPage(null)
      setRestoring(null)
      router.refresh()
    } catch {
      setRestoring(null)
    }
  }

  async function handleDelete(noteId: string) {
    setDeleting(noteId)
    try {
      const res = await fetch(`/api/notes/${noteId}/permanent`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      setNextPage(null)
      router.refresh()
    } catch {
      // silently fail — note stays in list
    } finally {
      setDeleting(null)
    }
  }

  async function handleDeleteSelected() {
    const ids = [...selected]
    if (ids.length === 0) return
    setDeletingBulk(true)
    try {
      const res = await fetch('/api/trash', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error('Delete failed')
      setNotes((prev) => prev.filter((n) => !selected.has(n.id)))
      setNextPage(null)
      setSelected(new Set())
      setIsSelecting(false)
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setDeletingBulk(false)
    }
  }

  async function handleEmptyTrash() {
    setDeletingBulk(true)
    try {
      const res = await fetch('/api/trash', { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setNotes([])
      setNextPage(null)
      setSelected(new Set())
      setIsSelecting(false)
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setDeletingBulk(false)
    }
  }

  function toggleSelect(noteId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) next.delete(noteId)
      else next.add(noteId)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(notes.map((n) => n.id)))
  }

  function exitSelectMode() {
    setIsSelecting(false)
    setSelected(new Set())
  }

  async function loadMore() {
    if (nextPage === null || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/trash?page=${nextPage}`)
      if (!res.ok) throw new Error('Failed to load more')
      const data: { notes: Note[]; nextPage: number | null } = await res.json()
      setNotes((prev) => [...prev, ...data.notes])
      setNextPage(data.nextPage)
    } catch (err) {
      console.error('[TrashView] loadMore failed', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        {!isSelecting ? (
          <Link href="/notes" className="text-primary text-sm font-medium min-h-[44px] inline-flex items-center">← Back to Notes</Link>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4"
            />
            <span className="text-sm text-neutral-500">
              {selected.size === 0 ? 'Select all' : `${selected.size} selected`}
            </span>
          </label>
        )}

        {notes.length > 0 && !isSelecting && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSelecting(true)}
              className="text-sm text-neutral-500 font-medium min-h-[44px] px-3 flex items-center"
            >
              Select
            </button>
            <button
              onClick={handleEmptyTrash}
              disabled={isBusy}
              className="text-sm text-danger font-medium min-h-[44px] px-3 flex items-center disabled:opacity-60"
            >
              {deletingBulk ? 'Emptying…' : 'Empty trash'}
            </button>
          </div>
        )}

        {isSelecting && (
          <div className="flex items-center gap-1">
            {selected.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isBusy}
                className="text-sm text-danger font-medium min-h-[44px] px-3 flex items-center disabled:opacity-60"
              >
                {deletingBulk ? 'Deleting…' : `Delete (${selected.size})`}
              </button>
            )}
            <button
              onClick={exitSelectMode}
              className="text-sm text-neutral-500 font-medium min-h-[44px] px-3 flex items-center"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <svg className="w-10 h-10 text-neutral-500" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          <p className="text-base font-semibold text-neutral-900">Trash is empty</p>
          <p className="text-sm text-neutral-500">Notes in trash for over 30 days are removed permanently</p>
        </div>
      ) : (
        <>
        <ul className="flex flex-col gap-2">
          {notes.map((note) => {
            const displayTitle = note.title.trim() || 'Untitled'
            const days = note.trashedAt ? daysUntilDeletion(note.trashedAt) : 31
            const daysLabel = days > 0 ? `${days} ${days === 1 ? 'day' : 'days'} left` : 'deleting soon'
            const isRestoring = restoring === note.id
            const isDeleting = deleting === note.id
            const isSelected = selected.has(note.id)

            return (
              <li key={note.id} className="bg-surface-elevated rounded-xl px-4 py-3 flex items-center gap-3">
                {isSelecting ? (
                  <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(note.id)}
                      className="w-4 h-4 shrink-0"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-base font-semibold text-neutral-900 truncate">{displayTitle}</span>
                      <span className="text-sm text-neutral-500">{daysLabel}</span>
                    </div>
                  </label>
                ) : (
                  <>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-base font-semibold text-neutral-900 truncate">{displayTitle}</span>
                      <span className="text-sm text-neutral-500">{daysLabel}</span>
                    </div>
                    <div className="flex items-center shrink-0">
                      <button
                        onClick={() => handleRestore(note.id)}
                        disabled={isBusy}
                        aria-label={`Restore "${displayTitle}"`}
                        className="text-primary text-sm font-medium disabled:opacity-60 touch-target flex items-center justify-center px-2"
                      >
                        {isRestoring ? 'Restoring…' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        disabled={isBusy}
                        aria-label={`Delete "${displayTitle}" permanently`}
                        className="text-danger text-sm font-medium disabled:opacity-60 touch-target flex items-center justify-center px-2"
                      >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
        {nextPage !== null && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore || isBusy}
              className="text-primary text-sm font-medium min-h-[44px] px-4 flex items-center disabled:opacity-60"
            >
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
        </>
      )}
    </div>
  )
}
