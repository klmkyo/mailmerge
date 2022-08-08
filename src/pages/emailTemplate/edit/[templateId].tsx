// page in which you create emailTemplates

import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, useTheme } from "@mui/material";
import { Editor } from '@tinymce/tinymce-react';
import { useRouter } from "next/router";
import { useSnackbar } from 'notistack';
import { FC, useRef, useState } from "react";
import { Editor as TinyMCEEditor } from 'tinymce';
import { createGdriveChip } from "../../../utils/gdriveChip";
import { isDev } from "../../../utils/isDev";
import { trpc } from "../../../utils/trpc";

const Action = () => {

  const router = useRouter();

  return(
    <>
      <Button onClick={() => { router.push("/emailTemplate"); }}>
        Zobacz szablony
      </Button>
    </>
  )
};


const EmailTemplateCreate: FC = () => {

  const router = useRouter()
  const utils = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();
  const [gdriveDialogOpen, setGdriveDialogOpen] = useState(false);

  const templateId = router.query.templateId as string;

  const {data: emailTemplate, isLoading} = trpc.useQuery(["emailTemplate.get", {id: templateId}], {
    onSuccess: (data) => {
      if(!data){
        throw new Error("No emailTemplate found");
      }
      setSubject(data.subject)
      editorRef.current?.setContent(data.body)
    }
  })


  const [subject, setSubject] = useState("");

  // modal state
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [position, setPosition] = useState('end');

  const theme = useTheme();

  const { mutate, error } = trpc.useMutation(["emailTemplate.update"], {
    onSuccess: () => {
      utils.invalidateQueries(["emailTemplate.getAll"]);
      router.push("/emailTemplate")
    }
  })

  const editorRef = useRef<TinyMCEEditor | null>(null);

  const createTemplate = () => {
    const body = editorRef.current?.getContent();
    if (!body || !subject) {
      alert("Temat oraz treść nie mogą być puste");
      return;
    }
    mutate({
      id: templateId,
      subject,
      body
    })
  }

  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  return (
    <div className="p-6 mt-8">

      <div className="flex flex-col">
        {error && <p>{error.message}</p>}
        <TextField label="Tytuł Maila" value={subject} onChange={(e)=>setSubject(e.target.value)} style={{width: "30em", marginBottom: "2em"}} />

        <span className="text-xl mb-1">
          Treść Maila:
        </span>
        <Editor
          apiKey="akd0k9vvpz6khox3asb2e431rwtfjgc7wxt1ovdudkb2qo53"
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={emailTemplate?.body ?? ""}
          init={{
            language: 'pl',
            ...(theme.palette.mode === "dark" && {skin: "oxide-dark", content_css: "dark"}),
            branding: false,
            height: 500,
            menubar: true,
            plugins: [
              'a11ychecker', 'advlist', 'advcode', 'advtable', 'autolink', 'checklist', 'export',
              'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
              'powerpaste', 'fullscreen', 'formatpainter', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | casechange blocks | bold italic backcolor | ' +
              'alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help',
            newline_behavior: 'linebreak',

          }}
        />
        <br />

        <div className="flex flex-row-reverse gap-2">
          <Button disabled={!subject} startIcon={<MarkEmailReadOutlinedIcon />} className="border" variant="outlined" onClick={createTemplate}>
            Zaktualizuj szablon
          </Button>
          <Button startIcon={<AddToDriveIcon />} className="border" onClick={() => setGdriveDialogOpen(true)}>
            {/* TODO https://developers.google.com/drive/picker/guides/overview */}
            Dodaj linki z dysku googla
          </Button>
        </div>

      </div>
      <br />
      <br />
      {isDev && <button className="border" onClick={log}>Log editor content</button>}

      <Dialog
        open={gdriveDialogOpen}
        onClose={() => setGdriveDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="alert-dialog-title">
          {"Dodawanie linku do dysku Googla"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Link do pliku:
          </DialogContentText>
          <TextField
            style={{ marginTop: ".3em" }}
            placeholder="https://drive.google.com/file/d/1V2sNDeHho_h8psuuTRR4qGrRbSWvRo1_/view"
            variant="standard"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
          />

          <DialogContentText id="alert-dialog-description" style={{ marginTop: "1.5em" }}>
            Nazwa pliku:
          </DialogContentText>
          <TextField
            style={{ marginTop: ".3em" }}
            placeholder="1.mp3"
            variant="standard"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            fullWidth
          />

          <FormControl>
            <FormLabel style={{ marginTop: "1.5em" }}>Wstaw:</FormLabel>
            <RadioGroup
              row
              name="row-radio-buttons-group"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <FormControlLabel value="end" control={<Radio />} label="Na końcu maila" />
              <FormControlLabel value="cursor" control={<Radio />} label="Przy kursorze" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGdriveDialogOpen(false)}>Anuluj</Button>
          <Button
            onClick={() => {
              setGdriveDialogOpen(false);

              if (position === "end") {
                // yikes
                editorRef.current?.setContent(editorRef.current?.getContent() + createGdriveChip(url.split("?")[0]!, filename))
              } else {
                editorRef.current?.insertContent(createGdriveChip(url.split("?")[0]!, filename),);
              }
              setUrl('');
              setFilename('');
            }}
            disabled={(!url || !url.split("?")[0]!.endsWith("view")) || !filename}
            autoFocus
          >
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default EmailTemplateCreate;
