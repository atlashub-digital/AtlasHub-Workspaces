import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveMode } from "../src/lib/mode.ts";

const api = { CORE_MODE: "api", CORE_API_URL: "https://core.example.test", SUPABASE_URL: "https://auth.example.test", SUPABASE_PUBLISHABLE_KEY: "pk" };

test("nothing configured means off, never demo", () => {
  assert.equal(resolveMode({}), "off");
  assert.equal(resolveMode({ CORE_MODE: "anything" }), "off");
});

test("demo personas never reach Vercel production", () => {
  assert.equal(resolveMode({ CORE_MODE: "demo" }), "demo");
  assert.equal(resolveMode({ CORE_MODE: "demo", VERCEL_ENV: "preview" }), "demo");
  assert.equal(resolveMode({ CORE_MODE: "demo", VERCEL_ENV: "production" }), "off");
});

test("api needs an https Core and a configured Supabase project", () => {
  assert.equal(resolveMode(api), "api");
  assert.equal(resolveMode({ ...api, CORE_API_URL: "http://10.0.0.5:4000" }), "off");
  assert.equal(resolveMode({ ...api, CORE_API_URL: "http://127.0.0.1:4000" }), "api");
  assert.equal(resolveMode({ ...api, SUPABASE_PUBLISHABLE_KEY: "" }), "off");
  assert.equal(resolveMode({ ...api, CORE_API_URL: "not a url" }), "off");
});
