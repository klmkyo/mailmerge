// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { FC } from "react";
import { Contact } from "@prisma/client";

const ContactList: FC = () => {

  const { data, isLoading, error } = trpc.useQuery(['contact.getAll']);

  if (isLoading) {
    return <p>Loading contacts...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="flex-row">
      {data?.map((contact) => {
        return (
          <Contact key={contact.id} contact={contact} />
        )
      })}
    </div>
  );
};

const Contact = ({ contact }: { contact: Contact }) => {

  const { mutate, error } = trpc.useMutation(['contact.delete'], {
    onError: (error) => {
      alert(error)
    }
  })

  const onDelete = () => {
    console.log(contact)
    mutate({ id: contact.id })
  }

  return (
    <div className="flex gap-4">
      <span>{contact.email}</span>
      <span>{contact.nickName}</span>
      <button onClick={onDelete}>Delete</button>
    </div>
  )
};

export default ContactList;
