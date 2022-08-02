// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { CreateContactSchemaInput } from "../../schema/contact.schema";
import { FC } from "react";
import { CreateEmailTemplateInput } from "../../schema/emailTemplate.schema";

const EmailTemplateCreate: FC = () => {

  const utils = trpc.useContext();

  const { handleSubmit, register } = useForm<CreateEmailTemplateInput>();

  const { mutate, error } = trpc.useMutation(["emailTemplate.create"], {
    onSuccess: () => {
      utils.invalidateQueries(["emailTemplate.getAll"]);
    }
  })

  const onSubmit = (data: CreateEmailTemplateInput) => {
    mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <p>{error.message}</p>}
      <input className="border" type="subject" placeholder="subject" {...register("subject")}></input>
      <br />
      <textarea className="border" placeholder="body" {...register("body")}></textarea>
      <br />
      <button className="border" type="submit">Submit</button>
    </form>
  );
};

export default EmailTemplateCreate;
