
import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";


const EmailVisitPage: NextPage = () => {

  // get all email visits
  const { data: emailVisits, error } = trpc.useQuery(["emailVisit.get-all"]);
  if (emailVisits) {
    emailVisits.map(emailVisit => {
      console.log(emailVisit)
    })
  }

  return (
    <>
      <Head>
        <title>Wyświetlenia Maili</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">

      </main>
    </>
  );
};

export default EmailVisitPage;
