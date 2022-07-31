import { Prisma } from "@prisma/client";
import { prisma } from "../server/db/client";


const saveVisit = async ({emailId, requestData}: {emailId: string, requestData: Prisma.JsonObject}) => {
  await prisma.emailVisit.create({
    data: {
      email: {
        connect: {
          id: emailId
        }
      },
      requestData,
    }
  })
}

export default saveVisit
