// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";
import EmailList from "../../components/email/EmaiList";
import Link from "next/link";

const EmailIndexPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Emails</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <EmailList />
      </main>

      <div className="fixed bottom-0 p-4 flex gap-4 justify-end w-full">
        <Link href="/email/createDrafts">
          Przygotuj nowe maile
        </Link>
      </div>
    </>
  );
};

export default EmailIndexPage;
