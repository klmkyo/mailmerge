import nodemailer from "nodemailer";

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
  to: "klimek@tuta.io",
  subject: "Node.js Email with Secure OAuth",
  generateTextFromHTML: true,
  html: "<b>test</b>"
};

smtpTransport.sendMail(mailOptions, (error, response) => {
  error ? console.log(error) : console.log(response);
  smtpTransport.close();
});
