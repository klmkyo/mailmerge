import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import { prisma } from "../../server/db/client";
import { oauth2Client } from "../../utils/google";

const emailAuth = async (req: NextApiRequest, res: NextApiResponse) => {

  const session = await getServerSession(req, res, nextAuthOptions);

  if (!session || !session.user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  const { user } = session;

  console.log(req);

  const code = req.query.code as string;
  const { tokens } = await oauth2Client.getToken(code);
  const { refresh_token } = tokens;

  if (!refresh_token) {
    res.status(500).json({ error: "No refresh token found" });
    return;
  }

  try {
    await prisma.gmailSettings.upsert({
      where: {
        userId: session.user?.id
      },
      update: {
        refreshToken: refresh_token
      },
      create: {
        email: user.email!,
        refreshToken: refresh_token,
        user: {
          connect: {
            id: user.id!
          }
        }
      }
    })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error saving refresh token" });
    return;
  }

  res.status(200).json({ message: "success" });
};

export default emailAuth;
