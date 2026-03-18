import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().optional().default(''),
  content: z.string().optional().default(''),
})

export const updateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
}).refine(
  (data) => data.title !== undefined || data.content !== undefined,
  { message: 'At least one of title or content must be provided' }
)

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
