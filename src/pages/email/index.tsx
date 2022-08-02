// page in which you create emailTemplates

import Head from "next/head";
import { NextPage } from "next";
import EmailCreate from "../../components/email/EmailCreate";

const CreateMailPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Create Mail</title>
      </Head>

      <EmailCreate />
    </>
  );
};

export default CreateMailPage;
