import { db, notes } from '@/server/db'
import type { Note } from '@/server/db'
import { and, eq, lt, isNotNull, desc } from 'drizzle-orm'
import type { CreateNoteInput, UpdateNoteInput } from '@/lib/validations/notes'

export async function getNotesForUser(userId: string): Promise<Note[]> {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.isTrashed, false)))
    .orderBy(desc(notes.updatedAt))
}

export async function createNoteForUser(
  userId: string,
  data: CreateNoteInput
): Promise<Note> {
  const [note] = await db
    .insert(notes)
    .values({ userId, title: data.title ?? '', content: data.content ?? '' })
    .returning()
  if (!note) throw new Error('INSERT_RETURNED_EMPTY')
  return note
}

export async function getNoteById(
  noteId: string,
  userId: string
): Promise<Note | null> {
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId), eq(notes.isTrashed, false)))
  return note ?? null
}

export async function updateNote(
  noteId: string,
  userId: string,
  data: UpdateNoteInput
): Promise<Note | null> {
  const set: { title?: string; content?: string } = {}
  if (data.title !== undefined) set.title = data.title
  if (data.content !== undefined) set.content = data.content
  if (Object.keys(set).length === 0) return null
  const [note] = await db
    .update(notes)
    .set(set)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId), eq(notes.isTrashed, false)))
    .returning()
  return note ?? null
}

export async function softDeleteNote(
  noteId: string,
  userId: string
): Promise<Note | null> {
  const [note] = await db
    .update(notes)
    .set({ isTrashed: true, trashedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning()
  return note ?? null
}

export async function getTrashedNotesForUser(userId: string): Promise<Note[]> {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.isTrashed, true)))
    .orderBy(desc(notes.trashedAt))
}

export async function restoreNote(
  noteId: string,
  userId: string
): Promise<Note | null> {
  const [note] = await db
    .update(notes)
    .set({ isTrashed: false, trashedAt: null })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning()
  return note ?? null
}

export async function purgeTrashedNotes(cutoffDate: Date): Promise<number> {
  const deleted = await db
    .delete(notes)
    .where(
      and(
        eq(notes.isTrashed, true),
        isNotNull(notes.trashedAt),
        lt(notes.trashedAt, cutoffDate)
      )
    )
    .returning()
  return deleted.length
}
