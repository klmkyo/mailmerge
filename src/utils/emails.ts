import { Contact, Email, EmailTemplate } from "@prisma/client";
import { DEPLOY_URL } from "../pages/_app";
import { CreateMultipleEmailInput } from "../schema/email.schema";

export const generateEmails = (contacts: Contact[], emailTemplates: EmailTemplate[]) => {
  const emails: CreateMultipleEmailInput = contacts.map((contact) => {
    // pick a random email template
    const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)]!;

    return {
      subject: template.subject,
      body: template.body,
      tags: template.tags,
      contactId: contact.id,
      toBeSentTo: contact.email,
    };
  });
  return emails;
}

export function extractEmails( text: string ){
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
}

export const addTracker = (email: Email) => {
  // copiloted
  // const trackedBody = email.body.replace(/\n/g, "<br>");

  const trackedBody = email.body;
  const tracker = `<img src="${DEPLOY_URL}/img/${email.id}" width="1" height="1" style="display:none">`;
  return `${trackedBody}${tracker}`;
}
