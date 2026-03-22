'use client'

import { useState } from 'react'
import type { Note } from '@/server/db'
import { NoteList } from './note-list'

export type NoteListPaginatedProps = {
  initialNotes: Note[]
  initialNextPage: number | null
}

export function NoteListPaginated({ initialNotes, initialNextPage }: NoteListPaginatedProps) {
  const [allNotes, setAllNotes] = useState<Note[]>(initialNotes)
  const [nextPage, setNextPage] = useState<number | null>(initialNextPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  async function loadMore() {
    if (nextPage === null || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/notes?page=${nextPage}&pageSize=50`)
      if (!res.ok) throw new Error('Failed to load more')
      const data: { notes: Note[]; nextPage: number | null } = await res.json()
      setAllNotes((prev) => [...prev, ...data.notes])
      setNextPage(data.nextPage)
    } catch (err) {
      console.error('[NoteListPaginated] loadMore failed', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <NoteList notes={allNotes} />
      {nextPage !== null && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold min-h-[44px] inline-flex items-center disabled:opacity-60"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
