import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { FC, useEffect, useMemo, useCallback } from "react";
import { onlyUnique } from "../../utils/onlyUnique";
import { inferQueryOutput } from "../../utils/trpc";
import { useAllTags, compare } from '../../pages/contact/index';
import { ContactRow } from "./ContactRow";


export const ContactTable: FC<{
  contacts: inferQueryOutput<"contact.getAllAndHidden">;
  selectedIds: string[];
  setSelectedIds: (selectedIds: string[]) => void;
}> = ({ contacts, selectedIds, setSelectedIds }) => {

  const { allTags, addTag } = useAllTags();

  useEffect(() => {
    contacts?.map((c) => c.tags).flat().filter(onlyUnique).forEach((tag) => addTag(tag));
  }, [contacts, addTag]);

  // an object containing tag: select_count pairs
  const tagCountMap = useMemo(() => {
    const tempTagCountMap: { [tag: string]: number; } = {};
    contacts.forEach((contact) => {
      contact.tags.forEach(tag => {
        tempTagCountMap[tag] = (tempTagCountMap[tag] || 0) + 1;
      });
    });
    return tempTagCountMap;
  }, [contacts]);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedIds([...selectedIds, name]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== name));
    }
  }, [selectedIds, setSelectedIds]);

  const contactArray = useMemo(() => contacts?.sort((a, b) => compare(a.email, b.email)).map((contact) => (
    <ContactRow key={contact.id} contact={contact} handleSelect={handleSelect} checked={selectedIds.includes(contact.id)} />
  )), [contacts, selectedIds, handleSelect]);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Wysłane Maile</TableCell>
            <TableCell>Nick</TableCell>
            <TableCell>
              <div className="inline-flex gap-4 items-center" style={{ width: "min(40em, 50vw)" }}>
                Tagi:
                <div className="inline-flex gap-1.5 overflow-scroll">
                  {allTags.map((tag, i) => {
                    return (
                      // if some are selected, show the count
                      <Chip label={`${tag}: ${tagCountMap[tag] ?? 0}`} key={i}
                        variant="outlined"
                        size="small" />);
                  })}
                </div>
              </div>
            </TableCell>
            <TableCell align="right">Akcje</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contactArray}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
