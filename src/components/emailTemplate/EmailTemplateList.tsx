import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { FC, useState } from "react";
import { EmailTemplate } from "@prisma/client";
import { Box, Button, ButtonGroup, Grid, Checkbox, FormControlLabel, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Letter } from 'react-letter';
import { sanitize } from "dompurify";
import { isDev } from "../../utils/isDev";

const EmailTemplateList: FC = () => {

  const utils = trpc.useContext();
  const { data: emailTemplates, isLoading, error } = trpc.useQuery(['emailTemplate.getAll']);
  const { mutate: deleteMany } = trpc.useMutation(["emailTemplate.delete-many"], {
    onSuccess(){
      utils.invalidateQueries('emailTemplate.getAll')
    }
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (isLoading) {
    return <p>Loading email templates...</p>;
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
              checked={selectedIds.length === (emailTemplates?.length ?? 0)}
              onChange={(event) => {
                if (event.target.checked) {
                  if (emailTemplates) {
                    setSelectedIds(emailTemplates.map(emailTemplate => emailTemplate.id));
                  }
                } else {
                  setSelectedIds([]);
                }
              }
              }
            />
          }
          label="Zaznacz wszystkie szablony"
        />

        <Box sx={{display: "block", position: "absolute", left: "50%", transform: "translateX(-50%)"}}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" disabled={selectedIds.length === 0} onClick={()=>setConfirmDialogOpen(true)}>
              Usuń zaznaczone szablony
            </Button>
          </Stack>
        </Box>


      </Box>
      <Box sx={{ width: "100%" }}>
        <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
      {emailTemplates?.map((emailTemplate) => {
        return (
          <EmailTemplate key={emailTemplate.id} emailTemplate={emailTemplate} handleSelect={handleSelect} checked={selectedIds.includes(emailTemplate.id)} />
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
            Czy na pewno chcesz usunąć {selectedIds.length} szablonów?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setConfirmDialogOpen(false)}>Nie</Button>
          <Button onClick={()=>{
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

const EmailTemplate = ({ emailTemplate, handleSelect, checked }: {
  emailTemplate: EmailTemplate
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>) => void,
  checked: boolean
}) => {

  const utils = trpc.useContext();

  const { mutate, error } = trpc.useMutation(['emailTemplate.delete'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('emailTemplate.getAll')
    }
  })

  const onDelete = () => {
    console.log(emailTemplate)
    mutate({ id: emailTemplate.id })
  }

  return (
    <div className="flex flex-col items-stretch m-2 p-4 border relative" style={{ width: "50em", height: "40em" }}>

      <header className="flex justify-between border-b pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{emailTemplate.subject}</div>
        </div>
        <div className="flex flex-col items-end">
          <Checkbox name={emailTemplate.id} sx={{ margin: "-0.5em -0.5em 0" }} onChange={handleSelect} checked={checked} />
          <div>{emailTemplate.tags?.join(", ")}</div>
        </div>
      </header>

      <div className="flex-1 mt-3">
        <Letter html={sanitize(emailTemplate.body)} />
      </div>

      <footer className="flex justify-between border-t pt-2">
        <div />
        <Button onClick={onDelete}>Delete</Button>
      </footer>
      {isDev && <div className="absolute bottom-0.5 right-1 text-xs text-gray-400 italic">ID: {emailTemplate.id}</div>}
    </div>
  )
};

export default EmailTemplateList;
