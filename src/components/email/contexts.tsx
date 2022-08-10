import { Contact, EmailTemplate } from "@prisma/client";
import { createContext, ReactNode, useState } from "react";
import { trpc } from "../../utils/trpc";

export const EmailTemplateContext = createContext<{
  emailTemplates: (EmailTemplate & { selected: boolean })[],
  toggleEmailTemplateSelection: (input: {id: string, selected?: boolean}) => void,
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
      toggleEmailTemplateSelection: ({id, selected}: {id:string, selected?: boolean}) => {
        const emailTemplate = emailTemplates?.find(({ id: etid }) => etid === id);
        if (emailTemplate) {
          emailTemplate.selected = selected ?? !emailTemplate.selected;
          if (emailTemplate.selected) {
            setSelectedEmailTemplateIds((sids) => [...sids, id]);
          }
          else {
            setSelectedEmailTemplateIds((sids) => sids.filter(etid => etid !== id));
          }
        }
      }
    }}>
      {children}
    </EmailTemplateContext.Provider>
  )
};

export const ContactContext = createContext<{
  contacts: (Contact & {
    selected: boolean,
    _count: {
        Email: number
    }
  })[],
  toggleContactSelection: (input: {id: string, selected?: boolean}) => void,
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
      toggleContactSelection: ({id, selected}: {id:string, selected?: boolean}) => {
        const contact = contacts?.find(({ id: cid }) => cid === id);
        if (contact) {
          contact.selected = selected ?? !contact.selected;
          if (contact.selected) {
            setSelectedContactIds((sids) => [...sids, id] );
          }
          else {
            setSelectedContactIds((sids) => sids.filter(cid => cid !== id));
          }
        }
      }
    }}>
      {children}
    </ContactContext.Provider>
  )
};
