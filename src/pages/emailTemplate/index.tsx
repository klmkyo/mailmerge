// page in which you create emailTemplates

import Head from "next/head";
import { NextPage } from "next";
import EmailTemplateList from "../../components/emailTemplate/EmailTemplateList";
import Link from "next/link";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

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
            Przygotuj nowe szablony
          </Button>
        </Link>
      </div>
    </>
  );
};

export default EmailTemplateIndexPage;
