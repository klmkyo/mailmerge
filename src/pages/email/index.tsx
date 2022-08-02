// page in which you create emailTemplates

import Head from "next/head";
import { NextPage } from "next";
import EmailCreate from "../../components/email/EmailCreate";

const CreateMailPage: NextPage = () => {

  return (
    <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
      <Head>
        <title>Create Mail</title>
      </Head>

      <EmailCreate />
    </main>
  );
};

export default CreateMailPage;
