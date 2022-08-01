import React from "react";
import { useForm } from "react-hook-form";
import { trpc } from "../../utils/trpc";

export default function EmailCreate() {

  const { handleSubmit, register, control } = useForm<>();

  const { mutate, error } = trpc.useMutation(["contact.create"])

  // contacts array


  // email template array

  const onSubmit = (data: ) => {
    mutate(data)
  }

  return (
    <>
      Choose emails to send:
      <br />
      Choose templates to use {"(a template will be randomly chosen for each receipient)"}
      <br />

      <button>
        Save Drafts
      </button>
      <button>
        View Unsent Drafts
      </button>
    </>
  )
}
