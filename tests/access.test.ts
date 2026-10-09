import { test } from "node:test";
import assert from "node:assert/strict";
import { activeKeys, approvalStatus, canDecide, modulesFrom, navFor } from "../src/lib/access.ts";
import type { Entitlement } from "../src/lib/contract.ts";

const now = new Date("2026-10-09T12:00:00Z");
const e = (key: string, over: Partial<Entitlement> = {}): Entitlement => ({ key, source: "grant", quantity: null, validFrom: "2026-10-01T00:00:00Z", validUntil: null, status: "active", ...over });

test("only active entitlements inside their window count", () => {
  const keys = activeKeys(
    [
      e("module.ami"),
      e("module.media", { status: "revoked" }),
      e("module.community", { validUntil: "2026-10-09T11:59:59Z" }),
      e("module.workforce", { validFrom: "2026-10-10T00:00:00Z" }),
    ],
    now,
  );
  assert.deepEqual(keys, ["module.ami"]);
});

test("modules come from module.<name>; any mission implies workforce; unknown modules are ignored", () => {
  assert.deepEqual(modulesFrom(["module.ami", "module.unknown", "product.x"]), ["ami"]);
  assert.deepEqual(modulesFrom(["mission.tpl-002-standard"]), ["workforce"]);
  assert.deepEqual(modulesFrom([]), []);
});

test("navigation locks modules without entitlement and adds community only when granted", () => {
  const nav = navFor("pilot-c-sandbox", ["workforce"]);
  assert.equal(nav.find((n) => n.key === "ami")?.locked, true);
  assert.equal(nav.find((n) => n.key === "workforce")?.locked, false);
  assert.equal(nav.some((n) => n.key === "community"), false);
  assert.equal(navFor("t", ["community"]).some((n) => n.key === "community"), true);
  assert.ok(nav.every((n) => n.href.startsWith("/o/pilot-c-sandbox")));
});

test("tenant_user reads only; admins and AtlasHub supervisors can decide (mirrors Core identity write)", () => {
  assert.equal(canDecide("tenant_user"), false);
  assert.equal(canDecide("tenant_admin"), true);
  assert.equal(canDecide("atlas_operator"), true);
});

test("pending approvals past expiresAt are shown as expired", () => {
  assert.equal(approvalStatus({ state: "pending", expiresAt: "2026-10-09T11:00:00Z" }, now), "expired");
  assert.equal(approvalStatus({ state: "pending", expiresAt: "2026-10-09T13:00:00Z" }, now), "pending");
  assert.equal(approvalStatus({ state: "approved", expiresAt: "2026-10-09T11:00:00Z" }, now), "approved");
});
