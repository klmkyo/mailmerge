import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const emailVisitRouter = createProtectedRouter()
  .query("get-all", {
    async resolve({ ctx }) {

      const visits = await ctx.prisma.emailVisit.findMany({
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

      // mark the not seen visits as seen
      await ctx.prisma.emailVisit.updateMany({
        where: {
          email: {
            userId: ctx.session.user.id
          },
          seenByUser: null
        },
        data: {
          seenByUser: new Date()
        }
      })

      return visits;
    }
  })
  .query("get-by-email-id", {
    input: z.object({ emailId: z.string().cuid() }),
    async resolve({ ctx, input }) {
      const visit = await ctx.prisma.emailVisit.findMany({
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

      // mark it as seen
      await ctx.prisma.emailVisit.updateMany({
        where: {
          email: {
            id: input.emailId,
            userId: ctx.session.user.id
          },
          seenByUser: null
        },
        data: {
          seenByUser: new Date()
        }
      });

      return visit
    }
  })
