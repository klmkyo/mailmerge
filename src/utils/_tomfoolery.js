const google_id = "116448803588605468984";
const access_token =
  "ya29.A0AVA9y1sehzQcbd9tzdXq04-8j2W7TFmtdfLEWalNZDACK4XoawuRIOFTSlVS5v46-8EgvqYIZ2O9fMcJ7E-9wMYie1YBDUYsCF6w-JBf5GQ8mA0o0flNB4x9itHmjox6fq7iHxqnQHJEWVBSs6O0-GfJ8ScpaCgYKATASATASFQE65dr8Uo38nfQqM6jWMlZMH-AANw0163";
const xoauth_raw = `user=${google_id}\u0001auth=Bearer ${access_token}\u0001\u0001`;
const xoauth_base64 = Buffer.from(xoauth_raw).toString("base64");

console.log(xoauth_base64);
