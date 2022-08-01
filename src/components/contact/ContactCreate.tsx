// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { CreateContactSchemaInput } from "../../schema/contact.schema";
import { FC } from "react";

const CreateContact: FC = () => {

  const { handleSubmit, register, control } = useForm<CreateContactSchemaInput>();

  const { mutate, error } = trpc.useMutation(["contact.create"])

  const onSubmit = (data: CreateContactSchemaInput) => {
    mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <p>{error.message}</p>}
      <input className="border" type="email" placeholder="email" {...register("email")}></input>
      <br />
      <input className="border" placeholder="nickName" {...register("nickName")}></input>
      <br />
      <button className="border" type="submit">Submit</button>
    </form>
  );
};

export default CreateContact;
