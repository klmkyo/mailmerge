import { EmailTemplate } from "@prisma/client";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC } from "react";
import EmailTemplateCreate from "../../../components/emailTemplate/EmailTemplateCreate";
import { Loading } from "../../../components/Loading";
import { trpc } from "../../../utils/trpc";

const EmailTemplateEdit: FC<{templateId: string}> = ({templateId}) => {

  const router = useRouter();

  const {data: providedEmailTemplate, isLoading, error} = trpc.useQuery(["emailTemplate.get", {
    id: router.query.templateId as string,
  }])

  if(isLoading){
    return <Loading />
  }

  return (
    <>
      <Head>
        <title>Edytuj Szablon Maila</title>
      </Head>

      <main className="h-screen w-full p-10">
        <EmailTemplateCreate providedEmailTemplate={providedEmailTemplate!} />
      </main>
    </>
  );
};

export default EmailTemplateEdit;
