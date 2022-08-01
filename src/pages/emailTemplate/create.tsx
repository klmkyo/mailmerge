// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";
import { CreateEmailTemplateInput } from "../../schema/emailTemplate.schema";

const CreateEmailTemplatePage: NextPage = () => {
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

  const { handleSubmit, register } = useForm<CreateEmailTemplateInput>();

  const { mutate, error } = trpc.useMutation(["emailTemplate.create"])

  const onSubmit = (data: CreateEmailTemplateInput) => {
    mutate(data)
  }

  return (
    <>
      <Head>
        <title>Create Email Template</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">

        <form onSubmit={handleSubmit(onSubmit)}>
          {error && <p>{error.message}</p>}
          <input className="border" type="subject" placeholder="subject" {...register("subject")}></input>
          <br />
          <textarea className="border" placeholder="body" {...register("body")}></textarea>
          <br />
          <button className="border" type="submit">Submit</button>
        </form>

      </main>
    </>
  );
};

export default CreateEmailTemplatePage;
