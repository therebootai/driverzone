"use client";
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
  existingZones,
  defaultCenter = [26.7271, 88.3953],
  editable = true,
}: {
  onZoneCreate?: (coord: number[][]) => void;
  onZoneUpdate?: (zoneData: { coordinates: number[][] }) => void;
  onZoneDelete?: (zoneId: number) => void;
  existingZones?: number[][];
  defaultCenter?: [number, number];
  editable?: boolean;
}) => {
  const [zones, setZones] = useState<any>(existingZones);

  const handleCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const coordinates = layer
        .getLatLngs()[0]
        .map((latLng: L.LatLng) => [latLng.lng, latLng.lat]);

      // const newZone = {
      //   id: layer._leaflet_id,
      //   name: `Zone ${zones.length + 1}`,
      //   coordinates: coordinates,
      //   color: "#3388ff",
      // };
      onZoneCreate && onZoneCreate(coordinates);
    }
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        try {
          const latLngs = layer.getLatLngs();
          let coordinates: [number, number][] = [];

          // Extract coordinates based on the polygon type
          if (latLngs.length > 0) {
            if (latLngs[0] instanceof L.LatLng) {
              // Simple polygon
              coordinates = (latLngs as L.LatLng[]).map((latLng: L.LatLng) => [
                latLng.lng,
                latLng.lat,
              ]);
            } else if (Array.isArray(latLngs[0])) {
              // Polygon with holes - take the outer ring (first array)
              const outerRing = latLngs[0] as L.LatLng[];
              coordinates = outerRing.map((latLng: L.LatLng) => [
                latLng.lng,
                latLng.lat,
              ]);
            }
          }

          if (coordinates.length > 0) {
            onZoneUpdate && onZoneUpdate(coordinates as any);
          }
        } catch (error) {
          console.error("Error processing polygon coordinates:", error);
        }
      }
    });
  };

  const handleDeleted = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      onZoneDelete && onZoneDelete(layer?._leaflet_id);
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
          {editable && (
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
          )}
        </FeatureGroup>

        {/* Render existing zones */}
        {existingZones && Array.isArray(existingZones) && (
          <Polygon
            positions={existingZones?.map((coord: number[]) => [
              coord[1],
              coord[0],
            ])}
            pathOptions={{ color: "#3388ff" }}
          />
        )}

        <MapController
          onMapClick={(latlng) => console.log("Map clicked:", latlng)}
        />
      </MapContainer>
    </div>
  );
};

export default ZoneMap;
