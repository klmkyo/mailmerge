import { TRPCError } from "@trpc/server";
import { createEmailTemplateSchema } from "../../schema/emailTemplate.schema";
import { createProtectedRouter } from "./protected-router";

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
      return ctx.prisma.emailTemplate.create({
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
