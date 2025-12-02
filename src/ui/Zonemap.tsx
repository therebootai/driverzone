"use client";

import { ZoneDocument } from "@/models/Zones";
import { useState } from "react";
import {
  FeatureGroup,
  MapContainer,
  Polygon,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

const MapController = ({
  onMapClick,
}: {
  onMapClick: (latlng: L.LatLng) => void;
}) => {
  useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const ZoneMap = ({
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  existingZones = [],
  defaultCenter = [26.7271, 88.3953],
}: {
  onZoneCreate: (coord: number[][]) => void;
  onZoneUpdate: (zoneData: { coordinates: number[][] }) => void;
  onZoneDelete: (zoneId: number) => void;
  existingZones?: ZoneDocument[];
  defaultCenter?: [number, number];
}) => {
  const [zones, setZones] = useState(existingZones);

  const handleCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const coordinates = layer
        .getLatLngs()[0]
        .map((latLng: L.LatLng) => [latLng.lng, latLng.lat]);

      const newZone = {
        id: layer._leaflet_id,
        name: `Zone ${zones.length + 1}`,
        coordinates: coordinates,
        color: "#3388ff",
      };

      setZones((prev) => [...prev, newZone]);
      onZoneCreate(newZone.coordinates);
    }
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        const coordinates = layer
          .getLatLngs()[0]
          .map((latLng: L.LatLng) => [latLng.lng, latLng.lat]);

        const updatedZone = {
          id: layer?._leaflet_id,
          coordinates: coordinates,
        };

        onZoneUpdate(updatedZone.coordinates);
      }
    });
  };

  const handleDeleted = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: L.Layer) => {
      onZoneDelete(layer?._leaflet_id);
    });
  };

  return (
    <div style={{ height: "500px", width: "100%" }} className="relative">
      <MapContainer
        center={[defaultCenter[0], defaultCenter[1]]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: "#e1e100",
                  message:
                    "<strong>Error:</strong> Polygon edges cannot cross!",
                },
                shapeOptions: {
                  color: "#3388ff",
                },
              },
            }}
          />
        </FeatureGroup>

        {/* Render existing zones */}
        {zones.map((zone, index) => (
          <Polygon
            key={zone.id || index}
            positions={zone?.coordinates?.map((coord) => [coord[1], coord[0]])}
            pathOptions={{ color: "#3388ff" }}
          />
        ))}

        <MapController
          onMapClick={(latlng) => console.log("Map clicked:", latlng)}
        />
      </MapContainer>
    </div>
  );
};

export default ZoneMap;
