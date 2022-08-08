import { TRPCError } from "@trpc/server";
import { upsertGmailSettings } from "../../schema/settings.schema";
import { emailOAuthUrl, oauth2Client } from "../../utils/google";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const settingsRouter = createProtectedRouter()
  .query("get-oauth-url", {
    resolve() {
      return {
        url: emailOAuthUrl,
      };
    }
  })
  .query("get-gmail-email", {
    resolve({ ctx }) {
      return ctx.prisma.gmailSettings.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          email: true
        }
      })
    }
  })
  .query("is-gmail-connected", {
    async resolve({ ctx }) {
      return !!(await ctx.prisma.gmailSettings.findUnique({
        where: {
          userId: ctx.session.user.id,
        }
      }))
    }
  })
  .mutation("upsert-gmail-auth", {
    input: upsertGmailSettings,
    async resolve({ ctx, input }) {
      try {
        const res = await oauth2Client.getToken(input.authorizationCode);

        /* It's a method that checks if the token is valid. */
        const refreshToken = res.tokens.refresh_token;

        console.log(res.tokens);

        const userInfo = await oauth2Client.getTokenInfo(res.tokens.access_token!);

        if (!refreshToken) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong, did not receive refresh token from Google" });
        }

        const { user } = ctx.session;

        return ctx.prisma.gmailSettings.upsert({
          where: {
            userId: user?.id
          },
          update: {
            email: userInfo.email!,
            refreshToken
          },
          create: {
            email: userInfo.email!,
            refreshToken,
            user: {
              connect: {
                id: user.id!
              }
            }
          }
        })
      } catch (e) {
        console.error(e);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" });
      }
    }
  })
