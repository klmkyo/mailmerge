import { TRPCError } from "@trpc/server";
import { createProtectedRouter } from "./protected-router";
import { emailOAuthUrl, oauth2Client } from "../../utils/google";
import { upsertGmailSettings } from "../../schema/settings.schema";
import { z } from "zod";


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
        const { tokens } = await oauth2Client.getToken(input.authorizationCode);
        const refreshToken = tokens.refresh_token;

        if (!refreshToken) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong, did not receive refresh token from Google" });
        }

        const { user } = ctx.session;

        return ctx.prisma.gmailSettings.upsert({
          where: {
            userId: user?.id
          },
          update: {
            refreshToken
          },
          create: {
            email: user.email!,
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
  .mutation("update-email", {
    input: z.object({ email: z.string().email() }),
    async resolve({ ctx, input }) {
      const { user } = ctx.session;
      return ctx.prisma.user.update({
        where: { id: user.id },
        data: { email: input.email }
      });
    }
  });
