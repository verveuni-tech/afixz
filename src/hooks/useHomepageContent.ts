import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useLocationContext } from "../context/LocationContext";
import { deepMerge, DeepPartial, mergeBaseWithLocationOverride } from "../lib/locationContent";
import { HomepageContent, homepageFallbackContent } from "../lib/homepageFallbackContent";
import type { LocationId } from "../lib/locations";

type HomepageContentDoc = {
  default?: DeepPartial<HomepageContent>;
  byLocation?: Partial<Record<LocationId, DeepPartial<HomepageContent>>>;
};

export function useHomepageContent() {
  const { selectedLocation } = useLocationContext();
  const [remoteContent, setRemoteContent] = useState<HomepageContentDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHomepageContent() {
      try {
        const snapshot = await getDoc(doc(db, "siteContent", "homepage"));

        if (!active) {
          return;
        }

        setRemoteContent(snapshot.exists() ? (snapshot.data() as HomepageContentDoc) : null);
        setError("");
      } catch (fetchError) {
        console.error(fetchError);
        if (active) {
          setError("We couldn't load managed homepage content. Falling back to defaults.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHomepageContent();

    return () => {
      active = false;
    };
  }, []);

  const baseContent = deepMerge(homepageFallbackContent, remoteContent?.default || {});
  const content = mergeBaseWithLocationOverride(
    baseContent,
    selectedLocation,
    remoteContent?.byLocation || null
  );

  return {
    content,
    loading,
    error,
  };
}
