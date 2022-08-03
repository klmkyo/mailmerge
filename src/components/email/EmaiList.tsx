import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { FC } from "react";
import { Email, Contact } from "@prisma/client";
import { Box, Button, Grid } from "@mui/material";

const EmailList: FC = () => {

  const { data, isLoading, error } = trpc.useQuery(['email.getAll']);

  if (isLoading) {
    return <p>Loading emails...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
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
    <div className="flex flex-col items-stretch items-center m-2 p-4 border" style={{ width: "50em", height: "40em" }}>

      <header className="flex justify-between border-b pb-4">
        {/* Subject / Recepient */}
        <div>
          <div className="text-3xl">{email.subject}</div>
          <div><i>Do: {email.contact.email}</i></div>
        </div>
        <div className="text-left">
          <div>{email.toBeSentAt ? dateString : "Wysłanie nie zaplanowane"}</div>
          <div>{email.tags?.join(", ")}</div>
        </div>
      </header>

      <div className="flex-1">
        {email.body}
      </div>

      <footer className="flex justify-between border-t pt-2">
        <div>ID: {email.id}</div>
        <Button onClick={onDelete}>Delete</Button>
      </footer>
    </div>
  )
};

export default EmailList;
