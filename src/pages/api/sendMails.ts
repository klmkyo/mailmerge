import type { NextApiRequest, NextApiResponse } from "next";
import { createTRPCClient } from '@trpc/client';
import { AppRouter } from "../../server/router";
import { getBaseUrl } from "../_app";

const sendMails = async (req: NextApiRequest, res: NextApiResponse) => {

  const client = createTRPCClient<AppRouter>({
    url: `${getBaseUrl()}/api/trpc`,
  });

  try{
    await client.mutation('public.send-unsent-emails');
    res.status(200).json({ message: "success" });
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Error sending emails" });
  }

};

export default sendMails;
