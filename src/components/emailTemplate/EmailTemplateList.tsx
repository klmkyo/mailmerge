import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { FC } from "react";
import { EmailTemplate } from "@prisma/client";

const EmailTemplateList: FC = () => {

  const { data, isLoading, error } = trpc.useQuery(['emailTemplate.getAll']);

  if (isLoading) {
    return <p>Loading email templates...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="flex-row">
      {data?.map((emailTemplate) => {
        return (
          <EmailTemplate key={emailTemplate.id} emailTemplate={emailTemplate} />
        )
      })}
    </div>
  );
};

const EmailTemplate = ({ emailTemplate }: { emailTemplate: EmailTemplate }) => {

  const utils = trpc.useContext();

  const { mutate, error } = trpc.useMutation(['emailTemplate.delete'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('emailTemplate.getAll')
    }
  })

  const onDelete = () => {
    console.log(emailTemplate)
    mutate({ id: emailTemplate.id })
  }

  return (
    <div className="flex gap-4">
      <span>Tytuł: {emailTemplate.subject}</span>
      <span>Treść: {emailTemplate.body}</span>
      <span>Tagi: {emailTemplate.tags}</span>
      <button onClick={onDelete}>Delete</button>
    </div>
  )
};

export default EmailTemplateList;
