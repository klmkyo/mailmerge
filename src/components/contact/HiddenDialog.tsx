import RestoreIcon from '@mui/icons-material/Restore';
import { DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { Dispatch, FC, SetStateAction } from "react";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import { ContactTable } from "./ContactTable";

export const HiddenDialog: FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
  hiddenContacts: inferQueryOutput<"contact.getAllAndHidden">;
  selectedHiddenContacts: inferQueryOutput<"contact.getAllAndHidden">;
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
}> = ({ open, setOpen, hiddenContacts, selectedIds, setSelectedIds, selectedHiddenContacts }) => {

  const utils = trpc.useContext();

  const { mutate: unHideManyContacts } = trpc.useMutation(['contact.unhide-many'], {
    onMutate: async (data) => {
      const previousContacts = utils.getQueryData(['contact.getAllAndHidden']);

      const selectedContactIds = data.ids;

      utils.setQueryData(['contact.getAllAndHidden'], old => old!.map(c => {
        c.hidden = selectedContactIds.includes(c.id) ? false : c.hidden;
        return c;
      }));

      return { previousContacts };
    },
    onError: (err, newContacts, context) => {
      utils.setQueryData(['contact.getAllAndHidden'], context!.previousContacts!);
    },
    onSettled: (data) => {
      utils.invalidateQueries('contact.getAllAndHidden');
    }
  });

  const unHideSelected = () => {
    unHideManyContacts({
      ids: selectedIds
    });

    // reset selected ids
    setSelectedIds([]);
  };

  return (
    <>
      <Dialog open={open} onClose={() => { setOpen(false); }} maxWidth="xl">
        <DialogTitle>
          <div className="flex justify-between">
            <div>
              Ukryte kontakty
              <Typography color="text.secondary" className="italic text-sm">{"(kontakty które nie mogły być usunięte, bo został do nich wysłany email)"}</Typography>
            </div>

            <Button onClick={() => unHideSelected()} startIcon={<RestoreIcon />} disabled={selectedIds.length === 0}>
              Przywróć Kontakty
            </Button>
          </div>
        </DialogTitle>
        <DialogContent className="mt-1">
          <ContactTable contacts={hiddenContacts} selectedIds={selectedIds} setSelectedIds={setSelectedIds} selectedContacts={selectedHiddenContacts} />
        </DialogContent>
      </Dialog>
    </>
  );
};
