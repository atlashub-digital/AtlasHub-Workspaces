import { test } from "node:test";
import assert from "node:assert/strict";
import { isSynthetic } from "../src/lib/access.ts";

test("only demo mode or a Core-flagged sandbox tenant is labelled synthetic", () => {
  assert.equal(isSynthetic("demo", {}), true);
  assert.equal(isSynthetic("api", { sandbox: true }), true);
  assert.equal(isSynthetic("api", { sandbox: false }), false);
  assert.equal(isSynthetic("api", {}), false, "unknown → treated as real, never as disposable test data");
});
