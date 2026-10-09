// Optional Windows/local-development workaround for MongoDB Atlas SRV DNS lookup issues.
// Run with `npm run dev:dns`; this is intentionally NOT enabled in production/Vercel.
const dns = require("node:dns");

try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  console.log("[Bazar Dor] Local DNS workaround enabled (Cloudflare + Google DNS).");
} catch (error) {
  console.warn("[Bazar Dor] Could not configure custom DNS servers:", error?.message || error);
}
