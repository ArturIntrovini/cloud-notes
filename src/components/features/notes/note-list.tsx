import Link from 'next/link'
import type { Note } from '@/server/db'
import { NoteListItem } from './note-list-item'

export type NoteListProps = {
  notes: Note[]
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 px-6 text-center bg-surface-elevated rounded-2xl">
        <svg className="w-12 h-12 text-neutral-500" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 .75-7.414 5.25 5.25 0 0 0-10.233-2.33A4.502 4.502 0 0 0 2.25 15Z" />
        </svg>
        <p className="text-lg font-semibold text-neutral-900">No notes yet</p>
        <p className="text-sm text-neutral-500">Your notes will be safe in the cloud</p>
        <Link
          href="/notes/new"
          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold min-h-[44px] inline-flex items-center mt-1"
        >
          Create your first note
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link
          href="/notes/new"
          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold min-h-[44px] inline-flex items-center"
        >
          New Note
        </Link>
      </div>
      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <NoteListItem key={note.id} note={note} />
        ))}
      </ul>
    </div>
  )
}
