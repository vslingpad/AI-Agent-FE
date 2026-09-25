/**
 * Add blocked email domains to a Clerk instance so they cannot sign in.
 *
 * Does not read .env, .env.local, or CLERK_SECRET_KEY.
 * Paste each secret below, or pass it when you run the script.
 *
 *   CLERK_SECRET_DEV=sk_test_... npm run clerk:block-domains -- --target dev
 *   CLERK_SECRET_PROD=sk_live_... npm run clerk:block-domains -- --target prod
 *   CLERK_SECRET_DEV=sk_test_... CLERK_SECRET_PROD=sk_live_... npm run clerk:block-domains -- --target both
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CLERK_SECRET_DEV = "";
const CLERK_SECRET_PROD = "";

const API_BASE = "https://api.clerk.com/v1";
const PAGE_SIZE = 100;
const CONCURRENCY = 5;

const domains = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "clerk-blocked-sign-in-domains.json"), "utf8"),
);

function log(message) {
  console.log(`[clerk-blocklist] ${message}`);
}

function parseTarget(argv) {
  const index = argv.indexOf("--target");
  const target = index === -1 ? "" : argv[index + 1];
  if (target !== "dev" && target !== "prod" && target !== "both") {
    throw new Error("Pass --target dev, --target prod, or --target both");
  }
  return target === "both" ? ["dev", "prod"] : [target];
}

function secretFor(target) {
  if (target === "dev") return CLERK_SECRET_DEV || process.env.CLERK_SECRET_DEV || "";
  return CLERK_SECRET_PROD || process.env.CLERK_SECRET_PROD || "";
}

async function clerk(secret, path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  return { ok: response.ok, status: response.status, body };
}

function errorText(body) {
  return JSON.stringify(body);
}

function isDuplicate(status, body) {
  const text = errorText(body).toLowerCase();
  return status === 409 || status === 422 || text.includes("already") || text.includes("duplicate") || text.includes("exists");
}

async function enableBlocklistForSignIn(secret, target) {
  const payload = { blocklist: true, allowlist_blocklist_disabled_on_sign_in: false };
  const result = await clerk(secret, "/instance/restrictions", { method: "PATCH", body: JSON.stringify(payload) });
  if (result.ok) {
    log(`target=${target} action=enable-blocklist status=ok blocklist=true apply_to_sign_in=true`);
    return;
  }
  const fallback = await clerk(secret, "/instance/restrictions", {
    method: "PATCH",
    body: JSON.stringify({ blocklist: true }),
  });
  if (!fallback.ok) {
    throw new Error(`target=${target} action=enable-blocklist status=${fallback.status} body=${errorText(fallback.body)}`);
  }
  log(`target=${target} action=enable-blocklist status=ok blocklist=true sign_in_flag_rejected=${result.status}`);
}

async function listBlocked(secret) {
  const identifiers = new Set();
  let offset = 0;
  while (true) {
    const result = await clerk(secret, `/blocklist_identifiers?limit=${PAGE_SIZE}&offset=${offset}`);
    if (!result.ok) {
      throw new Error(`action=list status=${result.status} body=${errorText(result.body)}`);
    }
    const rows = Array.isArray(result.body) ? result.body : (result.body?.data ?? []);
    for (const row of rows) {
      if (row?.identifier) identifiers.add(String(row.identifier).toLowerCase());
    }
    const total = result.body?.total_count;
    offset += rows.length;
    if (rows.length === 0 || rows.length < PAGE_SIZE || (typeof total === "number" && offset >= total)) break;
  }
  return identifiers;
}

async function createIdentifier(secret, target, identifier) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const result = await clerk(secret, "/blocklist_identifiers", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
    if (result.ok) {
      log(`target=${target} action=create identifier=${identifier} status=created`);
      return "created";
    }
    if (isDuplicate(result.status, result.body)) {
      log(`target=${target} action=create identifier=${identifier} status=skipped`);
      return "skipped";
    }
    if (result.status === 429 && attempt < 5) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      continue;
    }
    log(`target=${target} action=create identifier=${identifier} status=failed http=${result.status} body=${errorText(result.body)}`);
    return "failed";
  }
  return "failed";
}

async function runTarget(target) {
  const secret = secretFor(target);
  if (!secret) {
    throw new Error(`target=${target} missing secret. Set CLERK_SECRET_${target.toUpperCase()} in the script or pass it in the shell.`);
  }
  await enableBlocklistForSignIn(secret, target);
  const existing = await listBlocked(secret);
  const pending = domains.filter((identifier) => !existing.has(identifier.toLowerCase()));
  log(`target=${target} action=plan total=${domains.length} existing=${domains.length - pending.length} pending=${pending.length}`);
  const counts = { created: 0, skipped: domains.length - pending.length, failed: 0 };
  for (let index = 0; index < pending.length; index += CONCURRENCY) {
    const batch = pending.slice(index, index + CONCURRENCY);
    const results = await Promise.all(batch.map((identifier) => createIdentifier(secret, target, identifier)));
    for (const result of results) counts[result] += 1;
  }
  log(`target=${target} action=done created=${counts.created} skipped=${counts.skipped} failed=${counts.failed}`);
  if (counts.failed > 0) process.exitCode = 1;
}

const targets = parseTarget(process.argv.slice(2));
for (const target of targets) {
  await runTarget(target);
}
