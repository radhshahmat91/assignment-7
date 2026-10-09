import { createAuthClient } from "better-auth/react";

/** Browser-side Better Auth client (same origin, talks to /api/auth/*). */
export const authClient = createAuthClient();
