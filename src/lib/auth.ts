import dns from "node:dns";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { memoryAdapter } from "better-auth/adapters/memory";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

type MemoryDb = Record<string, any[]>;

/** Keep one connection / one dev store alive across hot reloads and serverless invocations. */
const store = globalThis as unknown as {
  __bazarMongoClient?: MongoClient;
  __bazarMemoryDb?: MemoryDb;
};

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const env = process.env;

/**
 * Resolve Better Auth's canonical URL. Vercel can provide VERCEL_URL even when
 * BETTER_AUTH_URL was accidentally entered without a scheme or left pointing at localhost.
 */
function resolveAuthBaseURL(): string {
  const isVercel = Boolean(env.VERCEL);
  const deploymentURL = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  let configured = env.BETTER_AUTH_URL?.trim();

  // A local URL accidentally copied into Vercel must not become the production base URL.
  if (isVercel && (!configured || /^https?:\/\/localhost(?::\d+)?\/?$/i.test(configured))) {
    configured = deploymentURL ? `https://${deploymentURL.trim()}` : undefined;
  }

  if (!configured && deploymentURL) {
    configured = `https://${deploymentURL.trim()}`;
  }

  if (!configured) {
    if (isVercel) {
      throw new Error(
        "[বাজার দর] Missing BETTER_AUTH_URL. Set it to the full deployed URL, for example https://your-project.vercel.app.",
      );
    }
    configured = "http://localhost:3000";
  }

  // Accept a bare domain as a convenience, but always pass Better Auth an absolute URL.
  if (!/^https?:\/\//i.test(configured)) {
    configured = `https://${configured}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(configured);
  } catch {
    throw new Error(
      `[বাজার দর] Invalid BETTER_AUTH_URL. Use a full URL such as https://your-project.vercel.app (received: ${configured}).`,
    );
  }

  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error("[বাজার দর] BETTER_AUTH_URL must use http:// or https:// and include a hostname.");
  }

  if (isVercel && parsed.protocol !== "https:") {
    throw new Error("[বাজার দর] BETTER_AUTH_URL must use https:// on Vercel.");
  }

  return parsed.origin;
}

const authBaseURL = resolveAuthBaseURL();

// Production deployments must use persistent storage and a real signing secret.
const serverless = Boolean(env.VERCEL || env.NETLIFY || env.CF_PAGES);
if (serverless) {
  const missing = ["MONGODB_URI", "BETTER_AUTH_SECRET"].filter((key) => !env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `[বাজার দর] Missing environment variable(s): ${missing.join(", ")}. Add them in your hosting dashboard; see README.md.`,
    );
  }
  if ((env.BETTER_AUTH_SECRET?.trim().length ?? 0) < 32) {
    throw new Error("[বাজার দর] BETTER_AUTH_SECRET must contain at least 32 characters in production.");
  }
}

function createDatabase() {
  const uri = env.MONGODB_URI?.trim();

  if (uri) {
    const client = (store.__bazarMongoClient ??= new MongoClient(uri));
    return mongodbAdapter(client.db(env.MONGODB_DB_NAME?.trim() || "bazardor"));
  }

  console.warn(
    "[বাজার দর] MONGODB_URI is empty - using a temporary in-memory user store. " +
      "Accounts are lost when the server restarts. Set MONGODB_URI in .env.local to keep them.",
  );
  return memoryAdapter((store.__bazarMemoryDb ??= { user: [], session: [], account: [], verification: [] }));
}

const google =
  env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim()
    ? { clientId: env.GOOGLE_CLIENT_ID.trim(), clientSecret: env.GOOGLE_CLIENT_SECRET.trim() }
    : null;
const github =
  env.GITHUB_CLIENT_ID?.trim() && env.GITHUB_CLIENT_SECRET?.trim()
    ? { clientId: env.GITHUB_CLIENT_ID.trim(), clientSecret: env.GITHUB_CLIENT_SECRET.trim() }
    : null;

export const auth = betterAuth({
  appName: "বাজার দর",
  baseURL: authBaseURL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    authBaseURL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(env.VERCEL_URL ? [`https://${env.VERCEL_URL}`] : []),
    ...(env.VERCEL_BRANCH_URL ? [`https://${env.VERCEL_BRANCH_URL}`] : []),
    ...(env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  database: createDatabase(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // After signing up the user is sent to the sign-in page (assignment requirement).
    autoSignIn: false,
  },
  socialProviders: {
    ...(google ? { google } : {}),
    ...(github ? { github } : {}),
  },
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
  },
  hooks: {
    // With autoSignIn off, Better Auth answers a duplicate sign-up with a fake "success"
    // (to avoid revealing which emails exist). The assignment wants a visible error, so we
    // reject duplicates explicitly and the form can show a toast.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const body = ctx.body as { email?: unknown } | undefined;
      const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!email) return;
      const existing = await ctx.context.internalAdapter.findUserByEmail(email);
      if (existing?.user) {
        throw APIError.from("UNPROCESSABLE_ENTITY", {
          code: "USER_ALREADY_EXISTS",
          message: "User already exists. Use another email.",
        });
      }
    }),
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
