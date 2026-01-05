import * as turf from "@turf/turf";

export interface Point {
  longitude: number;
  latitude: number;
}

export interface PolygonCoordinates {
  type: "Polygon";
  coordinates: number[][][];
}

export const isPointInPolygon = (
  point: Point,
  polygonCoordinates: number[][] // Format: [[lng, lat], [lng, lat], ...]
): boolean => {
  try {
    // Create a turf point
    const turfPoint = turf.point([point.longitude, point.latitude]);

    // Create polygon coordinates in GeoJSON format
    // Close the polygon by adding first point at the end if not already closed
    const coordinates = [...polygonCoordinates];
    if (coordinates.length > 0) {
      const firstPoint = coordinates[0];
      const lastPoint = coordinates[coordinates.length - 1];
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        coordinates.push(firstPoint);
      }
    }

    // Create turf polygon
    const turfPolygon = turf.polygon([coordinates]);

    // Check if point is in polygon
    return turf.booleanPointInPolygon(turfPoint, turfPolygon);
  } catch (error) {
    console.error("Error in point-in-polygon check:", error);
    return false;
  }
};
