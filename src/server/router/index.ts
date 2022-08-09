// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import { contactRouter } from "./contact";
import { emailRouter } from "./email";
import { emailTemplateRouter } from "./emailTemplate";
import { emailVisitRouter } from "./emailVisit";
import { settingsRouter } from "./settings";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("emailTemplate.", emailTemplateRouter)
  .merge("email.", emailRouter)
  .merge("contact.", contactRouter)
  .merge("settings.", settingsRouter)
  .merge("emailVisit.", emailVisitRouter)

// export type definition of API
export type AppRouter = typeof appRouter;
