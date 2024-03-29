
import { NextPage } from "next";
import Head from "next/head";
import { EmailObj, trpc } from "../../utils/trpc";

import CloseIcon from '@mui/icons-material/Close';
import { Badge, useTheme } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Contact, Email } from "@prisma/client";
import { sanitize } from "dompurify";
import moment from 'moment';
import 'moment/locale/pl';
import dynamic from "next/dynamic";
import { useState } from "react";
import { Letter } from 'react-letter';
import { Loading } from "../../components/Loading";
import { inferQueryOutput } from '../../utils/trpc';
import CircleIcon from '@mui/icons-material/Circle';

const ReactJson = dynamic(() => import('react-json-view'), {ssr: false})



type EVEmail = inferQueryOutput<"emailVisit.get-all">[number]["email"]

const EmailVisitPage: NextPage = () => {

  const theme = useTheme();

  // get all email visits
  const { data: emailVisits, error, isLoading } = trpc.useQuery(["emailVisit.get-all"]);

  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const [currentQuery, setCurrentQuery] = useState<Object | null>(null);
  const [currentEmail, setCurrentEmail] = useState<EVEmail | null>(null);

  if(isLoading){
    return <Loading />
  }

  if(emailVisits ? emailVisits.length === 0 : true) return (
    <div className=" text-3xl flex justify-center items-center w-full h-screen">
      Wygląda na to że nikt nie otworzył jeszcze twoich maili! lol
    </div>
  );

  return (
    <>
      <Head>
        <title>Wyświetlenia Maili</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={3}>
                  Kontakt
                </TableCell>
                <TableCell align="center" colSpan={4}>
                  Mail
                  </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell align="right">Nazwa</TableCell>
                <TableCell align="right">Wyświetl Dane</TableCell>
                <TableCell align="right">Tytuł</TableCell>
                <TableCell align="right">ID </TableCell>
                <TableCell align="right">Data Otworzenia</TableCell>
                <TableCell align="right">Wyświetl Maila</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
              emailVisits?.map((ev) => {
                const email = ev.email;
                const nickName = email?.contact?.nickName ?? null;
                console.log(ev)
                return(
                <TableRow
                  key={ev.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <div className="inline-flex items-center gap-2">
                      {ev.seenByUser ? null :
                        <CircleIcon color="primary" sx={{height: ".5em"}} />
                      }
                      {/* realistically it will always be the first one, but whatever */}
                      {email.sentTo ?? email.toBeSentTo}
                    </div>
                  </TableCell>
                  <TableCell align="right">{nickName}</TableCell>
                  <TableCell align="right">
                  <Button size="small" onClick={()=>{
                    setCurrentQuery(ev.requestData);
                    setQueryDialogOpen(true);
                  }}>
                    Dane
                  </Button>
                  </TableCell>
                  <TableCell align="right">{email.subject}</TableCell>
                  <TableCell align="right">{email.id}</TableCell>
                  <TableCell align="right">{ev.visitedAt.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={()=>{
                      setCurrentEmail(email);
                      setEmailDialogOpen(true);
                    }}>
                      Mail
                    </Button>
                  </TableCell>
                </TableRow>
                )
              })
              }
            </TableBody>
          </Table>
        </TableContainer>
      </main>

      {/* Query Dialog */}
      <Dialog maxWidth="xl" onClose={()=>setQueryDialogOpen(false)} open={queryDialogOpen}>
        <DialogTitle style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          Dane

          <IconButton
            onClick={()=>setQueryDialogOpen(false)}
          >
            <CloseIcon />
          </IconButton>

        </DialogTitle>

        <ReactJson style={{padding: "1rem"}} theme={theme.palette.mode === "dark" ? "monokai" : "rjv-default"} src={currentQuery!} />
      </Dialog>

      {/* Email Dialog */}
      <Dialog maxWidth="xl" onClose={()=>setEmailDialogOpen(false)} open={emailDialogOpen}>
        <EmailCard email={currentEmail!} onClose={()=>setEmailDialogOpen(false)} />
      </Dialog>
    </>
  );
};

export const EmailCard = ({ email, onClose }: {
  email: EmailObj,
  onClose: () => void
}) => {
  return (
    <Box className="flex flex-col items-stretch m-2 p-4 relative" style={{ width: "50em", height: "40em" }}>

      <header className="flex justify-between pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{email.subject}</div>
          <div><i>Do: {email.sentTo}</i></div>
        </div>
        <div className="flex flex-col items-end">
          <IconButton
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
          <div>{email.tags?.join(", ")}</div>
        </div>
      </header>
      <Divider />

      <div className="flex-1 mt-3">
        <Letter html={sanitize(email.body)} />
      </div>

      <Divider />
      <footer className="flex justify-between items-center pt-3.5">
        <div>
          <div>
            {email.sentAt ?
              <>
                {`Wysłano: ${email.sentAt!.toLocaleString()}`}
                <Typography color="text.secondary" className="italic ml-2">
                  {`(${moment(email.sentAt!).locale("pl").fromNow()})`}
                </Typography>
              </>
              :
              email.toBeSentAt &&
              <>
                {`Do wysłania o: ${email.toBeSentAt!.toLocaleString()}`}
                <Typography color="text.secondary" className="italic ml-2">
                  {`(${moment(email.toBeSentAt!).locale("pl").fromNow()})`}
                </Typography>
              </>
            }
          </div>
        </div>
      </footer>
      <div className="absolute bottom-0.5 right-1 text-xs text-gray-300 italic">ID: {email.id}</div>
    </Box>
  )
};

export default EmailVisitPage;
