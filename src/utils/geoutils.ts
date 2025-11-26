
// Calculate center point of polygon
function calculateCenter(coordinates: number[][]) {
  let lngSum = 0;
  let latSum = 0;

  coordinates.forEach((coord) => {
    lngSum += coord[0];
    latSum += coord[1];
  });

  return [lngSum / coordinates.length, latSum / coordinates.length];
}

// Check if point is inside polygon using ray casting algorithm
function isPointInPolygon(point: number[], polygon: number[][]) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// Calculate area of polygon (in square meters - approximate)
function calculateArea(coordinates: number[][]) {
  let area = 0;
  const earthRadius = 6371000; // meters

  if (coordinates.length < 3) return 0;

  for (let i = 0; i < coordinates.length; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[(i + 1) % coordinates.length];

    area +=
      (lng2 - lng1) *
      (2 + Math.sin((lat1 * Math.PI) / 180) + Math.sin((lat2 * Math.PI) / 180));
  }

  area = Math.abs((area * earthRadius * earthRadius) / 2);
  return area;
}

export { calculateCenter, isPointInPolygon, calculateArea };
