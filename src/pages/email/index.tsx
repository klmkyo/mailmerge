// page in which you create emailTemplates

import AddIcon from '@mui/icons-material/Add';
import { Button } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import LoadingButton from '@mui/lab/LoadingButton';
import Link from "next/link";
import EmailDisplay from "../../components/email/EmailDisplay";
import { isDev } from '../../utils/isDev';
import UpdateIcon from '@mui/icons-material/Update';
import { trpc } from '../../utils/trpc';

const EmailIndexPage: NextPage = () => {

  const utils = trpc.useContext();

  const { mutate: sendUnsentMails, isLoading } = trpc.useMutation(["public.send-unsent-emails"], {
    onSuccess: (data) => {
      utils.invalidateQueries('email.getAll')
    }
  });

  return (
    <>
      <Head>
        <title>Emails</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailDisplay />
      </main>

      <div className="flex gap-4 fixed bottom-6 right-6">
        {
          // TODO remove true
          ( isDev ) &&
          <LoadingButton loading={isLoading} loadingPosition="start" variant="outlined" startIcon={<UpdateIcon />} onClick={()=>sendUnsentMails()}>
            Wymuś sprawdzenie kolejki
          </LoadingButton>
        }
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
