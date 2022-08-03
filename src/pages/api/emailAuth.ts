import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/db/client";
import { oauth2Client } from "../../utils/google";

const emailAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req);

  console.log(req.query);

  const code = req.query.code as string;

  const { tokens } = await oauth2Client.getToken(code);
  const { refresh_token } = tokens;

  res.status(200).json({ message: "success" });
};

export default emailAuth;
