// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import saveVisit from "../../../utils/saveVisit";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {

  const { emailId } = req.query;
  // if emailId somehow is an array, select first element
  const emailIdStr = Array.isArray(emailId) ? emailId[0] : emailId;

  const { headers, cookies } = req;
  const requestData = {headers, cookies};

  saveVisit({ emailId: emailIdStr!, requestData });

  res
    .status(200)
    .setHeader('Content-Type', 'image/jpg')
    .send(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="));
};

export default examples;
