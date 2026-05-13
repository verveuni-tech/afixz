import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

import { SERVICE_SHEETS, buildServiceSeedRows, parseCsv } from "./service-sheet-parser.mjs";

const SPREADSHEET_ID = "1fbGoxg5rborJt_pnIcilHl3oeOSuYgjckyiPDUFV1lo";
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "afixz-fdac8";

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  const rowsBySheet = await fetchSheetRows();
  const serviceRows = buildServiceSeedRows(rowsBySheet);

  if (isDryRun) {
    printSummary(serviceRows);
    return;
  }

  const db = getFirestore(initializeFirebaseAdmin());
  const categoryIds = await upsertCategories(db);
  await upsertServices(db, serviceRows, categoryIds);
  printSummary(serviceRows);
}

async function fetchSheetRows() {
  const entries = await Promise.all(
    SERVICE_SHEETS.map(async ({ sheetName }) => {
      const url = new URL(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`
      );
      url.searchParams.set("tqx", "out:csv");
      url.searchParams.set("sheet", sheetName);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sheetName}: ${response.status} ${response.statusText}`);
      }

      return [sheetName, parseCsv(await response.text())];
    })
  );

  return Object.fromEntries(entries);
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = readServiceAccount();
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || PROJECT_ID,
    });
  }

  return initializeApp({ projectId: PROJECT_ID });
}

function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return parseServiceAccountValue(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
    );
  }

  return null;
}

function parseServiceAccountValue(value) {
  const trimmed = value.trim();

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const filePath = isAbsolute(trimmed) ? trimmed : resolve(trimmed);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

async function upsertCategories(db) {
  const categoryIds = new Map();

  for (const { categoryName, categorySlug } of SERVICE_SHEETS) {
    const existing = await db
      .collection("categories")
      .where("slug", "==", categorySlug)
      .limit(1)
      .get();

    const categoryRef = existing.empty
      ? db.collection("categories").doc(categorySlug)
      : existing.docs[0].ref;

    await categoryRef.set(
      {
        name: categoryName,
        slug: categorySlug,
        createdAt: existing.empty
          ? FieldValue.serverTimestamp()
          : existing.docs[0].data().createdAt || FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    categoryIds.set(categorySlug, categoryRef.id);
  }

  return categoryIds;
}

async function upsertServices(db, serviceRows, categoryIds) {
  const batch = db.batch();

  serviceRows.forEach((service) => {
    const docId = `${service.categorySlug}-${service.slug}`;
    const ref = db.collection("services").doc(docId);
    const now = FieldValue.serverTimestamp();
    const categoryId = categoryIds.get(service.categorySlug) || service.categorySlug;

    batch.set(
      ref,
      {
        ...servicePayload(service),
        categoryId,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  });

  await batch.commit();
}

function servicePayload(service) {
  const { categoryName, ...payload } = service;
  return payload;
}

function printSummary(serviceRows) {
  const counts = serviceRows.reduce((accumulator, service) => {
    accumulator[service.categorySlug] = (accumulator[service.categorySlug] || 0) + 1;
    return accumulator;
  }, {});

  console.log(`Prepared ${serviceRows.length} services from Google Sheets.`);
  Object.entries(counts).forEach(([categorySlug, count]) => {
    console.log(`- ${categorySlug}: ${count}`);
  });
}

main().catch((error) => {
  if (/default credentials/i.test(error.message)) {
    console.error(
      "Firebase Admin credentials were not found. Set FIREBASE_SERVICE_ACCOUNT_KEY to the service account JSON, set FIREBASE_SERVICE_ACCOUNT_BASE64 to its base64 value, or configure GOOGLE_APPLICATION_CREDENTIALS before running this seed."
    );
  }
  console.error(error.message);
  process.exitCode = 1;
});
