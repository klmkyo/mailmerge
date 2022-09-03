import z from "zod";

export const createMultipleEmailSchema = z.array(
  z.object({
    emailTemplateId: z.string().cuid(),
    tags: z.array(z.string()).optional(),
    contactId: z.string().cuid(),
    toBeSentTo: z.string().email(),
  })
);

export type CreateMultipleEmailInput = z.TypeOf<typeof createMultipleEmailSchema>
