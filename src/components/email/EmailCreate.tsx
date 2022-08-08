import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
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
import { FC, useContext, useMemo, useState } from "react";
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

  return (
    <>

      {/* Kontakty */}

      <b><h1 className="text-xl">1. Wybierz kontakty, do których będą wysłane maile:</h1></b>
      <div className="flex w-full justify-center mt-8">
        <ContactTable />
      </div>
        <span className="text-xl mt-6">
          Zaznaczone kontakty: {selectedContactsCount}
        </span>
      <br />

      {/* Szablony */}

      <b><h1 className="text-xl mt-20">2. Wybierz szablon{" (lub szablony)"}, który będzie wysyłany:</h1></b>
      <p className="text-xs italic font-grey-400 mt-1 mb-10">{`(jeśli wybierzesz klilka, to dla każdego odbiorcy zostanie losowo wybrany jeden z zaznaczonych szablonow)`}</p>

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
        disabled={selectedContactsCount === 0 || selectedEmailTemplatesCount === 0}
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
    <Paper elevation={3} square className="flex flex-col items-stretch m-2 p-4 relative" style={{ width: "min(50em, 100%)", height: "40em" }}>

      <header className="flex justify-between pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{emailTemplate.subject}</div>
        </div>
        <div className="flex flex-col items-end">
          <Checkbox name={emailTemplate.id} sx={{ margin: "-0.5em -0.5em 0" }} onChange={(e)=>toggleEmailTemplateSelection({id: emailTemplate.id, selected: e.target.checked})} />
          <div>{emailTemplate.tags?.join(", ")}</div>
        </div>
      </header>
      <Divider />


      <div className="flex-1 mt-3 unset">
        {parse(sanitize(emailTemplate.body))}
      </div>

      <Divider />
      <footer className="flex justify-between pt-2">
        <div />
      </footer>
      {isDev && <div className="absolute bottom-0.5 right-1 text-xs text-gray-400 italic">ID: {emailTemplate.id}</div>}
    </Paper>
  )
};

const ContactTable: FC = () => {
  const { contacts, toggleContactSelection } = useContext(ContactContext);

  const allTags = useMemo( () => contacts?.map((c)=>c.tags).flat().filter(onlyUnique), [contacts])

  // an object containing tag: select_count pairs
  const tagCountMap = useMemo( () => {
    const tempTagCountMap: {[tag: string]: number} = {}
    contacts.forEach( (contact) => {
      contact.tags.forEach( tag => {
        tempTagCountMap[tag] = (tempTagCountMap[tag] || 0) + 1
      })
    })
    return tempTagCountMap;
  }, [contacts])

  const selectedContacts = contacts?.filter(c=>c.selected);

  // an object containing tag: select_count pairs, but for selected tags
  const selectedTagCountMap = useMemo( () => {
    const tempTagCountMap: {[tag: string]: number} = {}
    selectedContacts.forEach( (contact) => {
      contact.tags.forEach( tag => {
        tempTagCountMap[tag] = (tempTagCountMap[tag] || 0) + 1
      })
    })
    return tempTagCountMap;
  } , [selectedContacts])

  const [checked, setChecked] = useState(false);

  const shouldBeChecked = selectedContacts.length === (contacts?.length ?? 0)
  if(shouldBeChecked !== checked){
    setChecked(shouldBeChecked)
  }

  console.log({contacts, selectedContacts})

  return (
    <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
      <Table sx={{ minWidth: 650 }} size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Wysłane Maile</TableCell>
            <TableCell>Nick</TableCell>
            <TableCell>
              <div className="inline-flex gap-5 items-center">
                Zaznacz Tagi:
                  <div className="inline-flex gap-2 overflow-scroll">
                  {
                    allTags.map((tag, i) => {
                      // check if all contacts with this tag are selected
                      const tagSelected = selectedTagCountMap[tag] == tagCountMap[tag];

                      return (
                        // if some are selected, show the count
                      <Chip label={selectedTagCountMap[tag] ? `${tag}: ${selectedTagCountMap[tag]}` : tag} key={i}
                       variant={tagSelected ? "filled" : "outlined"}
                       onClick={()=>{
                          contacts.filter(c=>c.tags.includes(tag)).forEach(c => {
                            toggleContactSelection({id: c.id, selected: !tagSelected})
                          })
                        }} 
                      />)
                    })
                  }
                </div>
              </div>
            </TableCell>
            <TableCell align="right">
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked}
                  onChange={(event) => {
                    contacts.forEach(c=>{
                      toggleContactSelection({id: c.id, selected: event.target.checked})
                    })
                  }
                  }
                />
              }
              label="Zaznacz wszystkie kontaky"
            />
            </TableCell>
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
  selected: boolean,
  _count: {
      Email: number
  }
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
      <div className="inline-flex gap-2">
      {
        contact.tags.map((tag, i) => (
          <Chip variant="outlined" label={tag} key={i} />
        ))
      }
      </div>
    </TableCell>
    <TableCell component="th" align="right" scope="row">

      <Checkbox checked={contact.selected} onChange={(e)=>{
        toggleContactSelection({id: contact.id, selected: e.target.checked});
      }} />
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
