// page in which you create emailTemplates

import AddIcon from '@mui/icons-material/Add';
import { Button } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import EmailTemplateList from "../../components/emailTemplate/EmailTemplateList";

const EmailTemplateIndexPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Szablony Maili</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailTemplateList />
      </main>

      <div className="fixed bottom-6 right-6">
        <Link href="/emailTemplate/create" passHref>
          <Button variant="contained" startIcon={<AddIcon />}>
            Przygotuj nowy szablon
          </Button>
        </Link>
      </div>
    </>
  );
};

export default EmailTemplateIndexPage;
