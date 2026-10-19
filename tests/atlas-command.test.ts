import { test } from "node:test";
import assert from "node:assert/strict";
import { validateGalaxyPayload, canStartBrowserTts } from "../src/lib/atlas-command/contracts.ts";

const valid = {
  schemaVersion: "0.1" as const, tenantId: "tenant-a", generatedAt: "2026-10-18T18:00:00Z",
  nodes: [
    { id: "project-a", label: "Projeto sintético", group: "projects", version: "1", kind: "project" as const, lifecycle: "published" as const },
    { id: "doc-a", label: "Nota sintética", group: "notes", version: "1", kind: "note" as const, lifecycle: "verified" as const }
  ],
  links: [{ source: "project-a", target: "doc-a", relation: "contains" }]
};

test("galaxy accepts a typed, matching-tenant graph", () => {
  assert.equal(validateGalaxyPayload(valid, "tenant-a"), true);
});
test("galaxy UI rejects wrong tenant and orphaned graph edges", () => {
  assert.equal(validateGalaxyPayload(valid, "tenant-b"), false);
  assert.equal(validateGalaxyPayload({ ...valid, links: [{ source: "project-a", target: "doc-b", relation: "contains" }] }, "tenant-a"), false);
});
test("galaxy UI rejects duplicate ids, malformed dates and invalid states", () => {
  assert.equal(validateGalaxyPayload({ ...valid, nodes: [...valid.nodes, valid.nodes[0]] }, "tenant-a"), false);
  assert.equal(validateGalaxyPayload({ ...valid, generatedAt: "n/a" }, "tenant-a"), false);
  assert.equal(validateGalaxyPayload({ ...valid, nodes: [{...valid.nodes[0], lifecycle: "untrusted" as never}] }, "tenant-a"), false);
});
test("Hermes voice never starts duplicate browser playback", () => {
  assert.equal(canStartBrowserTts("hermes", "speaking"), false);
  assert.equal(canStartBrowserTts("browser", "speaking"), true);
  assert.equal(canStartBrowserTts("browser", "interrupted"), false);
});
