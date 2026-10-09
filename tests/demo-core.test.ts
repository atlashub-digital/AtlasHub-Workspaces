import { test } from "node:test";
import assert from "node:assert/strict";
import { CoreError } from "../src/lib/contract.ts";
import { DemoCore } from "../src/lib/core/demo.ts";
import { DEMO_TENANTS, DEMO_USERS, DEPLOYMENTS, PROJECTS } from "../src/lib/core/fixtures.ts";

const now = () => new Date("2026-10-09T12:00:00Z");
const status = async (p: Promise<unknown>) => {
  try {
    await p;
    return 200;
  } catch (e) {
    return e instanceof CoreError ? e.status : 500;
  }
};

test("A/B isolation: a user reaches only tenants where they are a member (403 otherwise)", async () => {
  const a = new DemoCore("demo-admin-a", now);
  assert.equal(await status(a.projects("pilot-a-sandbox")), 200);
  for (const call of [a.projects("pilot-b-sandbox"), a.runs("pilot-b-sandbox"), a.approvals("pilot-c-sandbox"), a.expert("pilot-b-sandbox"), a.entitlements("pilot-c-sandbox"), a.deployments("pilot-b-sandbox")])
    assert.equal(await status(call), 403);
});

test("returned data never belongs to another tenant", async () => {
  const s = new DemoCore("demo-supervisor-1", now);
  for (const t of ["pilot-a-sandbox", "pilot-b-sandbox"]) {
    for (const rows of [await s.projects(t), await s.deployments(t), await s.runs(t), await s.approvals(t)]) assert.ok(rows.every((r) => r.tenantId === t));
  }
  assert.equal(await status(s.projects("pilot-c-sandbox")), 403);
  assert.equal(await status(s.projects("atlas-synthetic-qa")), 403);
});

test("the QA tenant is isolated both ways and only reads", async () => {
  const qa = new DemoCore("demo-qa", now);
  assert.deepEqual((await qa.me()).memberships.map((m) => [m.tenantId, m.role, m.modules]), [["atlas-synthetic-qa", "tenant_user", ["workforce"]]]);
  for (const t of ["pilot-a-sandbox", "pilot-b-sandbox", "pilot-c-sandbox"]) assert.equal(await status(qa.runs(t)), 403);
  for (const u of ["demo-admin-a", "demo-viewer-b", "demo-admin-c", "demo-supervisor-1", "demo-supervisor-2"]) assert.equal(await status(new DemoCore(u, now).runs("atlas-synthetic-qa")), 403);
});

test("unknown session is 401; me lists only own memberships with modules", async () => {
  assert.equal(await status(new DemoCore("nobody", now).me()), 401);
  const me = await new DemoCore("demo-supervisor-1", now).me();
  assert.deepEqual(me.memberships.map((m) => m.tenantId), ["pilot-a-sandbox", "pilot-b-sandbox"]);
  assert.deepEqual(me.memberships.find((m) => m.tenantId === "pilot-b-sandbox")?.modules, ["workforce", "media"]);
});

test("an expired trial does not unlock AMI for tenant C", async () => {
  const ent = await new DemoCore("demo-admin-c", now).entitlements("pilot-c-sandbox");
  assert.deepEqual(ent.modules, ["workforce", "community"]);
});

test("every tenant has exactly one Atlas Expert deployment with no unrestricted capability", async () => {
  for (const t of DEMO_TENANTS) assert.equal(DEPLOYMENTS.filter((d) => d.tenantId === t.id && d.roleId === "ROLE-EXPERT").length, 1);
  const ex = await new DemoCore("demo-admin-a", now).expert("pilot-a-sandbox");
  assert.equal(ex.enabled, true);
  assert.ok(ex.policies.some((p) => p.policy === "forbidden" && /shell/.test(p.tool)));
  assert.ok(ex.policies.filter((p) => p.tool.startsWith("expert.propose") || p.tool === "expert.request_run").every((p) => p.policy === "approval"));
});

test("synthetic data only: test emails, generic pilot names, project deployments exist", () => {
  for (const u of Object.values(DEMO_USERS)) assert.match(u.email, /@example\.test$/);
  for (const t of DEMO_TENANTS) assert.match(t.name, t.kind === "qa" ? /^AtlasHub QA$/ : /^Cliente-piloto [A-Z]$/);
  for (const p of PROJECTS) for (const id of p.deploymentIds) assert.ok(DEPLOYMENTS.some((d) => d.id === id && d.tenantId === p.tenantId));
});
