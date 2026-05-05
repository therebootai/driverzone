"use client";
import { useState, useCallback, useEffect } from "react";
import {
  FaMapPin,
  FaMapMarkerAlt,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { isPointInPolygon } from "@/utils/geoutils";

interface LocationFormProps {
  data: any;
  onNext: () => void;
  onBack: () => void;
  updateData: (data: any) => void;
}

const LocationSearchInput = ({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (val: any) => void;
  placeholder: string;
  icon: any;
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in`,
      );
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== value) {
        search(query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, search, value]);

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-[10px] font-black text-site-gray uppercase tracking-widest">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-site-gray group-focus-within:text-site-black transition-colors">
          <Icon className="text-sm" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-site-black outline-none transition-all text-sm"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-site-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl mt-1 z-[100] overflow-hidden">
          {results.slice(0, 5).map((r) => (
            <button
              key={r.place_id}
              onClick={() => {
                onChange({
                  address: r.display_name,
                  lat: parseFloat(r.lat),
                  lng: parseFloat(r.lon),
                });
                setResults([]);
                setQuery(r.display_name);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-start gap-3"
            >
              <FaMapMarkerAlt className="mt-1 text-site-gray shrink-0" />
              <span>{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function LocationForm({
  data,
  onNext,
  onBack,
  updateData,
}: LocationFormProps) {
  const [errors, setErrors] = useState<{
    pickup?: string;
    stop?: string;
    drop?: string;
  }>({});

  const validateZones = useCallback(() => {
    const newErrors: { pickup?: string; stop?: string; drop?: string } = {};
    const pkg = data.selectedPackage;

    if (!pkg) return true;

    // Validate Pickup -> service_zone
    if (data.pickup && pkg.service_zone?.coordinates) {
      const isIn = isPointInPolygon(
        [data.pickup.lat, data.pickup.lng],
        pkg.service_zone.coordinates,
      );
      if (!isIn)
        newErrors.pickup =
          "Pickup location is outside the package's service area.";
    }

    // Validate Stop -> drop_zone
    if (data.stop && pkg.drop_zone?.coordinates) {
      const isIn = isPointInPolygon(
        [data.stop.lat, data.stop.lng],
        pkg.drop_zone.coordinates,
      );
      if (!isIn)
        newErrors.stop =
          "Destination (Stop) is outside the package's drop area.";
    }

    // Validate Drop -> drop_zone (only for one-way)
    if (
      data.tripType === "one-way" &&
      data.drop &&
      pkg.drop_zone?.coordinates
    ) {
      const isIn = isPointInPolygon(
        [data.drop.lat, data.drop.lng],
        pkg.drop_zone.coordinates,
      );
      if (!isIn)
        newErrors.drop = "Drop location is outside the package's drop area.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data.pickup, data.stop, data.drop, data.tripType, data.selectedPackage]);

  useEffect(() => {
    validateZones();
  }, [validateZones]);

  const handleContinue = () => {
    if (!data.pickup) return toast.error("Please select a pickup location");
    if (data.tripType === "one-way" && !data.drop)
      return toast.error("Please select a drop location");
    if (data.tripType === "round-trip" && !data.stop)
      return toast.error("Please select a stop/destination location");

    if (!validateZones()) {
      return toast.error("Some locations are outside the service area");
    }

    onNext();
  };

  const isRoundTrip = data.tripType === "round-trip";
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4">
      {/* Trip Type Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => updateData({ tripType: "one-way" })}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            data.tripType === "one-way"
              ? "bg-white text-site-black shadow-sm"
              : "text-site-gray"
          }`}
        >
          One-Way
        </button>
        <button
          onClick={() => updateData({ tripType: "round-trip" })}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            data.tripType === "round-trip"
              ? "bg-white text-site-black shadow-sm"
              : "text-site-gray"
          }`}
        >
          Round-Trip
        </button>
      </div>

      <div className="flex flex-col gap-6 relative">
        {/* Connection line */}
        <div className="absolute left-5.5 top-12 bottom-12 w-0.5 border-l-2 border-dashed border-gray-200" />

        <div className="flex flex-col gap-1">
          <LocationSearchInput
            label="Pickup Point"
            value={data.pickup?.address || ""}
            onChange={(val) => {
              updateData({ pickup: val });
              // For round trip, drop is ALWAYS same as pickup
              if (isRoundTrip) {
                updateData({ drop: val });
              }
            }}
            placeholder="Where should the driver pick you up?"
            icon={FaMapPin}
          />
          {errors.pickup && (
            <p className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase ml-12">
              <FaExclamationTriangle className="text-[8px]" /> {errors.pickup}
            </p>
          )}
        </div>

        {isRoundTrip && (
          <div className="flex flex-col gap-1">
            <LocationSearchInput
              label="Destination (Stop)"
              value={data.stop?.address || ""}
              onChange={(val) => updateData({ stop: val })}
              placeholder="Where is your main destination?"
              icon={FaMapMarkerAlt}
            />
            {errors.stop && (
              <p className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase ml-12">
                <FaExclamationTriangle className="text-[8px]" /> {errors.stop}
              </p>
            )}
          </div>
        )}

        {!isRoundTrip && (
          <div className="flex flex-col gap-1">
            <LocationSearchInput
              label="Drop Point"
              value={data.drop?.address || ""}
              onChange={(val) => updateData({ drop: val })}
              placeholder="Where is your final destination?"
              icon={FaMapMarkerAlt}
            />
            {errors.drop && (
              <p className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase ml-12">
                <FaExclamationTriangle className="text-[8px]" /> {errors.drop}
              </p>
            )}
          </div>
        )}

        {isRoundTrip && data.pickup && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95">
            <FaCheckCircle className="text-site-green shrink-0 text-xs" />
            <p className="text-[10px] font-bold text-site-black uppercase leading-tight">
              Round-trip confirmed: Return drop at{" "}
              <span className="text-blue-600">{data.pickup.address}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-site-black py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={hasErrors}
          className={`flex-[2] py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
            hasErrors
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-site-black text-white hover:bg-opacity-90"
          }`}
        >
          Continue <FaArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}
