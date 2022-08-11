// page in which you create emailTemplates

import { NextPage } from "next";
import Head from "next/head";
import EmailCreate from "../../components/email/EmailCreate";

const CreateMailPage: NextPage = () => {

  return (
    <main className="w-full flex flex-col items-center justify-center p-10">
      <Head>
        <title>Utwórz Maila</title>
      </Head>

      <EmailCreate />
    </main>
  );
};

export default CreateMailPage;
