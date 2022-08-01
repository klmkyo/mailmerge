// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { emailTemplateRouter } from "./emailTemplate";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("question.", protectedExampleRouter)
  .merge("emailTemplate.", emailTemplateRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
