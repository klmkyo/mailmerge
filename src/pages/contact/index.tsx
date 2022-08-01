// page in which you create emailTemplates

import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useFieldArray, useForm } from 'react-hook-form';
import { NextPage } from "next";
import { CreateContactSchemaInput } from "../../schema/contact.schema";
import CreateContact from "../../components/contact/ContactCreate";
import ContactList from "../../components/contact/ContactList";

const CreateContactPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Create Contact</title>
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">

        <CreateContact />

        <br />

        <ContactList />

      </main>
    </>
  );
};

export default CreateContactPage;
