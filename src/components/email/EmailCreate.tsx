import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { generateEmails } from "../../utils/emails";
import { isDev } from "../../utils/isDev";
import { trpc } from "../../utils/trpc";
import { ContactContext, ContactContextProvider, EmailTemplateContext, EmailTemplateProvider } from "./contexts";

export function EmailCreateUnwrapped() {

  const { mutate, error } = trpc.useMutation(["email.create-multiple"])

  const { contacts, toggleContactSelection } = useContext(ContactContext);
  const { emailTemplates, toggleEmailTemplateSelection } = useContext(EmailTemplateContext);

  console.log({ contacts, emailTemplates })

  return (
    <>
      Contacts:
      <div className="flex w-full justify-center h-8">
        {contacts.map(contact => (
          <div key={contact.id} className="flex items-center p-2">
            <input type="checkbox" checked={contact.selected} onChange={() => {
              toggleContactSelection(contact.id);
            }} />
            {contact.email} {contact.nickName && `(${contact.nickName})`}
          </div>
        ))}
      </div>
      <br />
      Choose templates to use {"(a template will be randomly chosen for each receipient)"}

      <div className="flex w-full justify-center h-52">
        {emailTemplates.map(template => (
          <div key={template.id} className="flex items-center p-2">
            <input type="checkbox" checked={template.selected} onChange={() => {
              toggleEmailTemplateSelection(template.id);
            }} />
            Tytuł: {template.subject}
            <br />
            Treść: {template.body}
            <br />
            Tagi: {template.tags}
          </div>
        ))}
      </div>
      <br />

      <div className="fixed bottom-0 m-2 mr-8 flex gap-4 justify-end w-full">
        {isDev && <button onClick={() => console.log({ contacts, emailTemplates })}>Log Contacts {'&'} Templates</button>}
        <button onClick={() => {
          const selectedContacts = contacts.filter(contact => contact.selected);
          const selectedEmailTemplates = emailTemplates.filter(template => template.selected);
          const emails = generateEmails(selectedContacts, selectedEmailTemplates);
          console.log({ emails });
        }}>
          Save Drafts
        </button>
        <button>
          View Unsent Drafts
        </button>
      </div>
    </>
  )
}

export default function EmailCreate() {
  return (
    <EmailTemplateProvider>
      <ContactContextProvider>
        <EmailCreateUnwrapped />
      </ContactContextProvider>
    </EmailTemplateProvider>
  )
}
