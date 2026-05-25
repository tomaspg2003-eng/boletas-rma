import { createMiddleware } from "@tanstack/react-start";

export type AppSession = { authed?: boolean; loggedAt?: number };

/** Throws 401 if the caller does not have a valid session. */
export const requireAppSession = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { getAppSession } = await import("./session-impl.server");
    const session = await getAppSession();
    if (!session.data?.authed) {
      throw new Error("Unauthorized");
    }
    return next();
  },
);
