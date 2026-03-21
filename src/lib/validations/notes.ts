import { z } from 'zod'

const MAX_TITLE_LENGTH = 500
const MAX_CONTENT_LENGTH = 100_000

export const createNoteSchema = z.object({
  title: z.string().max(MAX_TITLE_LENGTH, 'Title must be 500 characters or fewer').optional().default(''),
  content: z.string().max(MAX_CONTENT_LENGTH, 'Content must be 100,000 characters or fewer').optional().default(''),
})

export const updateNoteSchema = z.object({
  title: z.string().max(MAX_TITLE_LENGTH, 'Title must be 500 characters or fewer').optional(),
  content: z.string().max(MAX_CONTENT_LENGTH, 'Content must be 100,000 characters or fewer').optional(),
}).refine(
  (data) => data.title !== undefined || data.content !== undefined,
  { message: 'At least one of title or content must be provided' }
)

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
