import type { NextPage } from "next";
import { useRouter } from 'next/router';
import { useState } from "react";
import { trpc } from "../../utils/trpc";


const GmailAuth: NextPage = () => {

  const [authed, setAuthed] = useState(false);

  const router = useRouter();

  const code = router.query.code as string | undefined;

  console.log(router.query);

  const { mutate: OAmutate } = trpc.useMutation(["settings.upsert-gmail-auth"], {
    onSuccess: () => {
      router.push("/settings");
    }
  })

  // if there is a code query param, send it to the server
  if (code && !authed) {
    OAmutate({ authorizationCode: code })
    setAuthed(true)
  }

  return (
    <>
    Przetwarzanie...
    </>
  );
};

export default GmailAuth;
