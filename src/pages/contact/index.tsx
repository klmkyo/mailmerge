// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { NextPage } from "next";
import { CreateContactSchemaInput } from "../../schema/contact.schema";
import CreateContact from "../../components/contact/ContactCreate";
import ContactList from "../../components/contact/ContactList";
import { FC, MouseEvent, useState } from "react";
import { Contact } from "@prisma/client";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteIcon from '@mui/icons-material/Delete';


const CreateContactPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Create Contact</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">

        <CreateContact />

        <br />

        <ContactTable />

      </main>
    </>
  );
};

const ContactTable: FC = () => {
  const { data: contacts, isLoading, error } = trpc.useQuery(['contact.getAll']);

  if (isLoading) {
    return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell align="right">Nick</TableCell>
            <TableCell align="right">Tagi</TableCell>
            <TableCell align="right">Akcje</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {contacts?.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ContactRow: FC<{contact: Contact}> = ({ contact }) => {

  const utils = trpc.useContext();

  const { mutate, error } = trpc.useMutation(['contact.delete'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('contact.getAll')
    }
  })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return(
  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
    <TableCell component="th" scope="row">
      {contact.email}
    </TableCell>
    <TableCell component="th" align="right" scope="row">
      {contact.nickName}
    </TableCell>
    <TableCell component="th" align="right" scope="row">
      {contact.tags}
    </TableCell>
    {/* edit button */}
    <TableCell component="th" align="right" scope="row">

      <IconButton
        aria-label="edit"
      >
        <EditIcon />
      </IconButton>

      <IconButton
        aria-label="delete"
        onClick={()=>mutate({ id: contact.id })}
      >
        <DeleteIcon />
      </IconButton>

    </TableCell>
  </TableRow>
  )
}

export default CreateContactPage;
