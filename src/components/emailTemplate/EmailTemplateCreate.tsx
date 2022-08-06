// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { CreateContactSchemaInput } from "../../schema/contact.schema";
import { Box, Button, ButtonGroup, Grid, Checkbox, FormControlLabel, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { FC, useRef, useState } from "react";
import { CreateEmailTemplateInput } from "../../schema/emailTemplate.schema";
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { isDev } from "../../utils/isDev";
import { createGdriveChip } from "../../utils/gdriveChip";


const EmailTemplateCreate: FC = () => {

  const utils = trpc.useContext();

  const { handleSubmit, register } = useForm<CreateEmailTemplateInput>();
  const [gdriveDialogOpen, setGdriveDialogOpen] = useState(false);

  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');

  const { mutate, error } = trpc.useMutation(["emailTemplate.create"], {
    onSuccess: () => {
      utils.invalidateQueries(["emailTemplate.getAll"]);
    }
  })

  const onSubmit = (data: CreateEmailTemplateInput) => {
    mutate(data)
  }

  const editorRef = useRef<TinyMCEEditor | null>(null);
    const log = () => {
    if (editorRef.current) {
        console.log(editorRef.current.getContent());
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <p>{error.message}</p>}
      <input className="border" type="subject" placeholder="subject" {...register("subject")}></input>
      <br />
      <textarea className="border" placeholder="body" {...register("body")}></textarea>
      <br />
      <Editor
        apiKey="akd0k9vvpz6khox3asb2e431rwtfjgc7wxt1ovdudkb2qo53"
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue=""
        init={{
        height: 500,
        menubar: true,
        plugins: [
           'a11ychecker','advlist','advcode','advtable','autolink','checklist','export',
           'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
           'powerpaste','fullscreen','formatpainter','insertdatetime','media','table','help','wordcount'
        ],
        toolbar: 'undo redo | casechange blocks | bold italic backcolor | ' +
           'alignleft aligncenter alignright alignjustify | ' +
           'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help',
        newline_behavior: 'linebreak'
        }}
    />
    <br />
      <button className="border" type="submit">Submit</button>
    </form>
    <br />
    <br />
    {isDev && <button className="border" onClick={log}>Log editor content</button>}
    <br />
    <button className="border" onClick={ ()=>setGdriveDialogOpen(true) }>Dodaj linki z dysku googla</button>

    <Dialog
        open={gdriveDialogOpen}
        onClose={()=>setGdriveDialogOpen(false)}
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
            style={{marginTop: ".3em"}}
            placeholder="https://drive.google.com/file/d/1V2sNDeHho_h8psuuTRR4qGrRbSWvRo1_/view"
            variant="standard"
            value={url}
            onChange={(e)=>setUrl(e.target.value)}
            fullWidth 
          />

          <DialogContentText id="alert-dialog-description" style={{marginTop: "1.5em"}}>
            Nazwa pliku:
          </DialogContentText>
          <TextField
            style={{marginTop: ".3em"}}
            placeholder="1.mp3"
            variant="standard"
            value={filename}
            onChange={(e)=>setFilename(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setGdriveDialogOpen(false)}>Anuluj</Button>
          <Button
          onClick={()=>{
            setGdriveDialogOpen(false);
            editorRef.current?.insertContent(createGdriveChip(url!.split("?")[0], filename));
            setUrl('');
            setFilename('');
          }}
          disabled={(!url || !url!.split("?")[0].endsWith("view")) || !filename}
          autoFocus
          >
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default EmailTemplateCreate;
