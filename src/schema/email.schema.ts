import z from "zod";

export const createMultipleEmailSchema = z.array(
  z.object({
    subject: z.string().max(256, "Title is too long"),
    body: z.string().min(0, "Body is empty").max(1024 * 1024, "Body is too long"),
    tags: z.array(z.string()).optional(),
    contactId: z.string().cuid(),
  })
);

export type CreateMultipleEmailInput = z.TypeOf<typeof createMultipleEmailSchema>

export const deleteEmailSchema = z.object({
  id: z.string().cuid(),
})
