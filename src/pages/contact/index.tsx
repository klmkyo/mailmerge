// page in which you create emailTemplates

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { DialogTitle, DialogContentText, DialogActions } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import TagIcon from '@mui/icons-material/Tag';
import Checkbox from '@mui/material/Checkbox';
import { NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import create from 'zustand';
import { Loading } from "../../components/Loading";
import { extractEmails } from "../../utils/emails";
import { onlyUnique } from "../../utils/onlyUnique";
import { trpc } from "../../utils/trpc";
import Add from '@mui/icons-material/Add';
import { HiddenDialog } from '../../components/contact/HiddenDialog';
import { ContactTable } from '../../components/contact/ContactTable';

// get alltags initially by using current method, then use global state bear to mangae them from children

// TODO convert all selectedIds to sets, possibly using zustand, since setState wont work

export function compare( a: string, b: string ) {
  if ( a < b ){ return -1; }
  if ( a > b ){ return 1;  }
  return 0;
}

interface AllTagsState {
  allTags: string[],
  addTag: (tag: string) => void,
}

export const useAllTags = create<AllTagsState>((set) => ({
  allTags: [],
  addTag: (tag: string) => set((state) => ({allTags: [...state.allTags, tag].filter(onlyUnique)}))
}))


const CreateContactPage: NextPage = () => {

  const [newEmails, setNewEmails] = useState("");
  const utils = trpc.useContext();

  const [hiddenDialogOpen, setHiddenDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);

  const { data: contactsUnfiltered, isLoading, error } = trpc.useQuery(['contact.getAllAndHidden']);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // tags for the add multiple tags dialog
  const [tags, setTags] = useState<string[]>([]);
  const {allTags, addTag} = useAllTags()

  const contacts = useMemo(() =>
  contactsUnfiltered?.filter(c => !c.hidden) ?? [], [contactsUnfiltered]);

  const hiddenContacts = useMemo(() =>
  contactsUnfiltered?.filter(c => c.hidden) ?? [], [contactsUnfiltered]);

  const selectedContacts = useMemo(() =>
  contacts.filter(c => selectedIds.includes(c.id)), [contacts, selectedIds]);

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

  const { mutate: deleteManyContacts } = trpc.useMutation(['contact.delete-many'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden'])

      utils.setQueryData(['contact.getAllAndHidden'], old => old!.filter( x => !data.ids.includes(x.id) ))

      return { previousContacts }
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!)
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  })

  const { mutate: hideManyContacts } = trpc.useMutation(['contact.hide-many'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden'])

      const selectedContactIds = data.ids;

      utils.setQueryData(['contact.getAllAndHidden'], old => old!.map( c => {
        c.hidden = selectedContactIds.includes(c.id) ? true : c.hidden;
        return c
      }))

      return { previousContacts }
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!)
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  })

  const { mutate: addTagsMany } = trpc.useMutation(['contact.add-tags-to-many'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden'])

      const selectedContactIds = data.ids;
      const tags = data.tags;
      utils.setQueryData(['contact.getAllAndHidden'], old => old!.map( c => {
        if (selectedContactIds.includes(c.id)) {
          c.tags = [...c.tags, ...tags].filter(onlyUnique);
        }
        return c
      }))

      return { previousContacts }
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!)
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  })

  const deleteOrHideSelected = () => {
    // group contacts by those which should be hidden or deleted, based on if emails were sent to it
    const toBeHidden = selectedContacts.filter(c => c._count.Email > 0);
    const toBeDeleted = selectedContacts.filter(c => c._count.Email === 0);

    if(toBeHidden.length > 0) {
      // we only care about ids and the hidden field
      hideManyContacts({
        ids: toBeHidden.map(c=> c.id)
      })
    }

    if(toBeDeleted.length > 0) {
      deleteManyContacts({
        ids: toBeDeleted.map(c => c.id)
      })
    }
    // reset selected ids
    setSelectedIds([]);
  }

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
        <div className="flex flex-col items-center justify-center mb-6">
          <h1 className="text-xl">Ilość kontaktów: <b>{contacts?.length}</b></h1>
        </div>

        <div className="relative w-full flex items-center justify-between mb-4">
          {/* Zaznacz wszystkie */}
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedIds.length === (contacts?.length ?? 0)}
                onChange={(event) => {
                  if (event.target.checked) {
                    if (contacts) {
                      setSelectedIds(contacts.map(contact => contact.id));
                    }
                  } else {
                    setSelectedIds([]);
                  }
                }
                }
              />
            }
            label="Zaznacz wszystkie maile"
          />
          {/* Kontrole zaznaczenia */}
          <Box sx={{ display: "block", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<TagIcon />} onClick={()=>setTagsDialogOpen(true)}>
                Dodaj Tagi
              </Button>
              <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<DeleteIcon />} onClick={()=>setConfirmDialogOpen(true)}>
                Usuń/Schowaj Zaznaczone
              </Button>
            </Stack>
          </Box>
        </div>

        {contacts?.length !== 0 && (
          <>
          {/* TODO virtualize this dude */}
            <ContactTable contacts={contacts} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
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

      {/* hidden contacts dialog */}
      {/* the prop drill goes brrrr */}
      <HiddenDialog hiddenContacts={hiddenContacts} open={hiddenDialogOpen}
        setOpen={setHiddenDialogOpen} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />

      {/* delete dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Potwierdzenie usunięcia"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Czy na pewno chcesz usunąć/schować {selectedIds.length} maili?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Nie</Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => {
              setConfirmDialogOpen(false);
              deleteOrHideSelected();
            }} autoFocus>
            Tak
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Tags dialog */}
      <Dialog
        open={tagsDialogOpen}
        onClose={() => setTagsDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Dodaj tagi do zaznaczonych kontaków"}
        </DialogTitle>
        <DialogContent>

        <Autocomplete
        multiple
        id="tags-filled"
        options={allTags}
        freeSolo
        value={tags}
        onChange={(event: any, newTags: string[]) => {
          setTags(newTags);

          if(JSON.stringify(newTags) != JSON.stringify(tags)){
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
            style={{width: "min(30em, 50vw)", marginTop: ".4rem"}}
          />
        )}
      />


        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagsDialogOpen(false)}>Anuluj</Button>
          <Button
            startIcon={<Add />}
            disabled={tags.length===0}
            onClick={() => {
              console.log({tags});
              console.log(selectedContacts.map(c=>c.id));

              addTagsMany({
                ids: selectedContacts.map(c=>c.id),
                tags
              })

              setTags([]);
              setTagsDialogOpen(false);
            }} autoFocus>
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateContactPage;
