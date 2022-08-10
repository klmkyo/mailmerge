import { z } from "zod";
import { createEmailTemplateSchema, deleteEmailTemplateSchema, updateEmailTemplateSchema } from "../../schema/emailTemplate.schema";
import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const emailTemplateRouter = createProtectedRouter()
  .mutation("create", {
    input: createEmailTemplateSchema,
    async resolve({ ctx, input }) {
      const { subject, body } = input;

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
  .mutation("update", {
    input: updateEmailTemplateSchema,
    async resolve({ ctx, input }) {
      const { id, subject, body, tags } = input;

      return await ctx.prisma.emailTemplate.updateMany({
        where: {
          id,
          user: {
            id: ctx.session.user.id
          }
        },
        data: {
          subject,
          body,
          tags
        },
      });
    }
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
  })
  .query("get", {
    input: z.object({ id: z.string().cuid() }),
    resolve({ ctx, input }) {
      return ctx.prisma.emailTemplate.findFirst({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
      });
    }
  });
