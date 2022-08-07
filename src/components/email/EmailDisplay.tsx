import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Box, Paper, Divider, Button, ButtonGroup, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, MenuItem, Select, Stack, TextField } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Contact, Email } from "@prisma/client";
import { sanitize } from "dompurify";
import { FC, useState } from "react";
import { Letter } from 'react-letter';
import { isDev } from "../../utils/isDev";
import { trpc } from "../../utils/trpc";
import { Loading } from "../Loading";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import moment from 'moment';
import 'moment/locale/pl'


const timeIntervals = [
  {
    value: 1,
    label: 'sekund',
  },
  {
    value: 60,
    label: 'minut',
  },
  {
    value: 3600,
    label: 'godzin',
  },
];


const EmailDisplay: FC = () => {

  const utils = trpc.useContext();

  const { mutate: deleteMany } = trpc.useMutation(["email.delete-many"], {
    onSuccess() {
      utils.invalidateQueries('email.getAll')
    }
  });
  const { mutate: updateToBeSentAt } = trpc.useMutation(['email.update-toBeSentAt'], {
    onSuccess: (data) => {
      utils.invalidateQueries('email.getAll')
    }
  })

  const [gridView, setGridView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"sent" | "unsent">("unsent");

  const { data: emailsUnfiltered, isLoading, error } = trpc.useQuery(['email.getAll']);
  // filter emails
  const emails = emailsUnfiltered?.filter(email => {
    if (filter === 'sent') {
      return email.sentAt;
    }
    return email.sentAt === null;
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sendMultipleDialogOpen, setSendMultipleDialogOpen] = useState(false);

  const [sendMultipleStart, setSendMultipleStart] = useState(new Date());
  const [sendMultipleIntervalUnit, setSendMultipleIntervalUnit] = useState(60);
  const [sendMultipleInterval, setSendMultipleInterval] = useState<number | null>(null);

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
    deleteMany({ ids: selectedIds })
  }

  return (
    <>
      <Box sx={{ width: "100%", display: "flex", position: "relative", justifyContent: "space-between", marginBottom: "3em" }}>
        {/* select all */}
        <div className="flex gap-6">
          {/* sent/unsent filter */}
          <ToggleButtonGroup exclusive value={filter} onChange={(e,v) => setFilter(v ?? filter)}>
            <ToggleButton value="unsent">Nie wysłane</ToggleButton>
            <ToggleButton value="sent">Wysłane</ToggleButton>
          </ToggleButtonGroup>
          {filter === "unsent" &&
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
          }
        </div>
        
        {filter === 'unsent' &&
          <Box sx={{ display: "block", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<ScheduleSendIcon />} onClick={() => setSendMultipleDialogOpen(true)}>
                Zaplanuj wysłania
              </Button>
              <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<DeleteIcon />} onClick={() => setConfirmDialogOpen(true)}>
                Usuń zaznaczone
              </Button>
            </Stack>
          </Box>
        }

        <div>
          {/* grid/list view switcher */}
          <ToggleButtonGroup
            value={gridView}
            exclusive
            onChange={ (e, v)=>setGridView(v ?? gridView)}
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>

            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>

          </ToggleButtonGroup>
        </div>
      </Box>

      <Box sx={{ width: "100%" }}>

        {
          gridView === "grid" ?
          // Table
          (
            <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
              {emails?.map((email) => {
                return (
                  <EmailCard key={email.id} email={email} handleSelect={handleSelect} checked={selectedIds.includes(email.id)} />
                )
              })}
            </Grid>
          )
              :
          // List
          (
            <p>List</p>
          )
        }

      </Box>

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
            Czy na pewno chcesz usunąć {selectedIds.length} maili?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Nie</Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => {
              setConfirmDialogOpen(false);
              deleteSelected();
            }} autoFocus>
            Tak
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={sendMultipleDialogOpen}
        onClose={() => setSendMultipleDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="alert-dialog-title">
          {"Zaplanuj wysłanie maili"}
        </DialogTitle>
        <DialogContent>

          <DialogContentText id="alert-dialog-description">
            Od kiedy mają być wysyłane maile?
          </DialogContentText>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              value={sendMultipleStart}
              onChange={(newDate) => {
                setSendMultipleStart(newDate!)
              }}
            />
          </LocalizationProvider>

          <DialogContentText id="alert-dialog-description" style={{ marginTop: "1.5em" }}>
            W jakim odstępie? <span className="text-sm italic text-gray-500">{`(zostaw puste aby wysłać maile natychmiastowo)`}</span>
          </DialogContentText>
          <div className="mt-1">
            <TextField
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={sendMultipleInterval}
              placeholder="natychmiast"
              onChange={(e)=>{
                const n = e.target.value
                if( /^\d+$/.test(n) ){
                  try{
                    setSendMultipleInterval( parseInt(n, 10) )
                  }
                  catch {
                    console.error("nan")
                  }
                } else if (!n) {
                  setSendMultipleInterval(null)
                }
              }}
            />
            <Select
              value={sendMultipleIntervalUnit}
              onChange={ (e) => setSendMultipleIntervalUnit( parseInt( (e.target.value as string), 10) ) }
            >
              {
                timeIntervals.map((itv) => <MenuItem key={itv.value} value={itv.value}>{itv.label}</MenuItem>)
              }
            </Select>
          </div>

          <DialogContentText id="alert-dialog-description" style={{ marginTop: "1.5em", marginBottom: "0.5em" }}>
            Podgląd harmonogramu:
          </DialogContentText>
          <EmailTimesPreview emails={emails!} interval={sendMultipleInterval! * sendMultipleIntervalUnit} start={sendMultipleStart}/>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendMultipleDialogOpen(false)}>Odrzuć</Button>
          <Button
            startIcon={<ScheduleSendIcon />}
            onClick={() => {
              setSendMultipleDialogOpen(false);
              const start = sendMultipleStart;
              const interval = (sendMultipleInterval ?? 0) * sendMultipleIntervalUnit;
              emails!.map((email, i) => {
                const toBeSentAt = new Date(start.getTime() + ( (interval ?? 0)  * 1000 * i))
                updateToBeSentAt({
                  id: email.id,
                  toBeSentAt
                })
              })
            }}
            autoFocus
            >
            Wysyłaj
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const EmailTimesPreview = ({emails, interval, start}:
  {
    emails: (Email & { contact: Contact; })[],
    interval: number | null,
    start: Date
  }) => {


  return(
    <TableContainer component={Paper}>
      <Table aria-label="czasy wysłania">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell align="right">Tytuł</TableCell>
            <TableCell align="right">Data wysłania</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {emails.map((email, i) => (
            <TableRow
              key={email.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{email.contact.email}</TableCell>
              <TableCell align="right">{email.subject}</TableCell>
              <TableCell align="right">{new Date(start.getTime() + ( (interval ?? 0)  * 1000 * i)).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const EmailCard = ({ email, handleSelect, checked }: {
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

  const { mutate: updateToBeSentAt } = trpc.useMutation(['email.update-toBeSentAt'], {
    onSuccess: (data) => {
      utils.invalidateQueries('email.getAll')
    }
  })

  const onDelete = () => {
    console.log(email)
    mutate({ id: email.id })
  }

  const wasSent = !!email.sentAt;

  return (
    <Paper elevation={3} square className="flex flex-col items-stretch m-2 p-4 relative" style={{ width: "50em", height: "40em" }}>

      <header className="flex justify-between pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{email.subject}</div>
          <div><i>Do: {email.contact.email}</i></div>
        </div>
        <div className="flex flex-col items-end">
          {!wasSent && <Checkbox name={email.id} sx={{ margin: "-0.5em -0.5em 0" }} onChange={handleSelect} checked={checked} />}
          <div>{email.tags?.join(", ")}</div>
        </div>
      </header>
      <Divider />

      <div className="flex-1 mt-3">
        <Letter html={sanitize(email.body)} />
      </div>

      <Divider />
      <footer className="flex justify-between items-center pt-3.5">
        <div>
          {wasSent ? 
            <div>
              {`Wysłano: ${email.sentAt!.toLocaleString()}`}
              <span className="text-gray-600 italic ml-2">
                {`(${moment(email.sentAt!).locale("pl").fromNow()})`}
              </span>
            </div>
            :
            <div className="flex gap-3 items-center">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  renderInput={(props) => <TextField {...props} />}
                  label={email.toBeSentAt ? "Edytuj datę wysłania" : "Zaplanuj wysłanie"}
                  value={email.toBeSentAt}
                  onChange={(newDate) => {
                    updateToBeSentAt({
                      id: email.id,
                      toBeSentAt: newDate!
                    });
                  }}
                />
              </LocalizationProvider>
              <span className="text-gray-600 italic">
                {email.toBeSentAt && moment(email.toBeSentAt).locale("pl").fromNow()}
              </span>
            </div>
          }
        </div>
        {!wasSent && <Button startIcon={<DeleteIcon />} onClick={onDelete}>Usuń</Button>}
      </footer>
      {isDev && <div className="absolute bottom-0.5 right-1 text-xs text-gray-400 italic">ID: {email.id}</div>}
    </Paper>
  )
};

export default EmailDisplay;
