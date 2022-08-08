import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/smtp-transport";
// import { getBaseUrl } from "../pages/_app";

const getBaseUrl = () => "https://localhost:3000";

// replace with env
const cID = ""
const cS = ""
const rT = ""

console.log({ cID, cS, rT })


const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "mklmkyo@gmail.com",
    // make it somehow nicer with nextauth, i mean we can use nextauth to get the token (somehow)
    clientId: cID,
    clientSecret: cS,
  }
});

const mailOptions: MailOptions = {
  from: "mklmkyo@gmail.com",
  to: "mklimek03@gmail.com",
  subject: "track2",
  html: `<b>test</b><img src=\"${getBaseUrl()}/api/img/${"cl6cu95td03767sc05z6i0hzu"}\"></img>`,
  auth: {
    refreshToken: ""
  }
};

smtpTransport.sendMail(mailOptions, (error, response) => {
  error ? console.log(error) : console.log(response);
  smtpTransport.close();
});
