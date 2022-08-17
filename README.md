# MailMerge

MailMerge is a Next.js project, which enables creators to effortlessly reach multiple people at once using email.

## Features
  - Send emails to multiple people at once
  - Read receipts for each email
  - Integration with Google Drive (easily embed attachments: images, videos, music, and more)
  - Tagging contacts, for reaching specific groups of people
  - Scheduling emails to be sent at a specific time, including specific intervals
  - Dark / light mode

## Technologies used
 - Next.js
 - TypeScript
 - Prisma (PostgresDB)
 - React-Query
 - TRPC (for internal API)
 - MUI
 - NextAuth
 - Zod
 - TailwindCSS

## Running locally
`pnpm build && pnpm dev`

Since free Vercel tier times out serverless functions after 10 seconds, it is not sufficient to send batch of emails. For that reason, [mailmerge-mailsender](https://github.com/klmkyo/mailmerge-mailsender) (ready for use in a Docker container) is required for the email sending functionality (both for local development, and for production). It periodically checks the database for any unsent emails, and sends them when needed.
