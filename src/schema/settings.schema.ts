import z from "zod";

export const upsertGmailSettings = z.object({
  refreshToken: z.string(),
  email: z.string().email().optional(),
})

export type upsertGmailSettingsInput = z.TypeOf<typeof upsertGmailSettings>
