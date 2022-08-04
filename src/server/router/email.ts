import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createMultipleEmailSchema } from "../../schema/email.schema";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const emailRouter = createProtectedRouter()
  .mutation("create-multiple", {
    input: createMultipleEmailSchema,
    async resolve({ ctx, input }) {

      const mails = input.map((mail) => {
        return {
          ...mail,
          userId: ctx.session.user.id!,
        }
      })

      return await ctx.prisma.email.createMany({
        data: mails,
      });
    }
  })
  .mutation("delete", {
    input: z.object({ id: z.string().cuid() }),
    async resolve({ ctx, input }) {
      // first remove all the email visits
      await ctx.prisma.emailVisit.deleteMany({
        where: {
          email: {
            id: input.id,
          }
        }
      });

      return await ctx.prisma.email.deleteMany({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
      });
    }
  })
  .mutation("delete-many", {
    input: z.object({ ids: z.array(z.string().cuid()) }),
    async resolve({ ctx, input }) {
      await ctx.prisma.emailVisit.deleteMany({
        where: {
          email: {
            id: {
              in: input.ids,
            },
          }
        }
      });

      return await ctx.prisma.email.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
          user: { id: ctx.session.user.id },
        },
      });
    }
  })
  .query("getAll", {
    resolve({ ctx }) {
      return ctx.prisma.email.findMany({
        where: {
          user: {
            id: ctx.session.user.id
          }
        },
        include: {
          contact: true
        }
      });
    }
  });
