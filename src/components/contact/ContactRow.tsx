import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import { Contact } from "@prisma/client";
import { useSnackbar } from 'notistack';
import { FC, useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { useAllTags } from '../../pages/contact/index';


export const ContactRow: FC<{
  contact: Contact & {
    _count: {
      Email: number;
    };
  };
  checked: boolean;
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ contact, checked, handleSelect }) => {

  const { allTags, addTag } = useAllTags();

  const utils = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();

  const [tags, setTags] = useState<string[]>(contact.tags);

  // update tags when tags change
  useEffect(() => {
    setTags(contact.tags);
    // this dep array does not seem right, but it does work
  }, [contact.tags]);

  const [nickName, setNickName] = useState(contact.nickName);

  // nightmare nightmare nightmare
  const { mutate: deleteContact } = trpc.useMutation(['contact.delete'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden']);

      utils.setQueryData(['contact.getAllAndHidden'], old => old!.filter(x => x.id != data.id));

      return { previousContacts };
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!);
      enqueueSnackbar(err.message, { variant: 'error' });
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  });

  const { mutate: updateContact } = trpc.useMutation(['contact.update'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden']);

      utils.setQueryData(['contact.getAllAndHidden'], (oldContacts) => {

        const contactIndex = oldContacts!.findIndex(x => x.id == data.id)!;

        console.log(`Updated Contact ${contactIndex}`);
        let newContacts = oldContacts!;
        newContacts![contactIndex!]! = {
          ...newContacts![contactIndex!]!,
          ...data
        };

        return newContacts!;
      });

      return { previousContacts };
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!);
      enqueueSnackbar(err.message, { variant: 'error' });
    },
    onSuccess: (data) => {
      enqueueSnackbar(`Zaktualizowano ${contact.email}!`);
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  });

  const deleteOrHide = () => {
    // if an email has been sent to this contact, hide it
    if (contact._count.Email > 0) {
      updateContact({
        id: contact.id,
        hidden: true
      });
    }
    else {
      deleteContact({ id: contact.id });
    }
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        {contact.email}
      </TableCell>
      <TableCell component="th" scope="row">
        {contact._count.Email}
      </TableCell>
      <TableCell component="th" scope="row">
        <TextField
          value={nickName}
          onChange={(e) => { setNickName(e.target.value); }}
          label="Nick"
          variant="outlined"
          size="small"
          onBlur={() => {
            if (contact.nickName != nickName) {
              updateContact({
                id: contact.id,
                nickName
              });
            }
          }}
          style={{ width: "20rem" }} />
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

            if (JSON.stringify(newTags) != JSON.stringify(contact.tags)) {
              updateContact({
                id: contact.id,
                tags: newTags
              });
              // add new tags to allTags
              newTags.filter(x => !allTags.includes(x)).forEach((tag) => addTag(tag));
            }
          }}
          renderTags={(value: readonly string[], getTagProps) => value.map((option: string, index: number) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} size="small" />
          ))}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tagi"
              size="small"
              style={{ width: "min(30em, 50vw)" }} />
          )} />
      </TableCell>

      {/* Actions */}
      <TableCell component="th" align="right" scope="row">
        {contact.hidden ?
          <Tooltip placement="left" title="Przywróć kontakt">
            <IconButton
              aria-label="show"
              onClick={() => {
                updateContact({
                  id: contact.id,
                  hidden: false
                });
              }}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
          :
          <Tooltip placement="left" title={contact._count.Email > 0 ? "Schowaj kontakt" : "Usuń kontakt"}>
            <IconButton
              aria-label="delete"
              onClick={deleteOrHide}
            >
              {contact._count.Email > 0 ? <VisibilityOffIcon /> : <DeleteIcon />}
            </IconButton>
          </Tooltip>}

        <Checkbox name={contact.id} sx={{ margin: "-0.5em" }} onChange={handleSelect} checked={checked} />

      </TableCell>
    </TableRow>
  );
};
