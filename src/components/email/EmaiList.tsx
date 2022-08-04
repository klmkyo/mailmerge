import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { FC, useState } from "react";
import { Email, Contact } from "@prisma/client";
import { Box, Button, ButtonGroup, Grid, Checkbox, FormControlLabel, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Letter } from 'react-letter';
import { sanitize } from "dompurify";
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-mateial/Add';
import { isDev } from "../../utils/isDev";

const EmailList: FC = () => {

  const utils = trpc.useContext();
  const { data: emails, isLoading, error } = trpc.useQuery(['email.getAll']);
  const { mutate: deleteMany } = trpc.useMutation(["email.delete-many"], {
    onSuccess(){
      utils.invalidateQueries('email.getAll')
    }
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (isLoading) {
    return <p>Loading emails...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedIds([...selectedIds, name]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== name));
    }
  }

  const deleteSelected = () => {
    deleteMany({ids: selectedIds})
  }

  return (
    <>
      <Box sx={{ width: "100%", display: "flex", position: "relative", justifyContent: "space-between", marginBottom: "3em" }}>
        {/* select all */}
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedIds.length === (emails?.length ?? 0)}
              onChange={(event) => {
                if (event.target.checked) {
                  if (emails) {
                    setSelectedIds(emails.map(email => email.id));
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

        <Box sx={{display: "block", position: "absolute", left: "50%", transform: "translateX(-50%)"}}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<ScheduleSendIcon />}>
              Zaplanuj wysłania
            </Button>
            <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<DeleteIcon />} onClick={()=>setConfirmDialogOpen(true)}>
              Usuń zaznaczone
            </Button>
          </Stack>
        </Box>

        {/* grid/list view switcher */}
        <ButtonGroup sx={{ float: "right" }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ViewModuleIcon />}
            onClick={() => { }}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ViewListIcon />}
            onClick={() => { }}
          />
        </ButtonGroup>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
          {emails?.map((email) => {
            return (
              <Email key={email.id} email={email} handleSelect={handleSelect} checked={selectedIds.includes(email.id)} />
            )
          })}
        </Grid>
      </Box>

      <Dialog
        open={confirmDialogOpen}
        onClose={()=>setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Potwierdzenie usunięcia"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Czy na pewno chcesz usunąć {selectedIds.length} maili?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setConfirmDialogOpen(false)}>Nie</Button>
          <Button 
          startIcon={<DeleteIcon />}
          onClick={()=>{
            setConfirmDialogOpen(false);
            deleteSelected();
          }} autoFocus>
            Tak
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Email = ({ email, handleSelect, checked }: {
  email: Email & {
    contact: Contact;
  },
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>) => void,
  checked: boolean
}) => {

  const utils = trpc.useContext();

  const { mutate, error } = trpc.useMutation(['email.delete'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('email.getAll')
    }
  })

  const onDelete = () => {
    console.log(email)
    mutate({ id: email.id })
  }


  const toBeSentToday = new Date().toDateString() === email.toBeSentAt?.toDateString();
  const dateString = `Będzie wysłane ${email.toBeSentAt?.toLocaleTimeString()}${(toBeSentToday ? '' : ` ${email.toBeSentAt?.toLocaleDateString()}`)}`;

  return (
    <div className="flex flex-col items-stretch m-2 p-4 border relative" style={{ width: "50em", height: "40em" }}>

      <header className="flex justify-between border-b pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{email.subject}</div>
          <div><i>Do: {email.contact.email}</i></div>
        </div>
        <div className="flex flex-col items-end">
          <Checkbox name={email.id} sx={{ margin: "-0.5em -0.5em 0" }} onChange={handleSelect} checked={checked} />
          <div>{email.tags?.join(", ")}</div>
        </div>
      </header>

      <div className="flex-1 mt-3">
        <Letter html={sanitize(email.body)} />
      </div>

      <footer className="flex justify-between items-center border-t pt-2">
        <div>
          <Button startIcon={<ScheduleSendIcon />} >
            {email.toBeSentAt ? "Edytuj wysłanie" : "Zaplanuj wysłanie"}
          </Button>
          {email.toBeSentAt && dateString}
        </div>
        <Button startIcon={<DeleteIcon />} onClick={onDelete}>Usuń</Button>
      </footer>
      {isDev && <div className="absolute bottom-0.5 right-1 text-xs text-gray-400 italic">ID: {email.id}</div>}
    </div>
  )
};

export default EmailList;
