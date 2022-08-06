// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { NextPage } from "next";
import { CreateContactSchemaInput } from "../../schema/contact.schema";
import CreateContact from "../../components/contact/ContactCreate";
import ContactList from "../../components/contact/ContactList";
import { FC, MouseEvent, useState, useMemo } from "react";
import { Contact } from "@prisma/client";
import Table from '@mui/material/Table';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import Popover from '@mui/material/Popover';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Autocomplete from '@mui/material/Autocomplete';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import { onlyUnique } from "../../utils/onlyUnique";


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

  const [newNickName, setNewNickName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const allTags = useMemo( () => contacts?.map((c)=>c.tags).flat().filter(onlyUnique), [contacts])

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
            <TableCell>Nick</TableCell>
            <TableCell align="right">Tagi</TableCell>
            <TableCell align="right">Akcje</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {contacts?.map((contact) => (
            <ContactRow key={contact.id} contact={contact} allTags={allTags!} />
          ))}

          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
          <TableCell component="th" scope="row">
            <TextField
              value={newEmail}
              onChange={(e)=>{setNewEmail(e.target.value)}}
              label="Email"
              variant="outlined"
              size="small"
              fullWidth
            />
          </TableCell>
          <TableCell component="th" scope="row">
            <TextField
              value={newNickName}
              onChange={(e)=>{setNewNickName(e.target.value)}}
              label="Nick"
              variant="outlined"
              size="small"
              fullWidth
            />
          </TableCell>
          <TableCell component="th" align="right" scope="row">
            Dodaj taga
          </TableCell>
          {/* edit button */}
          <TableCell component="th" align="right" scope="row">
            +
          </TableCell>
        </TableRow>
          
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ContactRow: FC<{contact: Contact, allTags: string[]}> = ({ contact, allTags }) => {

  const utils = trpc.useContext();

  const [value, setValue] = useState<string | null>(allTags[0]);
  const [inputValue, setInputValue] = useState('');


  const { mutate: deleteContact, error } = trpc.useMutation(['contact.delete'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('contact.getAll')
    }
  })

  const { mutate: updateContact } = trpc.useMutation(['contact.update'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('contact.getAll')
    }
  })

  return(
  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
    <TableCell component="th" scope="row">
      {contact.email}
    </TableCell>
    <TableCell component="th" scope="row">
      {contact.nickName}
    </TableCell>
    <TableCell component="th" align="right" scope="row">
      <Autocomplete
        multiple
        id="tags-filled"
        options={allTags}
        freeSolo
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tagi"
          />
        )}
      />
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
        onClick={()=>deleteContact({ id: contact.id })}
      >
        <DeleteIcon />
      </IconButton>

    </TableCell>
  </TableRow>
  )
}

export default CreateContactPage;
