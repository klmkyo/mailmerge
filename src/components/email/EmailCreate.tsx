import React, { useContext, useState, useMemo, FC } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { generateEmails } from "../../utils/emails";
import { isDev } from "../../utils/isDev";
import { trpc } from "../../utils/trpc";
import { ContactContext, ContactContextProvider, EmailTemplateContext, EmailTemplateProvider } from "./contexts";
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
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import { onlyUnique } from "../../utils/onlyUnique";
import { extractEmails } from "../../utils/emails";
import { VariantType, useSnackbar } from 'notistack';
import { Loading } from "../../components/Loading";


export function EmailCreateUnwrapped() {

  const router = useRouter();

  const { mutate, error } = trpc.useMutation(["email.create-multiple"], {
    onSuccess() {
      router.push("/email")
    }
  })

  const { contacts } = useContext(ContactContext);
  const { emailTemplates, toggleEmailTemplateSelection } = useContext(EmailTemplateContext);

  console.log({ contacts, emailTemplates })

  return (
    <>

      {/* Kontakty */}

      Kontakty:
      <div className="flex w-full justify-center">
        <ContactTable />
      </div>
      <br />

      {/* Szablony */}

      Choose templates to use {"(a template will be randomly chosen for each receipient)"}

      <div className="flex w-full justify-center h-52">
        {emailTemplates.map(template => (
          <div key={template.id} className="flex items-center p-2">
            <input type="checkbox" checked={template.selected} onChange={() => {
              toggleEmailTemplateSelection(template.id);
            }} />
            Tytuł: {template.subject}
            <br />
            {/* Treść: {template.body} */}
            <br />
            Tagi: {template.tags}
          </div>
        ))}
      </div>

      <br />
      
      {/* Bottom bar */}

      <div className="fixed bottom-0 m-2 mr-8 flex gap-4 justify-end w-full">
        {isDev && <Button variant="outlined" onClick={() => console.log({ contacts, emailTemplates })}>Log Contacts {'&'} Templates</Button>}
        <Button
          variant="outlined"
          onClick={() => {
            const selectedContacts = contacts.filter(contact => contact.selected);
            const selectedEmailTemplates = emailTemplates.filter(template => template.selected);
            const emails = generateEmails(selectedContacts, selectedEmailTemplates);
            console.log({ emails });
            mutate(emails);
          }}>
          Utwórz Maile
        </Button>
      </div>
    </>
  )
}

const ContactTable: FC = () => {
  const { data: contacts, isLoading, error } = trpc.useQuery(['contact.getAll']);

  const allTags = useMemo( () => contacts?.map((c)=>c.tags).flat().filter(onlyUnique), [contacts])

  if (isLoading) {
    return (
      <Loading />
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
            <TableCell align="right">Zaznacz</TableCell>
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
}}> = ({ contact }) => {

  const utils = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();
  const { toggleContactSelection } = useContext(ContactContext);

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
      {contact.nickName}
    </TableCell>
    <TableCell component="th" scope="row">
      {
        contact.tags.map((tag) => (
          <Chip variant="outlined" label={tag} key={index} />
        ))
      }
    </TableCell>
    <TableCell component="th" align="right" scope="row">

      <Checkbox onChange={(e)=>toggleContactSelection({id: contact.id, selected: e.target.checked})} />

    </TableCell>
  </TableRow>
  )
}

export default function EmailCreate() {
  return (
    <EmailTemplateProvider>
      <ContactContextProvider>
        <EmailCreateUnwrapped />
      </ContactContextProvider>
    </EmailTemplateProvider>
  )
}
