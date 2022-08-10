import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, Grid, Paper, Stack } from "@mui/material";
import { EmailTemplate } from "@prisma/client";
import { sanitize } from "dompurify";
import parse from 'html-react-parser';
import { useRouter } from 'next/router';
import { FC, useState } from "react";
import { trpc } from "../../utils/trpc";
import { Loading } from "../Loading";

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
    return <Loading />;
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
            <Button variant="outlined" disabled={selectedIds.length === 0} onClick={()=>setConfirmDialogOpen(true)} startIcon={<DeleteIcon />}>
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
  const router = useRouter();

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
    <Paper elevation={3} square className="flex flex-col items-stretch m-2 p-4 relative" style={{ width: "min(50em, 100%)", height: "40em" }}>

      <header className="flex justify-between pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{emailTemplate.subject}</div>
        </div>
        <div className="flex flex-col items-end">
          <Checkbox name={emailTemplate.id} sx={{ margin: "-0.5em -0.5em 0" }} onChange={handleSelect} checked={checked} />
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
        <div className="flex gap-2">
          <Button startIcon={<EditIcon />} onClick={()=>{router.push(`/emailTemplate/edit/${emailTemplate.id}`)}} >Edytuj</Button>
          <Button startIcon={<DeleteIcon />} onClick={onDelete}>Usuń</Button>
        </div>
      </footer>
      <div className="absolute bottom-0.5 right-1 text-xs text-gray-300 italic">ID: {emailTemplate.id}</div>
    </Paper>
  )
};

export default EmailTemplateList;
