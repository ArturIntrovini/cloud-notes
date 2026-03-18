import Link from 'next/link'
import type { Note } from '@/server/db'
import { NoteListItem } from './note-list-item'

export type NoteListProps = {
  notes: Note[]
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div>
        <p>No notes yet</p>
        <Link href="/notes/new">New Note</Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/notes/new">New Note</Link>
      <ul>
        {notes.map((note) => (
          <NoteListItem key={note.id} note={note} />
        ))}
      </ul>
    </div>
  )
}
