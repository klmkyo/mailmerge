import z from "zod";

export const upsertGmailSettings = z.object({
  authorizationCode: z.string(),
})

export type upsertGmailSettingsInput = z.TypeOf<typeof upsertGmailSettings>
