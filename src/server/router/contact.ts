import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { createContactSchema, deleteContactSchema, updateContactSchema } from "../../schema/contact.schema";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const contactRouter = createProtectedRouter()
  .mutation("create", {
    input: createContactSchema,
    async resolve({ ctx, input }) {
      const { email, nickName, tags } = input;

      return ctx.prisma.contact.create({
        data: {
          email,
          nickName,
          tags,
          user: {
            connect: {
              id: ctx.session.user.id
            }
          }
        },
      });
    },
  })
  .mutation("delete", {
    input: deleteContactSchema,
    async resolve({ ctx, input }) {
      return await ctx.prisma.contact.deleteMany({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
      });
    }
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.contact.findMany({
        where: {
          user: {
            id: ctx.session.user.id
          }
        }
      });
    }
  })
  .mutation("update-contact", {
    input: updateContactSchema,
    async resolve({ ctx, input }) {
      return await ctx.prisma.contact.updateMany({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
        data: {
          ...input,
        },
      });
    }
  })
