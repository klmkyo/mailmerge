
import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";


const EmailVisitPage: NextPage = () => {

  // get all email visits
  const { data: emailVisits, error, isLoading } = trpc.useQuery(["emailVisit.get-all"]);

  return (
    <>
      <Head>
        <title>Wyświetlenia Maili</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <div className="flex flex-col gap-4">
          {
            emailVisits?.map(emailVisit => {
              const email = emailVisit.email;
              const contact = email.contact;
              return (
                <div key={emailVisit.id}>
                  <div>{contact.email}{contact.nickName && ` (${contact.nickName})`} otworzył {`"${email.subject}" (${email.id})`} | {emailVisit.visitedAt.toLocaleString()}</div>
                </div>
              )
            })
          }
        </div>
      </main>
    </>
  );
};

export default EmailVisitPage;
