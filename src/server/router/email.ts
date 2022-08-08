import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DEPLOY_URL } from "../../pages/_app";
import { createMultipleEmailSchema } from "../../schema/email.schema";
import { createProtectedRouter } from "./protected-router";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { isDev } from "../../utils/isDev";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  }
});

// Example router with queries that can only be hit if the user requesting is signed in
export const emailRouter = createProtectedRouter()
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
  })
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

      // check if the email has already been sent
      const email = await ctx.prisma.email.findFirst({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        }
      });

      if(email?.sentAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nie można usunąć wiadomości, która została już wysłana",
        })
      }

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
  .mutation("update-toBeSentAt", {
    input: z.object({ id: z.string().cuid(), toBeSentAt: z.date() }),
    async resolve({ ctx, input }) {

      // check if the email has already been sent
      const email = await ctx.prisma.email.findFirst({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        }
      });

      if(email?.sentAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email został już wysłany",
        })
      }

      return await ctx.prisma.email.updateMany({
        where: {
          id: input.id,
          user: { id: ctx.session.user.id },
        },
        data: {
          toBeSentAt: input.toBeSentAt,
        },
      });
    }
  })
  .mutation("send-test-mail", {
    async resolve ({ctx}) {

      const {refreshToken, email} = await ctx.prisma.gmailSettings.findFirstOrThrow({
        where: {
          user: {
            id: ctx.session.user.id,
          },
        },
      })

      const mailOptions: MailOptions = {
        from: email,
        to: email,
        subject: "Testowy Email - MailMerge",
        html: `Chyba działa co nie
        <br>
        <br>
        Test załączników:
        <br>
        <img src="${DEPLOY_URL}/bruh.gif"></img>`,
        auth: {
          user: email,
          refreshToken: refreshToken
        }
      };
      
      try{
        await smtpTransport.sendMail(mailOptions);
        return true
      } catch(e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nie udało się wysłać testowego emaila",
        })
      }
    }
  })
  .mutation("send-unsent-emails", {
    async resolve ({ctx}) {
      // copiloted
      const unsentEmails = await ctx.prisma.email.findMany({
        where: {
          toBeSentAt: {
            lte: new Date(),
          },
          user: {
            id: ctx.session.user.id,
          },
          sentAt: null,
        },
      });
    }
  });
