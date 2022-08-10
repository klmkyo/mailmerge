// page in which you create emailTemplates

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { DialogTitle } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Contact } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import { useSnackbar } from 'notistack';
import { FC, useEffect, useMemo, useState } from "react";
import create from 'zustand';
import { Loading } from "../../components/Loading";
import { extractEmails } from "../../utils/emails";
import { onlyUnique } from "../../utils/onlyUnique";
import { inferQueryOutput, trpc } from "../../utils/trpc";

// get alltags initially by using current method, then use global state bear to mangae them from children

function compare( a: string, b: string ) {
  if ( a < b ){ return -1; }
  if ( a > b ){ return 1;  }
  return 0;
}

interface AllTagsState {
  allTags: string[],
  addTag: (tag: string) => void,
}

const useAllTags = create<AllTagsState>((set) => ({
  allTags: [],
  addTag: (tag: string) => set((state) => ({allTags: [...state.allTags, tag].filter(onlyUnique)}))
}))


const CreateContactPage: NextPage = () => {

  const [newEmails, setNewEmails] = useState("");
  const utils = trpc.useContext();

  const [hiddenDialogOpen, setHiddenDialogOpen] = useState(false);

  const { data: contactsUnfiltered, isLoading, error } = trpc.useQuery(['contact.getAllAndHidden']);

  const contacts = useMemo(() =>
  contactsUnfiltered?.filter(c => !c.hidden) ?? [], [contactsUnfiltered]);

  const hiddenContacts = useMemo(() =>
  contactsUnfiltered?.filter(c => c.hidden) ?? [], [contactsUnfiltered]);

  const { mutate: createContacts } = trpc.useMutation(['contact.create-many'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: () => {
      utils.invalidateQueries('contact.getAllAndHidden');
      setNewEmails("");
    }
  })

  const newEmailArr = useMemo(()=>extractEmails(newEmails) ?? [], [newEmails])

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <>
      <Head>
        <title>Create Contact</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center p-4 mt-20">

        {/* ilość kontaktów */}
        <div className="flex flex-col items-center justify-center mb-20">
          <h1 className="text-xl">Ilość kontaktów: <b>{contacts?.length}</b></h1>
        </div>

        {contacts?.length !== 0 && (
          <>
          {/* TODO virtualize this dude */}
            <ContactTable contacts={contacts} />
            <div className="w-full">
            <Button
              startIcon={<VisibilityOffIcon />}
              variant="outlined"
              style={{float: "right", margin: "1rem 0 0 0"}}
              onClick={()=>setHiddenDialogOpen(true)}>
              Pokaż ukryte kontakty
            </Button>
            </div>
          </>
        )}

        <div className="mt-6 gap-2 flex flex-col items-right">
        <TextField
          multiline
          value={newEmails}
          onChange={(e)=>{setNewEmails(e.target.value)}}
          label="Email (można podać kilka)"
          variant="outlined"
          size="small"
          style={{width: "30em"}}
            />
          <Button disabled={newEmailArr.length < 1} variant="outlined" startIcon={<AddIcon />} onClick={()=>{
            createContacts( newEmailArr.map( (email) => ({email}) ) )
          }}>
            {newEmailArr.length < 2 ? "Dodaj Maila" : `Dodaj ${newEmailArr.length} Maili`}
          </Button>
        </div>

      </main>

      <HiddenDialog hiddenContacts={hiddenContacts} open={hiddenDialogOpen} setOpen={setHiddenDialogOpen} />
    </>
  );
};

const HiddenDialog: FC<{
  open: boolean,
  setOpen: (open: boolean) => void,
  hiddenContacts: inferQueryOutput<"contact.getAllAndHidden">
}> = ({open, setOpen, hiddenContacts}) => {

  return (
    <>
      <Dialog open={open} onClose={()=>{setOpen(false)}} maxWidth="xl">
        <DialogTitle>
          Ukryte kontakty
          <Typography color="text.secondary" className="italic text-sm">{"(kontakty które nie mogły być usunięte, bo został do nich wysłany email)"}</Typography>
        </DialogTitle>
        <DialogContent className="mt-1">
          <ContactTable contacts={hiddenContacts} />
        </DialogContent>
      </Dialog>
    </>
  )
}

