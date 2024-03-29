import BuildIcon from '@mui/icons-material/Build';
import EmailIcon from '@mui/icons-material/Email';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { Loading } from "../../components/Loading";
import { trpc } from "../../utils/trpc";

const Settings: NextPage = () => {

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const { data: OAdata, error: OAerror } = trpc.useQuery(["google.get-oauth-url"]);
  const { data: Edata, error: Eerror } = trpc.useQuery(["google.get-gmail-email"]);
  const { data: Cdata, isLoading, error: Cerror } = trpc.useQuery(["google.is-gmail-connected"]);

  const { mutate: sendTestMail, error: TMerror, isLoading: isEmailSending } = trpc.useMutation(["email.send-test-mail"], {
    onSuccess() {
      enqueueSnackbar("Wysłano maila! Sprawdź swoją skrzynkę", { variant: 'success', preventDuplicate: true })
    }
  })

  if(isLoading){
    return <Loading />
  }

  return (
    <>
      <Head>
        <title>Ustawienia</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="text-xl">Możesz tutaj podpiąć dowolny adres Gmail, z którego będą wysyłane maile</div>
        <Box className="italic" sx={{ color: 'text.secondary' }}>{"(może to być adres inny od tego w górnym lewym rogu strony)"}</Box>

        <Divider className="w-80" style={{margin: "1rem"}} />

        <div className="flex flex-col items-center gap-3">
          {Eerror && Eerror.message}
          <p>
            {
              Cdata ? `Połączono z ${Edata?.email ?? ""}!` :
                Edata?.valueOf() ? `Połączono z ${Edata!.email}, ale wystąpił błąd. Skonfiguruj Gmaila jeszcze raz.` : "Nie połączono z Gmail"
            }
          </p>
          {OAerror && OAerror.message}
          {
            OAdata?.url &&
            <a href={OAdata.url}>
              <Button variant="outlined" startIcon={<BuildIcon />}>
                {`Skonfiguruj${Cdata ? " ponownie" : ""} Gmaila`}
              </Button>
            </a>
          }
          {Cerror && Cerror.message}
          {TMerror && TMerror.message}
          {
            Cdata?.valueOf() &&
            <LoadingButton variant="outlined" startIcon={<EmailIcon />} onClick={()=>sendTestMail()} loading={isEmailSending} loadingPosition="start">
              Wyślij testowego maila {"(do siebie)"}
            </LoadingButton>
          }
        </div>
      </main>
    </>
  );
};

export default Settings;
