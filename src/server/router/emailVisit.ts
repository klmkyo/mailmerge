import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const emailVisitRouter = createProtectedRouter()
  .query("get-all", {
    resolve({ ctx }) {
      return ctx.prisma.emailVisit.findMany({
        where: {
          email: {
            userId: ctx.session.user.id
          }
        }
      });
    }
  })
  .query("get-by-email-id", {
    input: z.object({ emailId: z.string().cuid() }),
    resolve({ ctx, input }) {
      return ctx.prisma.emailVisit.findMany({
        where: {
          email: {
            userId: ctx.session.user.id,
            id: input.emailId
          }
        }
      });
    }
  })