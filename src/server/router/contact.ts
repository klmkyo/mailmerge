import { TRPCError } from "@trpc/server";
import { createContactSchema } from "../../schema/contact.schema";
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
