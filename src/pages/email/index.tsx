// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";
import EmailList from "../../components/email/EmaiList";
import Link from "next/link";
import { Button } from "@mui/material";

const EmailIndexPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Emails</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailList />
      </main>

      <div className="fixed bottom-0 p-4 flex gap-4 justify-end w-full">
        <Link href="/email/createDrafts">
          <Button variant="contained">
            Przygotuj nowe maile
          </Button>
        </Link>
      </div>
    </>
  );
};

export default EmailIndexPage;
