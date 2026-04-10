"use client";
import {
  FeatureGroup,
  MapContainer,
  Polygon,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { useEffect, useRef } from "react";

const MapController = ({
  onMapClick,
  center,
  bounds,
}: {
  onMapClick: (latlng: L.LatLng) => void;
  center?: [number, number];
  bounds?: L.LatLngBoundsExpression;
}) => {
  const map = useMap();
  const prevCenterRef = useRef<[number, number] | undefined>(center);
  const prevBoundsRef = useRef<string | undefined>(undefined);

  useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng);
    },
  });

  useEffect(() => {
    if (bounds) {
      const boundsStr = JSON.stringify(bounds);
      if (prevBoundsRef.current !== boundsStr) {
        map.fitBounds(bounds);
        prevBoundsRef.current = boundsStr;
      }
    } else if (
      center &&
      (!prevCenterRef.current ||
        center[0] !== prevCenterRef.current[0] ||
        center[1] !== prevCenterRef.current[1])
    ) {
      map.setView([center[0], center[1]], map.getZoom());
      prevCenterRef.current = center;
    }
  }, [center, bounds, map]);

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
  const handleCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const coordinates = layer
        .getLatLngs()[0]
        .map((latLng: L.LatLng) => [latLng.lng, latLng.lat]);

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

          if (latLngs.length > 0) {
            if (latLngs[0] instanceof L.LatLng) {
              coordinates = (latLngs as L.LatLng[]).map((latLng: L.LatLng) => [
                latLng.lng,
                latLng.lat,
              ]);
            } else if (Array.isArray(latLngs[0])) {
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

  const bounds =
    existingZones && existingZones.length > 0
      ? L.latLngBounds(existingZones.map((coord) => [coord[1], coord[0]]))
      : undefined;

  return (
    <div style={{ height: "500px", width: "100%" }} className="relative">
      <MapContainer
        center={defaultCenter}
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
          center={defaultCenter}
          bounds={bounds?.isValid() ? bounds : undefined}
          onMapClick={(latlng) => console.log("Map clicked:", latlng)}
        />
      </MapContainer>
    </div>
  );
};

export default ZoneMap;
