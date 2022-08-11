// page in which you create emailTemplates

import AddToDriveIcon from '@mui/icons-material/AddToDrive';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { Button, TextField, useTheme } from "@mui/material";
import { Editor } from '@tinymce/tinymce-react';
import { useRouter } from "next/router";
import { useSnackbar } from 'notistack';
import { FC, useRef, useState } from "react";
import useDrivePicker from 'react-google-drive-picker';
import { Editor as TinyMCEEditor } from 'tinymce';
import { createGdriveChip } from "../../utils/gdriveChip";
import { isDev } from "../../utils/isDev";
import { trpc } from "../../utils/trpc";
import { EmailTemplate } from "@prisma/client";
import { Edit } from '@mui/icons-material';

const FixSharing = (url: string) => {
  return(
    <a href={url} target="_blank" rel="noreferrer">
      <Button color="secondary" variant="outlined">
        Zobacz Plik
      </Button>
    </a>
  )
};


export const EmailTemplateCreate: FC<{providedEmailTemplate?: EmailTemplate}> = ({providedEmailTemplate}) => {

  const router = useRouter()
  const utils = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();

  // if providedEmTemplate is provided, we are editing a template, so use it's calues
  const [subject, setSubject] = useState(providedEmailTemplate?.subject ?? "");
  const theme = useTheme();

  // in case we are (creating) an email template
  const { mutate: createET, error: createError } = trpc.useMutation(["emailTemplate.create"], {
    onSuccess: () => {
      utils.invalidateQueries(["emailTemplate.getAll"]);
      enqueueSnackbar("Utworzono szablon!")
      router.push("/emailTemplate")
    }
  })

  // in case we are (updating) email template
  const { mutate: updateET, error: updateError } = trpc.useMutation(["emailTemplate.update"], {
    onSuccess: () => {
      utils.invalidateQueries(["emailTemplate.getAll"]);
      router.push("/emailTemplate")
    }
  })

  const editorRef = useRef<TinyMCEEditor | null>(null);

  const addDriveChip = (position: "end" | "current", url: string, filename: string) => {
    if (position === "end") {
      // yikes
      editorRef.current?.setContent(editorRef.current?.getContent() + createGdriveChip(url.split("?")[0]!, filename))
    } else {
      editorRef.current?.insertContent(createGdriveChip(url.split("?")[0]!, filename),);
    }
  }

  const {data: gDriveTokens} = trpc.useQuery(["settings.get-gdrive-tokens"]);
  const [openPicker, authResponse] = useDrivePicker();


  const handleOpenPicker = () => {

    const {accessToken, developerKey, clientId} = gDriveTokens!;

    if(!accessToken || !developerKey || !clientId) {
      enqueueSnackbar(`Wystąpił błąd podczas logowania do googla, jeśli widzisz ten błąd to weź mi go zgłoś XD`, { variant: "error" });
    }
    openPicker({
      clientId,
      developerKey,
      token: accessToken || "",
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button')
        } else if (data.action === "picked"){
          data.docs.map(obj => {
            addDriveChip("end", `https://drive.google.com/file/d/${obj.id}/view`, obj.name)
            if(!obj.isShared){
              // TODO link to file, button
              enqueueSnackbar(`${obj.name} nie jest udostępniony, we to napraw bo łajcior znowu nie zobaczy`, { variant: "error", action: () => FixSharing(obj.url) });
            }
          })
        }
      },
    })
  }

  const createTemplate = () => {
    const body = editorRef.current?.getContent();
    if (!body || !subject) {
      alert("Temat oraz treść nie mogą być puste");
      return;
    }
    if (providedEmailTemplate) {
      // if we are updating email template
      updateET({
        id: providedEmailTemplate.id,
        subject,
        body,
      })
    } else {
      // if we are creating email template
      createET({
        subject,
        body
      })
    }
  }

  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  return (
    <>
      <div className="flex flex-col">
        {createError && <p>{createError.message}</p>}
        {updateError && <p>{updateError.message}</p>}
        <TextField label="Tytuł Maila" value={subject} onChange={(e)=>setSubject(e.target.value)} style={{width: "30em", marginBottom: "2em"}} />

        <span className="text-xl mb-1">
          Treść Maila:
        </span>
        <Editor
          apiKey="akd0k9vvpz6khox3asb2e431rwtfjgc7wxt1ovdudkb2qo53"
          onInit={(evt, editor) => editorRef.current = editor}
          // in case we are (updating) email template
          initialValue={providedEmailTemplate?.body ?? `<div dir="ltr"></div>`}
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
          <Button disabled={!subject} startIcon={providedEmailTemplate ? <Edit /> : <MarkEmailReadOutlinedIcon />}
            className="border" variant="outlined" onClick={createTemplate}>
              {
                providedEmailTemplate ? "Zapisz szablon" : "Utwórz szablon"
              }
          </Button>
          <Button startIcon={<AddToDriveIcon />} className="border" onClick={() => handleOpenPicker()} disabled={!gDriveTokens}>
            {/* TODO https://developers.google.com/drive/picker/guides/overview */}
            Dodaj linki z dysku googla
          </Button>
        </div>

      </div>
      <br />
      <br />
      {isDev && <button className="border" onClick={log}>Log editor content</button>}
    </>
  );
};

export default EmailTemplateCreate;
