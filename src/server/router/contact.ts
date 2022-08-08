import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createContactSchema, deleteContactSchema, updateContactSchema } from "../../schema/contact.schema";
import { onlyUnique } from "../../utils/onlyUnique";
import { createProtectedRouter } from "./protected-router";

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
        // delete actual contact
        return await ctx.prisma.contact.deleteMany({
          where: {
            id: input.id,
            user: { id: ctx.session.user.id },
          },
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner

          // P2003 - foreign key constraint violation
          if (e.code === 'P2003') {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Nie można usunąć kontaktu, do którego został wysłany email. Spróbuj go schować.",
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
        include: {
          _count: {
            select: {
              Email: true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }
  })
  .query("get", {
    input: z.object({ id: z.string().cuid() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.contact.findFirst({
        where: {
          id: input.id,
          user: {
            id: ctx.session.user.id
          }
        },
        include: {
          _count: {
            select: {
              Email: true,
            }
          }
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
