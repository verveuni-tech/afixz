import { MapPin, X } from "lucide-react";
import { LOCATION_OPTIONS } from "../../lib/locations";
import { useLocationContext } from "../../context/LocationContext";

export default function LocationPickerModal() {
  const {
    selectedLocation,
    setSelectedLocation,
    isPickerOpen,
    closeLocationPicker,
    hydrated,
  } = useLocationContext();

  if (!hydrated || !isPickerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/35 px-4 pb-4 pt-20 sm:items-center sm:p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6 sm:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
              <MapPin size={15} />
              Service area
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Choose your service location
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              We use your selected city to tailor homepage content, filter available services,
              and keep bookings valid for your area.
            </p>
          </div>

          {selectedLocation && (
            <button
              type="button"
              onClick={closeLocationPicker}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close location picker"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8 sm:py-8">
          {LOCATION_OPTIONS.map((location) => {
            const active = selectedLocation === location.id;

            return (
              <button
                key={location.id}
                type="button"
                onClick={() => void setSelectedLocation(location.id)}
                className={`rounded-[28px] border px-5 py-6 text-left transition ${
                  active
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-blue-700">
                  {location.label}
                </span>
                <p className="mt-3 text-base font-semibold text-slate-900">{location.shortLabel}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{location.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
