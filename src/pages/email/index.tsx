// page in which you create emailTemplates

import AddIcon from '@mui/icons-material/Add';
import { Button } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import EmailDisplay from "../../components/email/EmailDisplay";
import { trpc } from '../../utils/trpc';

const EmailIndexPage: NextPage = () => {

  const utils = trpc.useContext();

  return (
    <div style={{minWidth: "1599px"}}>
      <Head>
        <title>Emaile</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailDisplay />
      </main>

      <div className="flex gap-4 fixed bottom-6 right-6">
        <Link href="/email/createDrafts" passHref>
          <Button variant="contained" startIcon={<AddIcon />}>
            Utwórz nowe maile
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmailIndexPage;