const ContactTable: FC<{
  contacts: inferQueryOutput<"contact.getAllAndHidden">
}> = ({contacts}) => {

  const {allTags, addTag} = useAllTags()

  useEffect(()=>{
    contacts?.map((c)=>c.tags).flat().filter(onlyUnique).forEach((tag)=>addTag(tag))
  }, [contacts, addTag])

  const contactArray = useMemo(() => contacts?.sort((a,b) => compare(a.email, b.email)).map((contact) => (
    <ContactRow key={contact.id} contact={contact} />
  )), [contacts]);

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

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Wysłane Maile</TableCell>
            <TableCell>Nick</TableCell>
            <TableCell>
            <div className="inline-flex gap-4 items-center" style={{width: "min(40em, 50vw)"}}>
              Tagi:
              <div className="inline-flex gap-1.5 overflow-scroll">
              {
                allTags.map((tag, i) => {
                  return (
                    // if some are selected, show the count
                  <Chip label={`${tag}: ${tagCountMap[tag] ?? 0}`} key={i}
                    variant="outlined"
                    size="small"
                  />)
                })
              }
              </div>
            </div>
            </TableCell>
            <TableCell align="right">Akcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contactArray}
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

  const {allTags, addTag} = useAllTags()

  const utils = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();

  const [tags, setTags] = useState<string[]>(contact.tags);
  const [nickName, setNickName] = useState(contact.nickName);

  // nightmare nightmare nightmare
  const { mutate: deleteContact } = trpc.useMutation(['contact.delete'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden'])

      utils.setQueryData(['contact.getAllAndHidden'], old => old!.filter(x=>x.id!=data.id))

      return { previousContacts }
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!)
      enqueueSnackbar(err.message, { variant: 'error' });
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  })

  const { mutate: updateContact } = trpc.useMutation(['contact.update'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden']);

      utils.setQueryData(['contact.getAllAndHidden'], (oldContacts) => {

        const contactIndex = oldContacts!.findIndex(x=>x.id==data.id)!;

        console.log(`Updated Contact ${contactIndex}`)
        let newContacts = oldContacts!;
        newContacts![contactIndex!]! = {
          ...newContacts![contactIndex!]!,
          ...data
        };

        return newContacts!;
      })

      return {previousContacts}
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!)
      enqueueSnackbar(err.message, { variant: 'error' });
    },
    onSuccess: (data) => {
      enqueueSnackbar(`Zaktualizowano ${contact.email}!`);
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  })

  const deleteOrHide = () => {
    // if an email has been sent to this contact, hide it
    if (contact._count.Email > 0) {
      updateContact({
        id: contact.id,
        hidden: true
      })
    }
    else {
      deleteContact({ id: contact.id })
    }
  }

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
        size="small"
        onBlur={()=>{
          if(contact.nickName != nickName){
            updateContact({
              id: contact.id,
              nickName
            })
          }
        }}
        style={{width: "20rem"}}
      />
    </TableCell>
    <TableCell component="th" scope="row">
      <Autocomplete
        multiple
        id="tags-filled"
        options={allTags}
        freeSolo
        value={tags}
        onChange={(event: any, newTags: string[]) => {
          setTags(newTags);

          if(JSON.stringify(newTags) != JSON.stringify(contact.tags)){
            updateContact({
              id: contact.id,
              tags: newTags
            })
            // add new tags to allTags
            newTags.filter(x => !allTags.includes(x)).forEach((tag)=>addTag(tag))
          }
        }}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} size="small" />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tagi"
            size="small"
            style={{width: "min(30em, 50vw)"}}
          />
        )}
      />
    </TableCell>
    {/* edit button */}
    <TableCell component="th" align="right" scope="row">
      {
        contact.hidden ?
        <Tooltip placement="left" title="Przywróć kontakt">
          <IconButton
            aria-label="show"
            onClick={()=>{
              updateContact({
                id: contact.id,
                hidden: false
              })
            }}
          >
            <RestoreIcon />
          </IconButton>
        </Tooltip>
          :
        <Tooltip placement="left" title={ contact._count.Email > 0 ? "Schowaj kontakt" : "Usuń kontakt"}>
          <IconButton
            aria-label="delete"
            onClick={deleteOrHide}
          >
          { contact._count.Email > 0 ? <VisibilityOffIcon /> : <DeleteIcon />}
          </IconButton>
        </Tooltip>
      }

    </TableCell>
  </TableRow>
  )
}

export default CreateContactPage;
