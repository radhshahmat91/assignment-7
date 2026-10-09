#!/usr/bin/env node
/**
 * Tiny local stand-in for the Bazar Dor price API, backed by tests/fixtures/*.json
 * (sample data copied from the Figma design). Handy when the real API is down or offline:
 *
 *   npm run mock:api                      # http://127.0.0.1:4010/api/bazardor
 *   API_BASE_URL=http://127.0.0.1:4010/api/bazardor npm run dev
 *
 * Supports the same routes as the real service:
 *   /products   /products?category=chal   /products/:id   /categories   /categories/:slug
 */
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const load = (name) => JSON.parse(readFileSync(fileURLToPath(new URL(`../tests/fixtures/${name}`, import.meta.url)), "utf8"));
const products = load("products.json");
const details = load("product-details.json");
const categories = load("categories.json");

const PREFIX = "/api/bazardor";
const port = Number(process.env.PORT || 4010);
const delay = Number(process.env.MOCK_DELAY_MS || 0);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const send = (status, body) => {
    setTimeout(() => {
      res.writeHead(status, {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*",
      });
      res.end(JSON.stringify(body));
    }, delay);
  };

  if (!url.pathname.startsWith(PREFIX)) return send(404, { error: "not found" });
  const path = url.pathname.slice(PREFIX.length).replace(/\/+$/, "");
  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "products" && parts.length === 1) {
    const category = url.searchParams.get("category");
    return send(200, category ? products.filter((p) => p.category === category) : products);
  }
  if (parts[0] === "products" && parts.length === 2) {
    const item = details[parts[1]];
    return item ? send(200, item) : send(404, { error: "product not found" });
  }
  if (parts[0] === "categories" && parts.length === 1) return send(200, categories);
  if (parts[0] === "categories" && parts.length === 2) {
    const item = categories.find((c) => c.slug === parts[1]);
    return item ? send(200, item) : send(404, { error: "category not found" });
  }
  return send(404, { error: "not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock Bazar Dor API listening on http://127.0.0.1:${port}${PREFIX}`);
});
