import { NextPage } from "next";
import Head from "next/head";
import EmailTemplateCreate from "../../components/emailTemplate/EmailTemplateCreate";

const EmailTemplateCreatePage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Utwórz Szablon Maila</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailTemplateCreate />
      </main>
    </>
  );
};

export default EmailTemplateCreatePage;
