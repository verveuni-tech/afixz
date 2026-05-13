export const SERVICE_SHEETS = [
  {
    sheetName: "Flying Mali Services",
    categoryName: "Garden and Landscaping",
    categorySlug: "garden-and-landscaping",
    fallbackDescription:
      "Garden and landscaping service by AfixZ verified professionals.",
    warranty: "Consultation-based scope",
  },
  {
    sheetName: "Flying Mechanic Services",
    categoryName: "Mechanic",
    categorySlug: "mechanic",
    fallbackDescription: "Doorstep mechanic service by AfixZ verified professionals.",
    warranty: "Inspection-based warranty",
  },
  {
    sheetName: "Fabrication Services",
    categoryName: "Fabrication",
    categorySlug: "fabrication",
    fallbackDescription: "Custom fabrication service by AfixZ verified professionals.",
    warranty: "Scope-based warranty",
  },
  {
    sheetName: "Interior Services",
    categoryName: "Interior",
    categorySlug: "interior",
    fallbackDescription: "Interior enhancement service by AfixZ verified professionals.",
    warranty: "Scope-based warranty",
  },
];

const SKIP_PATTERNS = [
  /^services offered:?$/i,
  /^features$/i,
  /^visits$/i,
  /^plant coverage$/i,
  /^pruning$/i,
  /^soil care$/i,
  /^monitoring$/i,
  /^half-yearly/i,
  /^monthly billing cycle$/i,
  /^switch to /i,
  /^ideal for/i,
  /^subscribe/i,
  /^general/i,
  /^core plant care/i,
];

export function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

export function stripLeadingIcon(value) {
  return String(value || "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function serviceSlug(title) {
  return stripLeadingIcon(title)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSearchKeywords(values) {
  const keywords = new Set();

  values
    .map((value) => String(value || "").toLowerCase().trim())
    .filter(Boolean)
    .forEach((value) => {
      value.split(/\s+/).forEach((word) => {
        let prefix = "";
        for (const char of word) {
          prefix += char;
          keywords.add(prefix);
        }
        keywords.add(word);
      });
    });

  return Array.from(keywords);
}

export function buildServiceSeedRows(rowsBySheet) {
  return SERVICE_SHEETS.flatMap((sheetConfig) => {
    const rows = getOfferedServiceRows(rowsBySheet[sheetConfig.sheetName] || []);
    return rows
      .map((row) => buildServiceSeedRow(row, sheetConfig))
      .filter(Boolean);
  });
}

function getOfferedServiceRows(rows) {
  const serviceRows = [];
  let insideServices = false;

  for (const row of rows) {
    const title = stripLeadingIcon(row[0]);

    if (!insideServices) {
      insideServices = /^services offered:?$/i.test(title);
      continue;
    }

    if (!title) {
      break;
    }

    serviceRows.push(row);
  }

  return serviceRows.length > 0 ? serviceRows : getPackedServiceRows(rows);
}

function getPackedServiceRows(rows) {
  for (const row of rows) {
    const firstCell = String(row[0] || "");
    const markerIndex = firstCell.toLowerCase().indexOf("services offered:");

    if (markerIndex === -1) {
      continue;
    }

    const afterMarker = firstCell.slice(markerIndex + "services offered:".length);
    const offeredText = afterMarker
      .split(/monthly billing cycle|features/i)[0]
      .trim();

    return offeredText
      .split(/(?=[\u{1F300}-\u{1FAFF}\u2600-\u27BF])/gu)
      .map((title) => stripLeadingIcon(title))
      .filter(Boolean)
      .map((title) => [title, row[1] || ""]);
  }

  return [];
}

function buildServiceSeedRow(row, sheetConfig) {
  const title = stripLeadingIcon(row[0]);

  if (!title || shouldSkipTitle(title)) {
    return null;
  }

  const slug = serviceSlug(title);
  if (!slug) {
    return null;
  }

  const note = String(row[1] || "").trim();
  const shortDescription = note || sheetConfig.fallbackDescription;
  const overview = [
    shortDescription,
    `${title} is available under AfixZ ${sheetConfig.categoryName} services.`,
    "Final pricing may vary based on site inspection, material needs, design, and work complexity.",
  ].join(" ");

  return {
    title,
    slug,
    price: extractStartingPrice(row) || 0,
    duration: "On inspection",
    warranty: sheetConfig.warranty,
    professionals: "Verified",
    overview,
    shortDescription,
    included: [
      "Initial requirement review",
      "Work scope confirmation",
      "Execution by verified professionals",
      "Post-service support guidance",
    ],
    images: [],
    categorySlug: sheetConfig.categorySlug,
    categoryName: sheetConfig.categoryName,
    searchKeywords: generateSearchKeywords([
      title,
      sheetConfig.categoryName,
      sheetConfig.categorySlug,
      shortDescription,
    ]),
    rating: 0,
    reviewCount: 0,
    isRecommended: false,
    availableLocations: ["delhi", "noida", "gurgaon"],
    contentByLocation: {},
    priceByLocation: {},
  };
}

function shouldSkipTitle(title) {
  return SKIP_PATTERNS.some((pattern) => pattern.test(title))
    || /^\d+\.\s*flying /i.test(title)
    || /^flying /i.test(title)
    || /offers .*services/i.test(title);
}

function extractStartingPrice(row) {
  for (const value of row.slice(1)) {
    const match = String(value || "").match(/(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*)/i);
    if (match) {
      return Number(match[1].replace(/,/g, ""));
    }
  }

  return 0;
}
