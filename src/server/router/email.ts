import { EmailTemplate } from '@prisma/client';
import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { z } from "zod";
import { DEPLOY_URL } from "../../pages/_app";
import { createMultipleEmailSchema } from "../../schema/email.schema";
import { createProtectedRouter } from "./protected-router";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

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
    async resolve({ ctx }) {
      return await ctx.prisma.email.findMany({
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

      const cachedMails: {[id: string]: EmailTemplate} = {}

      const mails = []

      for await (const mail of input){

        // if emailtemplate is not cached yet, save it to the cached mails
        if(!cachedMails[mail.emailTemplateId]){

          cachedMails[mail.emailTemplateId] = await ctx.prisma.emailTemplate.findFirstOrThrow({
            where: {
              id: mail.emailTemplateId,
              userId: ctx.session.user.id
            }
          })
        }

        mails.push({
          contactId: mail.contactId,
          subject: cachedMails[mail.emailTemplateId]!.subject,
          body: cachedMails[mail.emailTemplateId]!.body,
          userId: ctx.session.user.id!,
          toBeSentTo: mail.toBeSentTo
        })
      }

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
    input: z.object({ id: z.string().cuid(), toBeSentAt: z.date().nullable() }),
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
  .mutation("update-many-toBeSentAt", {
    input: z.object({
      emails: z.array(z.object({
        id: z.string().cuid(), toBeSentAt: z.date().nullable()
      })),
    }),
    async resolve({ ctx, input }) {

      const time = new Date();

      // Note: checking part happens almost in an instant (>0.2s)
      // maybe get all the emails, check if any of them has been sent, then update
      const allEmailIds = input.emails.map(email => email.id)

      const emailFromDB = await ctx.prisma.email.findMany({
        where: {
          id: {
            in: allEmailIds
          }
        }
      });

      // It's checking if any of the emails has been sent. If it has, it throws an error.
      emailFromDB.forEach(email => {
        if(email?.sentAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email został już wysłany",
          })
        }
      })

      // check if the email has already been sent
      // if i batch this somehow the performance should be fine

      const prismaOperations = []

      for await (const email of input.emails){
        prismaOperations.push(
          ctx.prisma.email.updateMany({
            where: {
              id: email.id,
              user: { id: ctx.session.user.id },
            },
            data: {
              toBeSentAt: email.toBeSentAt,
            },
          })
        )
      }

      await ctx.prisma.$transaction(prismaOperations);

      console.log(`Processed ${input.emails.length} emails in ${(new Date().getTime() - time.getTime())}`)
      // 204 in 41s
      // bad
      // 204 in 34s
      // still bad
      // TODO batch the writes somehow
      // well i think i did it
      // 204 in 15s
      // still bad.
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
