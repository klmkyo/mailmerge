import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { FC, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from "react";
import { onlyUnique } from "../../utils/onlyUnique";
import { inferQueryOutput } from "../../utils/trpc";
import { useAllTags, compare } from '../../pages/contact/index';
import { ContactRow } from "./ContactRow";


export const ContactTable: FC<{
  contacts: inferQueryOutput<"contact.getAllAndHidden">;
  selectedContacts: inferQueryOutput<"contact.getAllAndHidden">;
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
}> = ({ contacts, selectedContacts, selectedIds, setSelectedIds }) => {

  const { allTags, addTag } = useAllTags();

  useEffect(() => {
    contacts?.map((c) => c.tags).flat().filter(onlyUnique).forEach((tag) => addTag(tag));
  }, [contacts, addTag]);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedIds([...selectedIds, name]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== name));
    }
  }, [selectedIds, setSelectedIds]);

  // an object containing tag: select_count pairs
  const tagCountMap = useMemo( () => {
    const tempTagCountMap: {[tag: string]: number} = {}
    contacts.forEach( (contact) => {
      contact.tags.forEach( tag => {
        tempTagCountMap[tag] = (tempTagCountMap[tag] || 0) + 1
      })
    })
    return tempTagCountMap;
  }, [contacts])

  // an object containing tag: select_count pairs, but for selected tags
  const selectedTagCountMap = useMemo( () => {
    const tempTagCountMap: {[tag: string]: number} = {}
    // if we're working on hidden contacts, filter those out
    selectedContacts?.forEach( (contact) => {
      contact.tags.forEach( tag => {
        tempTagCountMap[tag] = (tempTagCountMap[tag] || 0) + 1
      })
    })
    return tempTagCountMap;
  } , [selectedContacts])

  const toggleContactSelection = ({id, selected}: {id:string, selected?: boolean}) => {
    const toBeChecked = selected ?? !selectedIds.includes(id);

    if (toBeChecked) {
      setSelectedIds(oldSelectedIds => [...oldSelectedIds, id]);
    } else {
      setSelectedIds(oldSelectedIds => oldSelectedIds.filter(sid => sid !== id));
    }
  }

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
                    
                    // if there are 0 tags, it is actually undefined
                    const chipSelected = tagCountMap[tag] && (selectedTagCountMap[tag] == tagCountMap[tag]);

                    return (
                      // if some are selected, show the count
                      <Chip 
                        label={selectedTagCountMap[tag] ? `${tag}: ${selectedTagCountMap[tag]?? 0}/${tagCountMap[tag]}`:  `${tag}: ${tagCountMap[tag] ?? 0}`} key={i}
                        variant={chipSelected ? "filled" : "outlined"}
                        color={chipSelected ? "secondary" : undefined}
                        onClick={()=>{
                          contacts.filter(c=>c.tags.includes(tag)).forEach(c => toggleContactSelection({id: c.id, selected: !chipSelected}) )
                        }} />);
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
