import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const emailVisitRouter = createProtectedRouter()
  .query("get-all", {
    async resolve({ ctx }) {
      return await ctx.prisma.emailVisit.findMany({
        where: {
          email: {
            userId: ctx.session.user.id
          }
        },
        include: {
          email: {
            include: {
              contact: true
            }
          }
        },
        orderBy: [
          {
            visitedAt: "desc"
          }
        ]
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
        },
        include: {
          email: {
            include: {
              contact: true
            }
          }
        }
      });
    }
  })
