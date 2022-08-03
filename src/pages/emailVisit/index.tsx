
import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useForm } from 'react-hook-form';
import { NextPage } from "next";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';



const EmailVisitPage: NextPage = () => {

  // get all email visits
  const { data: emailVisits, error, isLoading } = trpc.useQuery(["emailVisit.get-all"]);

  return (
    <>
      <Head>
        <title>Wyświetlenia Maili</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={2}>
                  Kontakt
                </TableCell>
                <TableCell align="center" colSpan={4}>
                  Mail
                  </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell align="right">Nazwa</TableCell>
                <TableCell align="right">Tytuł</TableCell>
                <TableCell align="right">ID </TableCell>
                <TableCell align="right">Data Otworzenia</TableCell>
                <TableCell align="right">Wyświetl</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
              emailVisits?.map((ev) => {
                const email = ev.email;
                const contact = email.contact;
                return(
                <TableRow
                  key={ev.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {contact.email}
                  </TableCell>
                  <TableCell align="right">{contact.nickName}</TableCell>
                  <TableCell align="right">{email.subject}</TableCell>
                  <TableCell align="right">{email.id}</TableCell>
                  <TableCell align="right">{ev.visitedAt.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button>
                      Zobacz
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
    </>
  );
};

export default EmailVisitPage;
