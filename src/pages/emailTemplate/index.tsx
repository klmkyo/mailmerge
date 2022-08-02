// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";
import { CreateEmailTemplateInput } from "../../schema/emailTemplate.schema";
import EmailTemplateCreate from "../../components/emailTemplate/EmailTemplateCreate";

const CreateEmailTemplatePage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Create Email Template</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <EmailTemplateCreate />
      </main>
    </>
  );
};

export default CreateEmailTemplatePage;
