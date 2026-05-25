import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const loginWithPassword = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getAppSession } = await import("./session-impl.server");
    const expected = process.env.APP_PASSWORD;
    if (!expected) throw new Error("APP_PASSWORD not configured");
    // Small artificial delay to slow brute force.
    await new Promise((r) => setTimeout(r, 250));
    if (data.password !== expected) {
      return { ok: false as const };
    }
    const session = await getAppSession();
    await session.update({ authed: true, loggedAt: Date.now() });
    return { ok: true as const };
  });

export const logoutSession = createServerFn({ method: "POST" }).handler(
  async () => {
    const { getAppSession } = await import("./session-impl.server");
    const session = await getAppSession();
    await session.clear();
    return { ok: true as const };
  },
);

export const checkSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getAppSession } = await import("./session-impl.server");
    const session = await getAppSession();
    return { authed: Boolean(session.data?.authed) };
  },
);
