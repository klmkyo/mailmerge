import { EmailTemplate } from "@prisma/client";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { FC } from "react";
import EmailTemplateCreate from "../../../components/emailTemplate/EmailTemplateCreate";
import {prisma} from "../../../server/db/client";

const EmailTemplateEdit: FC<{providedEmailTemplate: EmailTemplate}> = ({providedEmailTemplate}) => {
  return (
    <>
      <Head>
        <title>Edytuj Szablon Maila</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailTemplateCreate providedEmailTemplate={providedEmailTemplate} />
      </main>
    </>
  );
};

export default EmailTemplateEdit;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { templateId } = ctx.query;

  const template = await prisma.emailTemplate.findFirstOrThrow({
    where: {
      id: templateId as string
    },
    select: {
      id: true,
      subject: true,
      body: true
    }
  });

  console.log(template);

  return {
    props: {
      providedEmailTemplate: template
    }
  }
}
