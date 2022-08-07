import { Card, CardActionArea, Paper } from "@mui/material";
import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";

type TechnologyCardProps = {
  name: string;
  link: string;
  desc?: string;
  highlight?: boolean;
};

const Home: NextPage = () => {

  const { data: Cdata } = trpc.useQuery(["settings.is-gmail-connected"]);

  const isConnected = Cdata?.valueOf() ?? true;

  return (
    <>
      <Head>
        <title>Mailmerge</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold">
          Mail<span className="text-purple-300">Merge</span>
        </h1>

        {
          !isConnected &&
          <h1>
            Nie dokończono konfiguracji z Gmailem, wejdź w{" "}
            <span className="text-purple-400 cursor-pointer italic">
              <Link href="/settings">
                konfigurację
              </Link>
            </span>
            , aby to zrobić.
          </h1>
        }
        <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3">
          <TechnologyCard
            name="Kontakty"
            link="/contact"
            desc="Zarządzanie kontaktami"
          />
          <TechnologyCard
            name="Szablony Maili"
            link="/emailTemplate"
            desc="Utwórz szablony, z których powstaną maile"
          />
          <TechnologyCard
            name="Maile"
            link="/email"
            desc="Utwórz i wysyłaj maile"
          />
          <TechnologyCard
            name="Otworzenia Maili"
            link="/emailVisit"
            desc="Zobacz kto otworzył Twoje maile"
          />
          <TechnologyCard
            name="Konfiguracja"
            link="/settings"
            desc="Konfiguruj ustawienia Gmaila"
            highlight={!isConnected}
          />
        </div>
      </main>
    </>
  );
};

const TechnologyCard = ({
  name,
  link,
  desc,
  highlight = false
}: TechnologyCardProps) => {
  return (
    <Link
      className="mt-3 text-sm underline decoration-dotted underline-offset-2"
      href={link}
    >
      <Card variant="outlined" className="flex flex-col justify-center duration-500 rounded shadow-xl cursor-pointer">
        <CardActionArea style={{padding: "1.5rem"}}>
          <h2 className={`text-lg ${highlight && "text-purple-500"}`}>{name}</h2>
          <h3 className="text-sm">{desc}</h3>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }

  return {
    props: { session }
  }
}
