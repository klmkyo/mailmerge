import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getSession } from "next-auth/react"

type TechnologyCardProps = {
  name: string;
  link: string;
  desc?: string;
};

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Mailmerge</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Mail<span className="text-purple-300">Merge</span>
        </h1>
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
          />
        </div>
      </main>
    </>
  );
};

const TechnologyCard = ({
  name,
  link,
  desc
}: TechnologyCardProps) => {
  return (
    <Link
      className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2"
      href={link}
      target="_blank"
      rel="noreferrer"
    >
      <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
        <h2 className="text-lg text-gray-700">{name}</h2>
        <h3 className="text-sm text-gray-500">{desc}</h3>
      </section>
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
