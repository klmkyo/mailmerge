import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { FC } from "react";
import { Email, Contact } from "@prisma/client";
import { Box, Grid } from "@mui/material";

const EmailList: FC = () => {

  const { data, isLoading, error } = trpc.useQuery(['email.getAll']);

  if (isLoading) {
    return <p>Loading emails...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <Box sx={{width: "100%", height: "100%"}}>
    <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
      {data?.map((email) => {
        return (
          <Email key={email.id} email={email} />
        )
      })}
    </Grid>
    </Box>
  );
};

const Email = ({ email }: {
  email: Email & {
    contact: Contact;
  }
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

  const onDelete = () => {
    console.log(email)
    mutate({ id: email.id })
  }


  const toBeSentToday = new Date().toDateString() === email.toBeSentAt?.toDateString();
  const dateString = `${email.toBeSentAt?.toLocaleTimeString()}${(toBeSentToday ? '' : ` ${email.toBeSentAt?.toLocaleDateString()}`)}`;

  return (
    <div className="flex-row items-center m-2 p-2 border" style={{width: "50em", height: "40em"}}>
      <div>Odbiorca: {email.contact.email}</div>
      <div>Tytuł: {email.subject}</div>
      <div>Treść: {email.body}</div>
      <div>Tagi: {email.tags}</div>
      <div>Będzie wysłane: {email.toBeSentAt ? dateString : "Nie zaplanowane"}</div>
      <div>ID: {email.id}</div>
      <button onClick={onDelete}>Delete</button>
    </div>
  )
};

export default EmailList;
