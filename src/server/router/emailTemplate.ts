import { TRPCError } from "@trpc/server";
import { createEmailTemplateSchema, deleteEmailTemplateSchema } from "../../schema/emailTemplate.schema";
import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

// Example router with queries that can only be hit if the user requesting is signed in
export const emailTemplateRouter = createProtectedRouter()
  .mutation("create", {
    input: createEmailTemplateSchema,
    async resolve({ ctx, input }) {
      const { subject, body } = input;

      // check if an identical emailTemplate is not in the database
      const existingEmailTemplate = await ctx.prisma.emailTemplate.findFirst({
        where: {
          subject,
          body,
          user: { id: ctx.session.user.id },
        },
      });

      if (existingEmailTemplate) {
        throw new TRPCError({ code: "CONFLICT", message: "Email Template already exists" });
      };

      // TODO user relation, cause for some reason vscode is not complaining
      return await ctx.prisma.emailTemplate.create({
        data: {
          subject,
          body,
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
    input: deleteEmailTemplateSchema,
    async resolve({ ctx, input }) {
      return await ctx.prisma.emailTemplate.deleteMany({
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
      return await ctx.prisma.emailTemplate.deleteMany({
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
      return ctx.prisma.emailTemplate.findMany({
        where: {
          user: {
            id: ctx.session.user.id
          }
        },
      });
    }
  });
