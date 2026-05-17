/**
 * In-memory cache for services and categories.
 * Eliminates redundant Firestore reads when multiple components
 * or repeat visitors request the same data.
 *
 * TTL: 5 minutes. All services fetched once, filtered client-side.
 */

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizeService, type ServiceEntry } from "./services";
import { normalizeCategory, type CategoryEntry } from "./categories";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let servicesCache: CacheEntry<ServiceEntry[]> | null = null;
let categoriesCache: CacheEntry<CategoryEntry[]> | null = null;

// In-flight dedup — prevent multiple simultaneous fetches
let servicesFetchPromise: Promise<ServiceEntry[]> | null = null;
let categoriesFetchPromise: Promise<CategoryEntry[]> | null = null;

function isFresh<T>(cache: CacheEntry<T> | null): cache is CacheEntry<T> {
  return cache !== null && Date.now() - cache.timestamp < CACHE_TTL;
}

export async function getAllServices(): Promise<ServiceEntry[]> {
  // Return cached if fresh
  if (isFresh(servicesCache)) {
    return servicesCache.data;
  }

  // Dedup concurrent calls
  if (servicesFetchPromise) {
    return servicesFetchPromise;
  }

  servicesFetchPromise = (async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "services"), orderBy("createdAt", "desc"))
      );

      const services = snap.docs.map((doc) =>
        normalizeService(doc.id, doc.data() as Record<string, any>)
      );

      servicesCache = { data: services, timestamp: Date.now() };
      return services;
    } finally {
      servicesFetchPromise = null;
    }
  })();

  return servicesFetchPromise;
}

export async function getAllCategories(): Promise<CategoryEntry[]> {
  if (isFresh(categoriesCache)) {
    return categoriesCache.data;
  }

  if (categoriesFetchPromise) {
    return categoriesFetchPromise;
  }

  categoriesFetchPromise = (async () => {
    try {
      const snap = await getDocs(collection(db, "categories"));

      const categories = snap.docs.map((doc) =>
        normalizeCategory(doc.id, doc.data() as Record<string, any>)
      );

      categoriesCache = { data: categories, timestamp: Date.now() };
      return categories;
    } finally {
      categoriesFetchPromise = null;
    }
  })();

  return categoriesFetchPromise;
}

/** Force-refresh on next call (e.g. after admin edits a service) */
export function invalidateServicesCache() {
  servicesCache = null;
}

export function invalidateCategoriesCache() {
  categoriesCache = null;
}

export function invalidateAllCaches() {
  servicesCache = null;
  categoriesCache = null;
}
