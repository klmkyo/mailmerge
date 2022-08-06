import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { createContactSchema, deleteContactSchema, updateContactSchema } from "../../schema/contact.schema";
import { createProtectedRouter } from "./protected-router";
import { onlyUnique } from "../../utils/onlyUnique";

// Example router with queries that can only be hit if the user requesting is signed in
export const contactRouter = createProtectedRouter()
  .mutation("create", {
    input: createContactSchema,
    async resolve({ ctx, input }) {
      const { email, nickName, tags } = input;

      try {
        return await ctx.prisma.contact.create({
          data: {
            email,
            nickName,
            tags: tags?.filter(onlyUnique),
            user: {
              connect: {
                id: ctx.session.user.id
              }
            }
          },
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (e.code === 'P2002') {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Kontakt o takim mailu już istnieje",
            });
          }
        }
        throw e
      }
    },
  })
  .mutation("delete", {
    input: deleteContactSchema,
    async resolve({ ctx, input }) {
      try {
        return await ctx.prisma.contact.deleteMany({
          where: {
            id: input.id,
            user: { id: ctx.session.user.id },
          },
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (e.code === 'P2003') {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Nie mozna usunąć kontaktu, do którego został wysłany email",
            });
          }
        }
        throw e
      }
    }
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.contact.findMany({
        where: {
          user: {
            id: ctx.session.user.id
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }
  })
  .mutation("update", {
    input: updateContactSchema,
    async resolve({ ctx, input }) {
      return await ctx.prisma.contact.updateMany({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
        data: {
          ...input,
          tags: input.tags?.filter(onlyUnique),
        },
      });
    }
  })
