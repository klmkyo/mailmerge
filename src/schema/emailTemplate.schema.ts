import z from "zod";

export const createEmailTemplateSchema = z.object({
  subject: z.string().max(256, "Title is too long"),
  body: z.string().min(0, "Body is empty").max(1024 * 1024, "Body is too long"),
  tags: z.array(z.string()).optional(),
})

export const updateEmailTemplateSchema = z.object({
  id: z.string().cuid(),
  subject: z.string().max(256, "Title is too long").optional(),
  body: z.string().min(0, "Body is empty").max(1024 * 1024, "Body is too long").optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateEmailTemplateInput = z.TypeOf<typeof createEmailTemplateSchema>

export const deleteEmailTemplateSchema = z.object({
  id: z.string().cuid(),
})
