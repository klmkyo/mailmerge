import type { NextApiRequest, NextApiResponse } from "next";

const sendMails = async (req: NextApiRequest, res: NextApiResponse) => {

  try{
    // await client.mutation('public.send-unsent-emails');
    // bounce that back to email server
    res.status(200).json({ message: "success" });
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Error sending emails" });
  }

};

export default sendMails;
