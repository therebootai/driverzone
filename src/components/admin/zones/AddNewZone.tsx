"use client";

import { CREATEZONE } from "@/actions/zoneActions";
import { useGeolocation } from "@/hooks/useGeolocation";
import BasicInput from "@/ui/BasicInput";
import dynamic from "next/dynamic";
import { useActionState, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { CiLocationOn } from "react-icons/ci";

const ZoneMap = dynamic(() => import("@/ui/Zonemap"), { ssr: false });

export default function AddNewZone() {
  const [centerCoordinates, setCenterCoordinates] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 26.7271,
    lng: 88.3953,
  });

  const [coordinates, setCoordinates] = useState<number[][]>([[]]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);  const handleZoneCreate = (coord: any) => {
    setCoordinates(coord);
  };

  const handleZoneUpdate = (coord: any) => {
    setCoordinates(coord);
  };

  const { getCoordinates } = useGeolocation();

  const handleGetLocation = async () => {
    try {
      const coords = await getCoordinates();
      setCenterCoordinates({ lat: coords.lat, lng: coords.lng });
      console.log("Coordinates:", coords);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [searchQuery, handleSearch]);

  const handleSaveZone = async (prevState: any, formData: FormData) => {
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      if (!name || name.trim() === "") {
        toast.error("Zone name is required");
        return;
      }

      if (!coordinates || coordinates.length < 3) {
        toast.error(
          "A zone must have at least 3 coordinates to form a polygon"
        );
        return;
      }

      await CREATEZONE({
        name,
        description,
        coordinates,
      });
      toast.success("Zone created successfully");
    } catch (error: any) {
      console.error("Error saving zone:", error);
      toast.error(`Error saving zone: ${error.message}`);
    }
  };

  const [state, formAction, isPending] = useActionState(handleSaveZone, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <BasicInput placeholder="Zone Name" name="name" type="text" />
      <BasicInput
        placeholder="Zone Description"
        name="description"
        type="text"
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative gap-4">
          <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">Zone Map</h2>
          
          {/* Location Search Box */}
          <div className="flex-1 max-w-md w-full relative z-[1000]">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search area for zone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <ul className="absolute w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1 left-0 top-full" style={{ zIndex: 1000 }}>
                {searchResults.map((result: any) => (
                  <li
                    key={result.place_id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b last:border-b-0"
                    onClick={() => {
                      setCenterCoordinates({ 
                        lat: Number(result.lat), 
                        lng: Number(result.lon) 
                      });
                      setSearchResults([]);
                      setSearchQuery(result.display_name);
                    }}
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex space-x-3 whitespace-nowrap shrink-0">
            <button
              type="button"
              onClick={handleGetLocation}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 gap-2"
            >
              <CiLocationOn />
              Check Location
            </button>
          </div>
        </div>

        <ZoneMap
          onZoneCreate={handleZoneCreate}
          onZoneUpdate={handleZoneUpdate}
          defaultCenter={[
            Number(centerCoordinates?.lat),
            Number(centerCoordinates?.lng),
          ]}
        />

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            How to create zones:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Click the polygon tool in the top-right of the map
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Click on the map to create points for your zone
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Double-click or click the first point to complete the zone
            </li>
          </ul>
        </div>
      </div>
      <button
        type="submit"
        className="text-site-black bg-linear-90 from-site-saffron to-site-skin py-2 px-6 self-start rounded font-medium"
      >
        {isPending ? "Wait" : "Submit"}
      </button>
    </form>
  );
}
