// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";
import EmailList from "../../components/email/EmaiList";
import Link from "next/link";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

const EmailIndexPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Emails</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailList />
      </main>

      <div className="fixed bottom-6 right-6">
        <Link href="/email/createDrafts" passHref>
          <Button variant="contained" startIcon={<AddIcon />}>
            Utwórz nowe maile
          </Button>
        </Link>
      </div>
    </>
  );
};

export default EmailIndexPage;
