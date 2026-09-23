#!/usr/bin/env node
// Deploys this Make custom app through Make's SDK Apps API. Idempotent:
// creates what is missing and overwrites every section.
//   MAKE_API_TOKEN=... MAKE_ZONE=us1.make.com node deploy.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const TOKEN = process.env.MAKE_API_TOKEN;
const ZONE = process.env.MAKE_ZONE || "us1.make.com";
if (!TOKEN) throw new Error("MAKE_API_TOKEN is required (Make profile, API access, scopes sdk-apps:read and sdk-apps:write)");
const ROOT = new URL(".", import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const app = read("app.json");
const V = app.version;

async function call(method, path, body, contentType = "application/json") {
  const res = await fetch(`https://${ZONE}/api/v2${path}`, {
    method,
    headers: { Authorization: `Token ${TOKEN}`, "Content-Type": contentType },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
  try { return JSON.parse(text); } catch { return text; }
}
const tryCall = (...a) => call(...a).catch((e) => { console.log("  skip:", e.message.slice(0, 120)); });

console.log(`Deploying ${app.name} v${V} to ${ZONE}`);
// 1. App
const existing = await call("GET", "/sdk/apps?all=true").catch(() => ({ apps: [] }));
if (!(existing.apps || []).some((a) => a.name === app.name)) {
  await call("POST", "/sdk/apps", { app: { name: app.name, label: app.label, description: app.description, version: V, theme: app.theme, language: app.language, countries: app.countries, beta: app.beta } });
  console.log("created app");
}
await call("POST", `/sdk/apps/${app.name}/${V}/base`, read("base.json"));
console.log("base set");
// 2. Connection (name defaults to the app name on first create)
const connName = app.name;
const conns = await call("GET", `/sdk/apps/${app.name}/connections`).catch(() => ({ appConnections: [] }));
if (!(conns.appConnections || []).some((c) => c.name === connName)) {
  await call("POST", `/sdk/apps/${app.name}/connections`, read("connection/meta.json"));
  console.log("created connection");
}
await call("PUT", `/sdk/apps/connections/${connName}/api`, read("connection/api.json"));
await call("PUT", `/sdk/apps/connections/${connName}/parameters`, read("connection/parameters.json"));
console.log("connection sections set");
// 3. Webhook
const hookName = app.name;
const hooks = await call("GET", `/sdk/apps/${app.name}/webhooks`).catch(() => ({ appWebhooks: [] }));
if (!(hooks.appWebhooks || []).some((w) => w.name === hookName)) {
  await call("POST", `/sdk/apps/${app.name}/webhooks`, read("webhook/meta.json"));
  console.log("created webhook");
}
for (const s of ["api", "parameters", "attach", "detach"]) {
  await call("PUT", `/sdk/apps/webhooks/${hookName}/${s}`, { output: JSON.stringify(read(`webhook/${s}.json`)) });
}
console.log("webhook sections set");
// 4. Modules
const mods = await call("GET", `/sdk/apps/${app.name}/${V}/modules`).catch(() => ({ appModules: [] }));
const have = new Set((mods.appModules || []).map((m) => m.name));
for (const name of readdirSync(join(ROOT, "modules"))) {
  const meta = read(`modules/${name}/meta.json`);
  if (!have.has(name)) {
    await call("POST", `/sdk/apps/${app.name}/${V}/modules`, { name, typeId: meta.typeId, label: meta.label, description: meta.description, connection: meta.connection, ...(meta.webhook ? { webhook: meta.webhook } : {}) });
    console.log("created module", name);
  } else {
    await tryCall("PATCH", `/sdk/apps/${app.name}/${V}/modules/${name}`, { label: meta.label, description: meta.description, connection: meta.connection });
  }
  for (const s of ["api", "epoch", "parameters", "expect", "interface", "samples"]) {
    const p = `modules/${name}/${s}.json`;
    if (existsSync(join(ROOT, p))) await call("PUT", `/sdk/apps/${app.name}/${V}/modules/${name}/${s}`, read(p));
  }
  console.log("module sections set", name);
}
await call("PUT", `/sdk/apps/${app.name}/${V}/groups`, read("groups.json"));
await call("PUT", `/sdk/apps/${app.name}/${V}/readme`, readFileSync(join(ROOT, "README.md"), "utf8"), "text/markdown");
if (existsSync(join(ROOT, "icon.png"))) {
  await fetch(`https://${ZONE}/api/v2/sdk/apps/${app.name}/${V}/icon`, { method: "PUT", headers: { Authorization: `Token ${TOKEN}`, "Content-Type": "image/png" }, body: readFileSync(join(ROOT, "icon.png")) });
}
console.log("done. Next: test a scenario in Make, then POST /sdk/apps/" + app.name + "/" + V + "/review to request the public listing.");
