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
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import { onlyUnique } from "../../utils/onlyUnique";
import { extractEmails } from "../../utils/emails";
import { VariantType, useSnackbar } from 'notistack';


const CreateContactPage: NextPage = () => {

  const [newEmails, setNewEmails] = useState("");
  const utils = trpc.useContext();

  const { mutate: createContact } = trpc.useMutation(['contact.create'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('contact.getAll')
    }
  })

  const newEmailArr = useMemo(()=>extractEmails(newEmails) ?? [], [newEmails])

  console.log(newEmailArr)

  return (
    <>
      <Head>
        <title>Create Contact</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">

        <ContactTable />

        <div className="mt-8 gap-2 flex flex-col items-right">
        <TextField
          multiline
          value={newEmails}
          onChange={(e)=>{setNewEmails(e.target.value)}}
          label="Email (mozna podac wiecej niz jeden)"
          variant="outlined"
          size="small"
          style={{width: "30em"}}
            />
          <Button disabled={newEmailArr.length < 1} variant="outlined" startIcon={<AddIcon />} onClick={()=>{
            newEmailArr.forEach(email=>{
              createContact({email})
            })
          }}>
            {newEmailArr.length < 2 ? "Dodaj Maila" : `Dodaj ${newEmailArr.length} Maili`}
          </Button>
        </div>

      </main>
    </>
  );
};

const ContactTable: FC = () => {
  const { data: contacts, isLoading, error } = trpc.useQuery(['contact.getAll']);

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
            <TableCell>Wysłane Maile</TableCell>
            <TableCell>Nick</TableCell>
            <TableCell>Tagi</TableCell>
            <TableCell align="right">Akcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts?.map((contact) => (
            <ContactRow key={contact.id} contact={contact} allTags={allTags!} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ContactRow: FC<{contact: Contact & {
  _count: {
      Email: number;
  };
}, allTags: string[]}> = ({ contact, allTags }) => {

  const utils = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();

  const [tags, setTags] = useState<string[]>(contact.tags);
  const [nickName, setNickName] = useState(contact.nickName);

  const { mutate: deleteContact, error } = trpc.useMutation(['contact.delete'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('contact.getAll');
    }
  })

  const { mutate: updateContact } = trpc.useMutation(['contact.update'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('contact.getAll')
      enqueueSnackbar(`Zaktualizowano ${contact.email}!`);
    }
  })

  return(
  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
    <TableCell component="th" scope="row">
      {contact.email}
    </TableCell>
    <TableCell component="th" scope="row">
      {contact._count.Email}
    </TableCell>
    <TableCell component="th" scope="row">
      <TextField
        value={nickName}
        onChange={(e)=>{setNickName(e.target.value)}}
        label="Nick"
        variant="outlined"
        fullWidth
        onBlur={()=>{
          if(contact.nickName != nickName){
            updateContact({
              id: contact.id,
              nickName
            })
          }
        }}
      />
    </TableCell>
    <TableCell component="th" scope="row">
      <Autocomplete
        multiple
        id="tags-filled"
        options={allTags}
        freeSolo
        value={tags}
        onChange={(event: any, newValue: string[]) => {
          setTags(newValue);
        }}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
          ))
        }
        onBlur={()=>{
          if(tags != contact.tags){
            updateContact({
              id: contact.id,
              tags
            })
          }
        }}
        onKeyPress={(e) => {
          console.log(e.key)
          if (e.key === "Enter") {
            updateContact({
              id: contact.id,
              tags
            })
          }
        }}
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
