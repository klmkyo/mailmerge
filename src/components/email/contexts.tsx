import { Contact, EmailTemplate } from "@prisma/client";
import { createContext, ReactNode, useState } from "react";
import { trpc } from "../../utils/trpc";

export const EmailTemplateContext = createContext<{
  emailTemplates: (EmailTemplate & { selected: boolean })[],
  toggleEmailTemplateSelection: (id: string) => void,
}>({
  emailTemplates: [],
  toggleEmailTemplateSelection: () => { },
});

export const EmailTemplateProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, error } = trpc.useQuery(['emailTemplate.getAll']);

  const [selectedEmailTemplateIds, setSelectedEmailTemplateIds] = useState<String[]>([]);


  if (error) {
    alert(error.message);
  }

  // add a selected property to each email template
  const emailTemplates = data?.map((emailTemplate) => ({
    ...emailTemplate,
    selected: selectedEmailTemplateIds.includes(emailTemplate.id),
  }));

  return (
    <EmailTemplateContext.Provider value={{
      emailTemplates: emailTemplates ?? [],
      toggleEmailTemplateSelection: (etid: string) => {
        const emailTemplate = emailTemplates?.find(({ id }) => id === etid);
        if (emailTemplate) {
          emailTemplate.selected = !emailTemplate.selected;
          if (emailTemplate.selected) {
            setSelectedEmailTemplateIds([...selectedEmailTemplateIds, etid]);
          }
          else {
            setSelectedEmailTemplateIds(selectedEmailTemplateIds.filter(id => id !== etid));
          }
        }
      }
    }}>
      {children}
    </EmailTemplateContext.Provider>
  )
};

export const ContactContext = createContext<{
  contacts: (Contact & { selected: boolean })[],
  toggleContactSelection: (id: string) => void,
}>({
  contacts: [],
  toggleContactSelection: () => { },
});

export const ContactContextProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, error } = trpc.useQuery(['contact.getAll']);

  const [selectedContactIds, setSelectedContactIds] = useState<String[]>([]);

  if (error) {
    alert(error.message);
  }

  // add a selected property to each contact
  const contacts = data?.map((contact) => ({
    ...contact,
    selected: selectedContactIds.includes(contact.id),
  }));

  return (
    <ContactContext.Provider value={{
      contacts: contacts ?? [],
      toggleContactSelection: (contactId: String) => {
        const contact = contacts?.find(({ id }) => id === contactId);
        if (contact) {
          contact.selected = !contact.selected;
          if (contact.selected) {
            setSelectedContactIds([...selectedContactIds, contactId]);
          }
          else {
            setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
          }
        }
      }
    }}>
      {children}
    </ContactContext.Provider>
  )
};
