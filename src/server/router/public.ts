import { Email } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/smtp-transport";
import { addTracker } from "../../utils/emails";
import { Context, createRouter } from "./context";

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
export const publicRouter = createRouter()
  .mutation("send-unsent-emails", {
    async resolve ({ctx}) {
      await sendUnsentEmails(ctx);
    }
  });

export async function sendUnsentEmails(ctx: Context) {
  const unsentEmails = await ctx.prisma.email.findMany({
    where: {
      toBeSentAt: {
        lte: new Date(),
      },

      // don't select userID, since we will be sending all emails, regardless of user
      // user: {
      //   id: ctx.session.user.id,
      // },
      // VERY IMPORTANT: this is to prevent sending the same email twice
      sentAt: null,
    },
  });

  // double check: if there is an email that has already been sent, throw an error
  // check by seeing if sentAt and sentTo are null
  unsentEmails.forEach((unsentEmail) => {
    if (unsentEmail.sentAt || unsentEmail.sentTo) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Spróbowano wysłać wysłane już maile, co nie powinno się zdarzyć",
      });
    }
  });

  // group emails by user
  let emailsByUser: { [userId: string]: Email[]; } = {};

  unsentEmails.forEach((unsentEmail) => {
    // initialize the array for user key if it doesn't exist
    if (!emailsByUser[unsentEmail.userId]) {
      emailsByUser[unsentEmail.userId] = [];
    }
    // add the email to the array
    emailsByUser[unsentEmail.userId]!.push(unsentEmail);
  });

  // send emails logic
  // for each user
  const sendPromises = Object.entries(emailsByUser).map(async ([userId, emails]) => {
    // get user refresh token and email
    const { refreshToken, email: senderEmail } = await ctx.prisma.gmailSettings.findFirstOrThrow({
      where: {
        user: {
          id: userId,
        },
      },
    });

    // send emails
    emails.forEach(async (email) => {

      // add tracker to email body
      const trackedBody = addTracker(email);

      const mailOptions: MailOptions = {
        from: senderEmail,
        to: email.toBeSentTo,
        subject: email.subject,
        html: trackedBody,

        auth: {
          user: senderEmail,
          refreshToken: refreshToken
        }
      };

      await smtpTransport.sendMail(mailOptions);

      // update the email to indicate it has been sent
      await ctx.prisma.email.update({
        where: {
          id: email.id,
        },
        data: {
          sentAt: new Date(),
          sentTo: email.toBeSentTo,
        },
      });
    });
  });

  await Promise.all(sendPromises);
}

