import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, Grid, MenuItem, Paper, Select, Stack, TextField } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Contact, Email } from "@prisma/client";
import { sanitize } from "dompurify";
import moment from 'moment';
import 'moment/locale/pl';
import { useSnackbar } from 'notistack';
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Letter } from 'react-letter';
import { EmailCard as EmailDialogCard } from "../../pages/emailVisit/index";
import { extractText } from '../../utils/emails';
import { inferQueryOutput, trpc } from "../../utils/trpc";
import { Loading } from "../Loading";


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

type EmailObj = inferQueryOutput<"email.getAll">[number]

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

  const [gridView, setGridViewSTATEONLY] = useState<"grid" | "list">("grid");
  const setGridView = useCallback((view: "grid" | "list") => {setGridViewSTATEONLY(view); localStorage.setItem('viewPref', view);}, [setGridViewSTATEONLY]);

  useEffect(() => {
    const viewPref = localStorage.getItem('viewPref') as "grid" | "list";
    if (viewPref && (viewPref !== gridView)) {
      setGridView(viewPref);
    }
  }, [gridView, setGridView]);

  const [filter, setFilter] = useState<"sent" | "unsent">("unsent");
  const sentView = filter === "sent";

  const { data: emailsUnfiltered, isLoading, error } = trpc.useQuery(['email.getAll']);
  // filter emails
  let emails = emailsUnfiltered?.filter(email => {
    if (filter === 'sent') {
      return email.sentAt;
    }
    return email.sentAt === null;
  });

  // sort emails by sentAt or toBeSentAt
  if (emails) {
    if (sentView) {
      emails = emails.sort((a, b) => {
        return (b?.sentAt?.getTime() ?? 0) - (a?.sentAt?.getTime() ?? 0);
      })
    } else {
      emails = emails.sort((a, b) => {
        return (a?.toBeSentAt?.getTime() ?? 0) - (b?.toBeSentAt?.getTime() ?? 0);
      })
    }
  }

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sendMultipleDialogOpen, setSendMultipleDialogOpen] = useState(false);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<EmailObj | null>(null);

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

  const selectedEmails = emails?.filter(email => selectedIds.includes(email.id));

  console.log({selectedEmails, selectedIds})

  const deleteSelected = () => {
    deleteMany({ ids: selectedIds })
  }

  return (
    <>
      <Box sx={{ width: "100%", display: "flex", position: "relative", justifyContent: "space-between", marginBottom: "3em" }}>
        {/* select all */}
        <div className="flex gap-6">
          {/* sent/unsent filter */}
          <ToggleButtonGroup exclusive value={filter} onChange={(e, v) => setFilter(v ?? filter)}>
            <ToggleButton value="unsent" className="inline-flex items-center gap-2">
              <ScheduleSendIcon />
              Nie wysłane
            </ToggleButton>
            <ToggleButton value="sent" className="inline-flex items-center gap-2">
              <MarkEmailReadIcon />
              Wysłane
            </ToggleButton>
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
              <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<ScheduleSendIcon />} onClick={() => {
                setSendMultipleDialogOpen(true);
                setSendMultipleStart(new Date());
              }}>
                Zaplanuj Wysłania
              </Button>
              <Button variant="outlined" disabled={selectedIds.length === 0} startIcon={<DeleteIcon />} onClick={() => setConfirmDialogOpen(true)}>
                Usuń Zaznaczone
              </Button>
            </Stack>
          </Box>
        }

        <div>
          {/* grid/list view switcher */}
          <ToggleButtonGroup
            value={gridView}
            exclusive
            onChange={(e, v) => setGridView(v ?? gridView)}
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

      <Box sx={{ width: "100%", paddingBottom: "5rem" }}>

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
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      {/* nickname w `email ${nickName}` */}
                      <TableCell>Email</TableCell>
                      <TableCell>Tytuł</TableCell>
                      <TableCell>Treść</TableCell>
                      <TableCell align="right">ID </TableCell>
                      <TableCell align="right">{sentView ? "Data wysłania" : "Do wysłania o"}</TableCell>
                      <TableCell align="right">Akcje</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      emails?.map((email) => <EmailRow key={email.id} email={email}
                        handleSelect={handleSelect} checked={selectedIds.includes(email.id)}
                        setCurrentEmail={setCurrentEmail} setEmailDialogOpen={setEmailDialogOpen} />)
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            )
        }

      </Box>

      {/* Email Dialog */}
      <Dialog maxWidth="xl" onClose={() => setEmailDialogOpen(false)} open={emailDialogOpen}>
        <EmailDialogCard email={currentEmail!} onClose={() => setEmailDialogOpen(false)} />
      </Dialog>

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
        maxWidth="md"
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
              onChange={(e) => {
                const n = e.target.value
                if (/^\d+$/.test(n)) {
                  try {
                    setSendMultipleInterval(parseInt(n, 10))
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
              onChange={(e) => setSendMultipleIntervalUnit(parseInt((e.target.value as string), 10))}
            >
              {
                timeIntervals.map((itv) => <MenuItem key={itv.value} value={itv.value}>{itv.label}</MenuItem>)
              }
            </Select>
          </div>

          <DialogContentText id="alert-dialog-description" style={{ marginTop: "1.5em", marginBottom: "0.5em" }}>
            Podgląd harmonogramu:
          </DialogContentText>
          <EmailTimesPreview emails={selectedEmails!} interval={sendMultipleInterval! * sendMultipleIntervalUnit} start={sendMultipleStart} />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendMultipleDialogOpen(false)}>Odrzuć</Button>
          <Button
            startIcon={<ScheduleSendIcon />}
            onClick={() => {
              // Planowanie wysłania
              setSendMultipleDialogOpen(false);
              const start = sendMultipleStart;
              const interval = (sendMultipleInterval ?? 0) * sendMultipleIntervalUnit;

              selectedEmails!.map((email, i) => {
                const toBeSentAt = new Date(start.getTime() + ((interval ?? 0) * 1000 * i))
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

const EmailRow: FC<{
  email: Email & {
    contact: Contact;
  },
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>) => void,
  setCurrentEmail: (email: Email & {
    contact: Contact;
  }) => void
  setEmailDialogOpen: (bool: boolean) => void,
  checked: boolean
}> = ({ email, handleSelect, checked, setCurrentEmail, setEmailDialogOpen }) => {

  const utils = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [sendDate, setSendDateStateOnly] = useState<Date | null>(email.toBeSentAt);
  const dateRef = useRef(email.toBeSentAt);
  const setSendDate = useCallback((newDate: Date | null) => { setSendDateStateOnly(newDate); dateRef.current = newDate }, [])

  useEffect(() => {
    if (email?.toBeSentAt?.getTime() !== sendDate?.getTime()) {
      setSendDate(email.toBeSentAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email.toBeSentAt])

  const { mutate: updateToBeSentAt } = trpc.useMutation(['email.update-toBeSentAt'], {
    onSuccess: (err, updated) => {
      utils.invalidateQueries('email.getAll')
      const msg = updated.toBeSentAt ?
        `Zaktualizowano datę na ${updated.toBeSentAt.toLocaleString()}`
        :
        "Usunięto datę wysłania"
      enqueueSnackbar(msg, { variant: 'success', preventDuplicate: true });
    }
  })


  const updateDate = () => {
    console.log("UPDATING DATE")
    updateToBeSentAt({
      id: email.id,
      toBeSentAt: dateRef.current
    });
    setTimePickerOpen(false);
  }

  const wasSent = !!email.sentAt;

  const contact = email.contact;
  return (
    <TableRow
      key={email.id}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      {/* EMAIL */}
      <TableCell component="th" scope="row">
        {contact.email} {contact.nickName && ` (${contact.nickName})`}
      </TableCell>
      {/* SUBJECT */}
      <TableCell>{email.subject}</TableCell>
      {/* BODY/HTML */}
      <TableCell>{extractText(email.body).substring(0, 40)}...</TableCell>
      {/* ID */}
      <TableCell align="right">{email.id}</TableCell>
      <TableCell align="right">
      {/* TIME */}
      {wasSent ?
            <div>
              {email.sentAt!.toLocaleString()}
              <Typography variant="subtitle1" color="text.secondary" className="italic ml-2">
                {`(${moment(email.sentAt!).locale("pl").fromNow()})`}
              </Typography>
            </div>
            :
            <div className="inline-flex gap-3 items-center">
              {email.toBeSentAt &&
                <Typography variant="subtitle1" color="text.secondary" className="italic">
                  {email.toBeSentAt && moment(email.toBeSentAt).locale("pl").fromNow()}
                </Typography>
              }
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  renderInput={(props) => <TextField {...props} size="small" />}
                  label={email.toBeSentAt ? "Edytuj datę wysłania" : "Zaplanuj wysłanie"}
                  value={sendDate}
                  onChange={(newDate) => {
                    setSendDate(newDate)
                    console.log("STATE SET")
                    // if empty, submit
                    if (!newDate) {
                      updateToBeSentAt({
                        id: email.id,
                        toBeSentAt: null
                      });
                    }
                  }}
                  open={timePickerOpen}
                  onOpen={() => setTimePickerOpen(true)}
                  onClose={updateDate}
                />
              </LocalizationProvider>
            </div>
          }
      </TableCell>
      <TableCell align="right">
        <div className="inline-flex items-center gap-2">
          <Button size="small" onClick={() => {
            setCurrentEmail(email);
            setEmailDialogOpen(true);
          }}>
            Mail
          </Button>
          {!email.sentAt && <Checkbox name={email.id} sx={{ margin: "-0.5em" }} onChange={handleSelect} checked={checked} />}
        </div>
      </TableCell>
    </TableRow>
  )
}

const EmailTimesPreview = ({ emails, interval, start }:
  {
    emails: (Email & { contact: Contact; })[],
    interval: number | null,
    start: Date
  }) => {


  return (
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
          {emails.map((email, i) => {
            const sendDate = new Date(start.getTime() + ((interval ?? 0) * 1000 * i))
            return (
              <TableRow
                key={email.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">{email.contact.email}</TableCell>
                <TableCell align="right">{email.subject}</TableCell>
                <TableCell align="right">
                  {sendDate.toLocaleString()}
                  <Typography variant="subtitle1" color="text.secondary" className="italic ml-2">
                    {`(${moment(sendDate).locale("pl").fromNow()})`}
                  </Typography>
                </TableCell>
              </TableRow>
            )
          })}
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
  const { enqueueSnackbar } = useSnackbar();
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [sendDate, setSendDateStateOnly] = useState<Date | null>(email.toBeSentAt);
  const dateRef = useRef(email.toBeSentAt);
  const setSendDate = useCallback((newDate: Date | null) => { setSendDateStateOnly(newDate); dateRef.current = newDate }, [])

  useEffect(() => {
    if (email?.toBeSentAt?.getTime() !== sendDate?.getTime()) {
      setSendDate(email.toBeSentAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email.toBeSentAt])

  const { mutate, error } = trpc.useMutation(['email.delete'], {
    onError: (error) => {
      alert(error)
    },
    onSuccess: (data) => {
      utils.invalidateQueries('email.getAll')
    }
  })

  const { mutate: updateToBeSentAt } = trpc.useMutation(['email.update-toBeSentAt'], {
    onSuccess: (err, updated) => {
      utils.invalidateQueries('email.getAll')
      const msg = updated.toBeSentAt ?
        `Zaktualizowano datę na ${updated.toBeSentAt.toLocaleString()}`
        :
        "Usunięto datę wysłania"
      enqueueSnackbar(msg, { variant: 'success', preventDuplicate: true });
    }
  })

  const onDelete = () => {
    console.log(email)
    mutate({ id: email.id })
  }

  const updateDate = () => {
    console.log("UPDATING DATE")
    updateToBeSentAt({
      id: email.id,
      toBeSentAt: dateRef.current
    });
    setTimePickerOpen(false);
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
              <Typography variant="subtitle1" color="text.secondary" className="italic ml-2">
                {`(${moment(email.sentAt!).locale("pl").fromNow()})`}
              </Typography>
            </div>
            :
            <div className="flex gap-3 items-center">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  renderInput={(props) => <TextField {...props} />}
                  label={email.toBeSentAt ? "Edytuj datę wysłania" : "Zaplanuj wysłanie"}
                  value={sendDate}
                  onChange={(newDate) => {
                    setSendDate(newDate)
                    console.log("STATE SET")
                    // if empty, submit
                    if (!newDate) {
                      updateToBeSentAt({
                        id: email.id,
                        toBeSentAt: null
                      });
                    }
                  }}
                  open={timePickerOpen}
                  onOpen={() => setTimePickerOpen(true)}
                  onClose={updateDate}
                />
              </LocalizationProvider>
              <Typography variant="subtitle1" color="text.secondary" className="italic">
                {email.toBeSentAt && moment(email.toBeSentAt).locale("pl").fromNow()}
              </Typography>
            </div>
          }
        </div>
        {!wasSent && <Button startIcon={<DeleteIcon />} onClick={onDelete}>Usuń</Button>}
      </footer>
      <div className="absolute bottom-0.5 right-1 text-xs text-gray-300 italic">ID: {email.id}</div>
    </Paper>
  )
};

export default EmailDisplay;
