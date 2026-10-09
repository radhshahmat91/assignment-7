import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

/** The current session on the server (deduplicated per request). `null` when signed out. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
