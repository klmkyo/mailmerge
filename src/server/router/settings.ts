import { TRPCError } from "@trpc/server";
import { createProtectedRouter } from "./protected-router";
import { emailOAuthUrl } from "../../utils/google";
import { upsertGmailSettings } from "../../schema/settings";


// Example router with queries that can only be hit if the user requesting is signed in
export const settingsRouter = createProtectedRouter()
  .query("get-oauth-url", {
    resolve() {
      return {
        url: emailOAuthUrl,
      };
    }
  })
  .mutation("upsert-gmail-auth", {
    input: upsertGmailSettings,
    async resolve({ctx, input}){

      const {user} = ctx.session;

      return ctx.prisma.gmailSettings.upsert({
        where: {
          userId: user?.id
        },
        update: {
          refreshToken: input?.refreshToken || undefined,
          email: input?.email || undefined
        },
        create: {
          email: input?.email || user.email!,
          refreshToken: input?.refreshToken,
          user: {
            connect: {
              id: user.id!
            }
          }
        }
      })

    }
  });
