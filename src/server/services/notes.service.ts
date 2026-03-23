import { db, notes } from '@/server/db'
import type { Note } from '@/server/db'
import { and, eq, lt, isNull, or, inArray, desc } from 'drizzle-orm'
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
    // NOTE: The $onUpdateFn on updatedAt in the schema will also bump updatedAt here.
    // This is intentional: trashing a note does not need to be hidden from sort order,
    // and the updated timestamp is acceptable.
    .set({ isTrashed: true, trashedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning()
  return note ?? null
}

// Internal type for paginateNotes filter — not exported; it is an implementation detail.
type NoteFilter = 'active' | 'trashed'

/**
 * Shared pagination implementation for both active and trashed notes.
 * The two public functions below delegate here to avoid duplicating limit/offset/nextPage logic.
 */
async function paginateNotes(
  userId: string,
  filter: NoteFilter,
  page: number,
  pageSize: number
): Promise<{ notes: Note[]; nextPage: number | null }> {
  const rows = await db
    .select()
    .from(notes)
    .where(
      filter === 'trashed'
        ? and(eq(notes.userId, userId), eq(notes.isTrashed, true))
        : and(eq(notes.userId, userId), eq(notes.isTrashed, false))
    )
    .orderBy(filter === 'trashed' ? desc(notes.trashedAt) : desc(notes.updatedAt))
    .limit(pageSize + 1)
    .offset(page * pageSize)
  const hasNextPage = rows.length > pageSize
  return {
    notes: hasNextPage ? rows.slice(0, pageSize) : rows,
    nextPage: hasNextPage ? page + 1 : null,
  }
}

export async function getNotesForUserPaginated(
  userId: string,
  page: number,
  pageSize: number
): Promise<{ notes: Note[]; nextPage: number | null }> {
  return paginateNotes(userId, 'active', page, pageSize)
}

export async function getTrashedNotesForUserPaginated(
  userId: string,
  page: number,
  pageSize: number
): Promise<{ notes: Note[]; nextPage: number | null }> {
  return paginateNotes(userId, 'trashed', page, pageSize)
}

export async function getTrashedNotesForUser(userId: string): Promise<Note[]> {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.isTrashed, true)))
    .orderBy(desc(notes.trashedAt))
}

export async function healNullTrashedAt(userId: string): Promise<void> {
  await db
    .update(notes)
    .set({ trashedAt: new Date() })
    .where(and(eq(notes.userId, userId), eq(notes.isTrashed, true), isNull(notes.trashedAt)))
}

export async function restoreNote(
  noteId: string,
  userId: string
): Promise<Note | null> {
  const [note] = await db
    .update(notes)
    // NOTE: The $onUpdateFn on updatedAt in the schema will bump updatedAt here, causing the
    // restored note to appear at the top of the active notes list (sorted by updatedAt desc).
    // This is intentional: restoration is treated as a meaningful update and the note surfaces
    // prominently so the user can find it immediately.
    .set({ isTrashed: false, trashedAt: null })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning()
  return note ?? null
}

export async function permanentlyDeleteNote(
  noteId: string,
  userId: string
): Promise<Note | null> {
  const [note] = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId), eq(notes.isTrashed, true)))
    .returning()
  return note ?? null
}

export async function permanentlyDeleteNotes(
  noteIds: string[],
  userId: string
): Promise<number> {
  if (noteIds.length === 0) return 0
  const deleted = await db
    .delete(notes)
    .where(and(inArray(notes.id, noteIds), eq(notes.userId, userId), eq(notes.isTrashed, true)))
    .returning()
  return deleted.length
}

export async function emptyTrash(userId: string): Promise<number> {
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.userId, userId), eq(notes.isTrashed, true)))
    .returning()
  return deleted.length
}

/**
 * @privileged — admin/cron context only. Must never be called from a user-scoped request handler.
 *
 * Deletes trashed notes across **all users** that are older than `cutoffDate`.
 * There is intentionally no `userId` filter: this function is designed for the scheduled cron job
 * that enforces the 31-day auto-purge policy app-wide.
 *
 * @param cutoffDate - Notes trashed before this date (or with a null trashedAt) will be deleted.
 * @returns The number of notes deleted.
 */
export async function purgeTrashedNotes(cutoffDate: Date): Promise<number> {
  const deleted = await db
    .delete(notes)
    .where(
      and(
        eq(notes.isTrashed, true),
        or(
          isNull(notes.trashedAt),           // stranded anomaly rows (isTrashed=true, trashedAt=null)
          lt(notes.trashedAt, cutoffDate)    // normal expiry: trashedAt older than 31 days
        )
      )
    )
    // NOTE: Drizzle ORM does not expose a rowCount/affectedRows value for DELETE operations.
    // .returning() fetches every deleted row into memory so we can count them via .length.
    // This is acceptable at current scale, but if purge volumes grow to thousands of rows per
    // run, consider replacing with a SELECT COUNT(*) subquery or a raw SQL approach to avoid
    // loading large result sets into Node.js memory.
    .returning()
  return deleted.length
}
