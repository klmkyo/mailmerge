import type { NextPage } from "next";
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useState } from "react";
import { Loading } from "../../components/Loading";
import { trpc } from "../../utils/trpc";


const GmailAuth: NextPage = () => {

  const [authed, setAuthed] = useState(false);

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const code = router.query.code as string | undefined;

  console.log(router.query);

  const { mutate: OAmutate } = trpc.useMutation(["settings.upsert-gmail-auth"], {
    onSuccess: () => {
      enqueueSnackbar("Skonfigurowano Gmaila!", { variant: 'success', preventDuplicate: true });
      router.push( { pathname: '/settings', query: { success: true } } );
    }
  })

  // if there is a code query param, send it to the server
  if (code && !authed) {
    OAmutate({ authorizationCode: code })
    setAuthed(true)
  }

  return (
    <Loading />
  );
};

export default GmailAuth;
