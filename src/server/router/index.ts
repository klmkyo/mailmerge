// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { emailTemplateRouter } from "./emailTemplate";
import { contactRouter } from "./contact";
import { emailRouter } from "./email";
import { settingsRouter } from "./settings";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("question.", protectedExampleRouter)
  .merge("emailTemplate.", emailTemplateRouter)
  .merge("email.", emailRouter)
  .merge("contact.", contactRouter)
  .merge("settings.", settingsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
