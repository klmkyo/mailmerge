import z from "zod";

export const upsertGmailSettings = z.array(
  z.object({
    refreshToken: z.string().optional(),
    email: z.string().email().optional(),
  })
);

export type upsertGmailSettingsInput = z.TypeOf<typeof upsertGmailSettings>
