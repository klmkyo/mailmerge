import { TRPCError } from "@trpc/server";
import { createMultipleEmailSchema, deleteEmailSchema } from "../../schema/email.schema";
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
    input: deleteEmailSchema,
    async resolve({ ctx, input }) {
      return await ctx.prisma.email.deleteMany({
        where: {
          id: input.id,
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
        }
      });
    }
  });
