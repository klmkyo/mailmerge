// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";
import { CreateEmailTemplateInput } from "../../schema/emailTemplate.schema";
import EmailTemplateCreate from "../../components/emailTemplate/EmailTemplateCreate";
import EmailTemplateList from "../../components/emailTemplate/EmailTemplateList";

const CreateEmailTemplatePage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Create Email Template</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <EmailTemplateCreate />
        <br />
        <EmailTemplateList />
      </main>
    </>
  );
};

export default CreateEmailTemplatePage;
