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
  const displayTitle = note.title.trim() || 'Untitled'
  const snippet = contentSnippet(note.content)
  const formattedDate = note.updatedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <li>
      <Link href={`/notes/${note.id}`}>
        <span>{displayTitle}</span>
        <span>{snippet}</span>
        <span>{formattedDate}</span>
      </Link>
    </li>
  )
}
