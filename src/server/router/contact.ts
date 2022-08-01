import { TRPCError } from "@trpc/server";
import { createContactSchema, deleteContactSchema } from "../../schema/contact.schema";
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
    resolve({ ctx, input }) {
      console.log(input);
      return ctx.prisma.contact.deleteMany({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
      });
    }
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return ctx.prisma.contact.findMany({
        where: {
          user: {
            id: ctx.session.user.id
          }
        }
      });
    }
  })
