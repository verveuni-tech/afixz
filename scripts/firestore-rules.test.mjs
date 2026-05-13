import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("validService allows the service shortDescription field used by the admin form", () => {
  const rules = readFileSync("firestore.rules", "utf8");
  const validServiceBody = rules.match(/function validService\(data\) \{([\s\S]*?)\n    \}/)?.[1] || "";

  assert.match(validServiceBody, /"shortDescription"/);
  assert.match(validServiceBody, /data\.shortDescription is string/);
});

test("validService tolerates categoryName on services seeded by admin scripts", () => {
  const rules = readFileSync("firestore.rules", "utf8");
  const validServiceBody = rules.match(/function validService\(data\) \{([\s\S]*?)\n    \}/)?.[1] || "";

  assert.match(validServiceBody, /"categoryName"/);
  assert.match(validServiceBody, /optionalString\(data, "categoryName"\)/);
});
