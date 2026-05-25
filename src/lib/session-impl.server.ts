import { useSession } from "@tanstack/react-start/server";

export type AppSession = { authed?: boolean; loggedAt?: number };

export function sessionConfig() {
  let password = process.env.APP_SESSION_SECRET ?? "";
  if (password.length < 32) {
    // Fallback: derive a stable 32+ char password from other server secrets
    // so the app keeps working even if APP_SESSION_SECRET is unset/short.
    const fallback =
      (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "") +
      (process.env.SUPABASE_URL ?? "") +
      (process.env.APP_PASSWORD ?? "");
    password = (password + fallback).padEnd(32, "x");
  }
  return {
    password,
    name: "rma_session",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      path: "/",
    },
  };
}

export async function getAppSession() {
  return useSession<AppSession>(sessionConfig());
}
