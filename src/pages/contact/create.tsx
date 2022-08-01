// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { NextPage } from "next";
import { CreateContactSchemaInput } from "../../schema/contact.schema";

const CreateContactPage: NextPage = () => {

  const { handleSubmit, register, control } = useForm<CreateContactSchemaInput>();

  const { mutate, error } = trpc.useMutation(["contact.create"])

  const onSubmit = (data: CreateContactSchemaInput) => {
    mutate(data)
  }

  return (
    <>
      <Head>
        <title>Create Contact</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">

        <form onSubmit={handleSubmit(onSubmit)}>
          {error && <p>{error.message}</p>}
          <input className="border" type="email" placeholder="email" {...register("email")}></input>
          <br />
          <input className="border" placeholder="nickName" {...register("nickName")}></input>
          <br />
          <button className="border" type="submit">Submit</button>
        </form>

      </main>
    </>
  );
};

export default CreateContactPage;
