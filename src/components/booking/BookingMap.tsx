"use client";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Fix for default marker icons in Leaflet with Next.js
const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stopIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapController = ({
  center,
  markers,
}: {
  center: [number, number];
  markers: { lat: number; lng: number }[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView(center, 13);
    }
  }, [markers, center, map]);

  return null;
};

interface BookingMapProps {
  pickup?: { lat: number; lng: number };
  drop?: { lat: number; lng: number };
  stop?: { lat: number; lng: number };
  onMapClick?: (latlng: L.LatLng) => void;
  defaultCenter?: [number, number];
  tripType?: "one-way" | "round-trip";
}

export default function BookingMap({
  pickup,
  drop,
  stop,
  tripType,
  defaultCenter = [26.7271, 88.3953],
}: BookingMapProps) {
  const markers = [pickup, stop, drop].filter(Boolean) as {
    lat: number;
    lng: number;
  }[];

  // Create a clean path: Pickup -> Stop -> Drop
  // If it's a round trip, Drop should ideally be Pickup
  const polylinePositions = [
    pickup ? [pickup.lat, pickup.lng] : null,
    stop ? [stop.lat, stop.lng] : null,
    drop ? [drop.lat, drop.lng] : null,
  ].filter(Boolean) as [number, number][];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>Pickup Point</Popup>
          </Marker>
        )}

        {stop && (
          <Marker position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup>Stop Point</Popup>
          </Marker>
        )}

        {drop && (
          <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
            <Popup>Drop Point</Popup>
          </Marker>
        )}

        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#3b82f6",
              weight: 4,
              opacity: 0.6,
              dashArray: "10, 10",
            }}
          />
        )}

        <MapController center={defaultCenter} markers={markers} />
      </MapContainer>
    </div>
  );
}
