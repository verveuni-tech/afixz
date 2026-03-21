import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { isLocationId, LocationId } from "../lib/locations";

type LocationContextValue = {
  selectedLocation: LocationId | null;
  setSelectedLocation: (location: LocationId) => Promise<void>;
  clearSelectedLocation: () => void;
  isPickerOpen: boolean;
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  hydrated: boolean;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);
const STORAGE_KEY = "afixz:selected-location";

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [selectedLocation, setSelectedLocationState] = useState<LocationId | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const profileLocation = (profile as { selectedLocation?: string } | null)?.selectedLocation;

    if (isLocationId(storedValue)) {
      setSelectedLocationState(storedValue);
    } else if (isLocationId(profileLocation)) {
      setSelectedLocationState(profileLocation);
    }

    setHydrated(true);
  }, [profile]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (selectedLocation) {
      window.localStorage.setItem(STORAGE_KEY, selectedLocation);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [hydrated, selectedLocation]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setIsPickerOpen(!selectedLocation);
  }, [hydrated, selectedLocation]);

  const setSelectedLocation = async (location: LocationId) => {
    setSelectedLocationState(location);
    setIsPickerOpen(false);

    if (!user) {
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          selectedLocation: location,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to sync selected location:", error);
    }
  };

  const clearSelectedLocation = () => {
    setSelectedLocationState(null);
  };

  const value = useMemo(
    () => ({
      selectedLocation,
      setSelectedLocation,
      clearSelectedLocation,
      isPickerOpen,
      openLocationPicker: () => setIsPickerOpen(true),
      closeLocationPicker: () => {
        if (selectedLocation) {
          setIsPickerOpen(false);
        }
      },
      hydrated,
    }),
    [hydrated, isPickerOpen, selectedLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocationContext must be used inside LocationProvider");
  }

  return context;
}
