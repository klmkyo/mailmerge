import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from 'next/router';
import { useForm } from "react-hook-form";
import { trpc } from "../../utils/trpc";


const Settings: NextPage = () => {

  const router = useRouter();
  const utils = trpc.useContext();

  const code = router.query.code as string | undefined;

  const { data: OAdata, error: OAerror } = trpc.useQuery(["settings.get-oauth-url"]);
  const { data: Edata, error: Eerror } = trpc.useQuery(["settings.get-gmail-email"]);
  const { data: Cdata, error: Cerror } = trpc.useQuery(["settings.is-gmail-connected"]);

  const { handleSubmit, register, control } = useForm<{ email: string }>();
  const { mutate, error } = trpc.useMutation(["settings.update-email"], {
    onSuccess: (data) => {
      utils.invalidateQueries('settings.get-gmail-email')
    }
  })
  const onSubmit = (data: { email: string }) => {
    mutate(data)
  }

  return (
    <>
      <Head>
        <title>Ustawienia</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col gap-4 items-center justify-center h-screen p-4">
        <p>{Cdata?.valueOf() ? "Połączono z Gmail!" : "Nie połączono z Gmail"}</p>
        {OAerror && OAerror.message}
        {
          Cdata &&
          <div className="flex flex-col justify-center">
            Nizej podany email musi byc taki sam, jak ten uzyty do konfiguracji 
            <form onSubmit={handleSubmit(onSubmit)} className="flex justify-center">
              <input className="border mr-2" type="email" placeholder={Edata?.email} {...register("email")}></input>
              <button className="border" type="submit">Zaktualizuj Email</button>
            </form>
          </div>
        }
        {OAdata?.url && <a href={OAdata.url} className="border">{`Skonfiguruj${Cdata ? " ponownie" : ""} Gmaila${Cdata ? " (Jeśli występują problemy)" : ""}`}</a>}
      </main>
    </>
  );
};

export default Settings;
