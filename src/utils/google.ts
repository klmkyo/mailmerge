import { google } from "googleapis";
import { getBaseUrl } from "../pages/_app";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${getBaseUrl()}/settings/gmail_auth`
);

const scopes = [
  "https://mail.google.com/"
];

export const emailOAuthUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes,

  // to get the refresh token
  prompt: "consent"
});
