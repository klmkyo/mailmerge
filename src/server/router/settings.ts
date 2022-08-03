import { TRPCError } from "@trpc/server";
import { createProtectedRouter } from "./protected-router";
import { emailOAuthUrl } from "../../utils/google";


// Example router with queries that can only be hit if the user requesting is signed in
export const settingsRouter = createProtectedRouter()
  .query("update-auth", {
    resolve() {
      return {
        url: emailOAuthUrl,
      };
    }
  });
