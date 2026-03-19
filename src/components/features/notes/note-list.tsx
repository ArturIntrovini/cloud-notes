import Link from 'next/link'
import type { Note } from '@/server/db'
import { NoteListItem } from './note-list-item'

export type NoteListProps = {
  notes: Note[]
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-neutral-500">
        <p>No notes yet</p>
        <Link
          href="/notes/new"
          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold"
        >
          New Note
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link
          href="/notes/new"
          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold"
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
