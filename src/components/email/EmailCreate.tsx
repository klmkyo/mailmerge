import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Contact, EmailTemplate } from "@prisma/client";
import { sanitize } from "dompurify";
import parse from 'html-react-parser';
import { useRouter } from "next/router";
import { FC, useContext, useMemo } from "react";
import { Loading } from "../../components/Loading";
import { generateEmails } from "../../utils/emails";
import { isDev } from "../../utils/isDev";
import { onlyUnique } from "../../utils/onlyUnique";
import { trpc } from "../../utils/trpc";
import { ContactContext, ContactContextProvider, EmailTemplateContext, EmailTemplateProvider } from "./contexts";


// TODO zaznaczanie na podstawie tagów

export function EmailCreateUnwrapped() {

  const router = useRouter();

  const { mutate, error } = trpc.useMutation(["email.create-multiple"], {
    onSuccess() {
      router.push("/email")
    }
  })

  const { contacts } = useContext(ContactContext);
  const { emailTemplates } = useContext(EmailTemplateContext);

  const selectedContactsCount = useMemo( ()=> contacts.filter(c=>c.selected).length, [contacts])
  const selectedEmailTemplatesCount = useMemo( ()=> emailTemplates.filter(e=>e.selected).length, [emailTemplates])

  console.log({ contacts, emailTemplates })

  return (
    <>

      {/* Kontakty */}

      <b><h1 className="text-xl">1. Wybierz kontakty, do których będą wysłane maile:</h1></b>
      <div className="flex w-full justify-center mt-8">
        <ContactTable />
      </div>
      <br />

      {/* Szablony */}

      <b><h1 className="text-xl mt-20">2. Wybierz szablony, które będą wysyłane:</h1></b>
      <p className="text-xs italic font-grey-400 mt-1 mb-10">{`(dla kazdego odbiorcy zostanie losowo wybrany jeden z zaznaczonych szablonow)`}</p>

      <div className="flex w-full justify-center">
        <Box sx={{ width: "100%" }}>
          <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
            {emailTemplates?.map((emailTemplate) => {
              return (
                <EmailTemplate key={emailTemplate.id} emailTemplate={emailTemplate}/>
              )
            })}
          </Grid>
        </Box>
      </div>

      <br />

      <p className="flex items-center">
        <span className="text-xs italic font-grey-600 mt-1 mb-2 mr-2">
          Zaznaczone kontakty: {selectedContactsCount}
        </span>
        {` | `}
        <span className="text-xs italic font-grey-600 mt-1 mb-2 ml-2">
          Zaznaczone szablony: {selectedEmailTemplatesCount}
        </span>
      </p>
      <Button
        variant="outlined"
        size="large"
        onClick={() => {
          const selectedContacts = contacts.filter(contact => contact.selected);
          const selectedEmailTemplates = emailTemplates.filter(template => template.selected);
          const emails = generateEmails(selectedContacts, selectedEmailTemplates);
          console.log({ emails });
          mutate(emails);
        }}>
        <b>3. Utwórz Maile</b>
      </Button>

      {/* Bottom bar */}

      {isDev && <div className="fixed bottom-0 m-2 mr-8 flex gap-4 justify-end w-full">
        <Button variant="outlined" onClick={() => console.log({ contacts, emailTemplates })}>Log Contacts {'&'} Templates</Button>
      </div>}
    </>
  )
}

const EmailTemplate = ({ emailTemplate }: {
  emailTemplate: EmailTemplate
}) => {

  const { toggleEmailTemplateSelection } = useContext(EmailTemplateContext);

  return (
    <div className="flex flex-col items-stretch m-2 p-4 border relative" style={{ width: "min(50em, 100%)", height: "40em" }}>

      <header className="flex justify-between border-b pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{emailTemplate.subject}</div>
        </div>
        <div className="flex flex-col items-end">
          <Checkbox name={emailTemplate.id} sx={{ margin: "-0.5em -0.5em 0" }} onChange={(e)=>toggleEmailTemplateSelection({id: emailTemplate.id, selected: e.target.checked})} />
          <div>{emailTemplate.tags?.join(", ")}</div>
        </div>
      </header>

      <div className="flex-1 mt-3 unset">
        {parse(sanitize(emailTemplate.body))}
      </div>

      <footer className="flex justify-between border-t pt-2">
        <div />
      </footer>
      {isDev && <div className="absolute bottom-0.5 right-1 text-xs text-gray-400 italic">ID: {emailTemplate.id}</div>}
    </div>
  )
};

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
            <TableCell align="right">Zaznacz Wszystko</TableCell>
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

const ContactRow: FC<{contact: Contact & {
  _count: {
      Email: number;
  };
}}> = ({ contact }) => {

  const { toggleContactSelection } = useContext(ContactContext);

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
      <div className="flex gap-2">
      {
        contact.tags.map((tag, i) => (
          <Chip variant="outlined" label={tag} key={i} />
        ))
      }
      </div>
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
