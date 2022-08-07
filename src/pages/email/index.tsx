// page in which you create emailTemplates

import AddIcon from '@mui/icons-material/Add';
import { Button } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import EmailDisplay from "../../components/email/EmailDisplay";

const EmailIndexPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Emails</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailDisplay />
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
