import { Contact, EmailTemplate } from "@prisma/client";
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
    };
  });
  return emails;
}