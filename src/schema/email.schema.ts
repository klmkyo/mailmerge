import z from "zod";

export const createMultipleEmailSchema = z.array(
  z.object({
    subject: z.string().max(256, "Title is too long"),
    body: z.string().min(0, "Body is empty").max(1024 * 1024, "Body is too long"),
    tags: z.array(z.string()).optional(),
    contactId: z.string().cuid(),
    toBeSentTo: z.string().email(),
  })
);

export type CreateMultipleEmailInput = z.TypeOf<typeof createMultipleEmailSchema>
