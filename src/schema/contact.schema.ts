import z from "zod";

export const createContactSchema = z.object({
  email: z.string().email("Invalid email address"),
  nickName: z.string().max(256, "Nickname is too long").optional(),
  tags: z.array(z.string().max(256, "Tag is too long")).optional(),
})

export const updateContactSchema = z.object({
  id: z.string().cuid(),
  nickName: z.string().max(256, "Nickname is too long").optional(),
  tags: z.array(z.string().max(256, "Tag is too long")).optional(),
})

export type CreateContactSchemaInput = z.TypeOf<typeof createContactSchema>

export const deleteContactSchema = z.object({
  id: z.string().cuid()
});
