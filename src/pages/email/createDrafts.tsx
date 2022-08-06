// page in which you create emailTemplates

import Head from "next/head";
import { NextPage } from "next";
import EmailCreate from "../../components/email/EmailCreate";

const CreateMailPage: NextPage = () => {

  return (
    <main className="w-full flex flex-col items-center justify-center p-10">
      <Head>
        <title>Create Mail</title>
      </Head>

      <EmailCreate />
    </main>
  );
};

export default CreateMailPage;
