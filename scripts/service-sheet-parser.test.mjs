import assert from "node:assert/strict";
import test from "node:test";

import {
  buildServiceSeedRows,
  parseCsv,
  serviceSlug,
  stripLeadingIcon,
} from "./service-sheet-parser.mjs";

test("parseCsv handles quoted commas and empty cells", () => {
  assert.deepEqual(parseCsv('"Service","note, with comma",""\n"Next","","100"'), [
    ["Service", "note, with comma", ""],
    ["Next", "", "100"],
  ]);
});

test("stripLeadingIcon removes sheet icons without damaging service names", () => {
  assert.equal(stripLeadingIcon("🧩 PVC Wall Panel Installation"), "PVC Wall Panel Installation");
  assert.equal(stripLeadingIcon("Bike Service"), "Bike Service");
});

test("serviceSlug produces stable lowercase slugs", () => {
  assert.equal(serviceSlug("PVC Wall Panel Installation"), "pvc-wall-panel-installation");
});

test("buildServiceSeedRows maps only service rows for supported sheets", () => {
  const rows = buildServiceSeedRows({
    "Flying Mechanic Services": [
      ["🔧 2. Flying Mechanic"],
      ["Services Offered:"],
      ["🏍️ Bike Service", "Scope note"],
      ["🔧 Repair", ""],
      ["", ""],
      ["Follow-up Visit", ""],
    ],
    "Interior Services": [
      ["🔧 2. Flying Interior Services"],
      ["Flying Interior offers elegant interior enhancement services for homes and offices."],
      ["Services Offered:"],
      ["🧱 Wallpaper Installation", "Custom pricing"],
    ],
    "Plants Price List": [["Category", "Plant Name", "Plant Price"], ["Flowering", "Rose", "99"]],
  });

  assert.deepEqual(
    rows.map((row) => [row.slug, row.categorySlug, row.price, row.shortDescription]),
    [
      [
        "bike-service",
        "mechanic",
        0,
        "Scope note",
      ],
      [
        "repair",
        "mechanic",
        0,
        "Doorstep mechanic service by AfixZ verified professionals.",
      ],
      [
        "wallpaper-installation",
        "interior",
        0,
        "Custom pricing",
      ],
    ]
  );
});

test("buildServiceSeedRows extracts packed services from merged Google CSV rows", () => {
  const rows = buildServiceSeedRows({
    "Flying Mali Services": [
      [
        "🔧 1. Flying Mali Services Offered: 🌿 Plant Maintenance Subscription 🏡 Home Garden Development 💰 Monthly Billing cycle Features",
        "Gardening charges depend on work scope, design, and complexity.",
      ],
    ],
  });

  assert.deepEqual(
    rows.map((row) => row.slug),
    ["plant-maintenance-subscription", "home-garden-development"]
  );
  assert.equal(rows[0].shortDescription, "Gardening charges depend on work scope, design, and complexity.");
});
