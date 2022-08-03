import nodemailer from "nodemailer";
import { getBaseUrl } from "../pages/_app";
import { prisma } from "../server/db/client";

// replace with env
const cID = "REPLACE_ME"
const cS = "REPLACE_ME"
const rT = "REPLACE_ME"

console.log({ cID, cS, rT })


const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "mklimek03@gmail.com",
    // make it somehow nicer with nextauth, i mean we can use nextauth to get the token (somehow)
    clientId: cID,
    clientSecret: cS,
    refreshToken: rT,
  }
});

const mailOptions = {
  from: "mklimek03@gmail.com",
  to: "mklmkyo@gmail.com",
  subject: "track2",
  generateTextFromHTML: true,
  html: `<b>test</b><img src=\"${getBaseUrl()}/api/track/${"cl6cu95td03767sc05z6i0hzu"}\"></img>`
};

smtpTransport.sendMail(mailOptions, (error, response) => {
  error ? console.log(error) : console.log(response);
  smtpTransport.close();
});
