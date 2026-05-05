import * as turf from "@turf/turf";

/**
 * Calculates the center of a polygon.
 * @param coordinates [[longitude, latitude], ...]
 */
export const calculateCenter = (coordinates: number[][]): [number, number] => {
  try {
    // Ensure the polygon is closed for Turf
    const coords = [...coordinates];
    if (coords.length > 0) {
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push(first);
      }
    }
    const polygon = turf.polygon([coords]);
    const center = turf.centerOfMass(polygon);
    return center.geometry.coordinates as [number, number];
  } catch (error) {
    console.error("Error calculating center:", error);
    return [0, 0];
  }
};

/**
 * Calculates the area of a polygon in square meters.
 * @param coordinates [[longitude, latitude], ...]
 */
export const calculateArea = (coordinates: number[][]): number => {
  try {
    const coords = [...coordinates];
    if (coords.length > 0) {
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push(first);
      }
    }
    const polygon = turf.polygon([coords]);
    return turf.area(polygon);
  } catch (error) {
    console.error("Error calculating area:", error);
    return 0;
  }
};

/**
 * Ray-casting algorithm to check if a point is inside a polygon.
 * @param point [latitude, longitude]
 * @param polygon [[longitude, latitude], ...] - MongoDB GeoJSON format
 */
export function isPointInPolygon(point: [number, number], polygon: number[][]) {
  const x = point[0]; // latitude
  const y = point[1]; // longitude

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1]; // latitude
    const yi = polygon[i][0]; // longitude
    const xj = polygon[j][1]; // latitude
    const yj = polygon[j][0]; // longitude

    const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
