type Point = {
  lat: number;
  lng: number;
};

export function isPointInPolygon(
  point: Point,
  polygon: unknown,
): boolean {
  if (!Array.isArray(polygon) || polygon.length < 3) {
    return false;
  }

  const points: Point[] = [];

  for (const vertex of polygon) {
    if (
      typeof vertex !== "object" ||
      vertex === null ||
      !("lat" in vertex) ||
      !("lng" in vertex) ||
      typeof vertex.lat !== "number" ||
      typeof vertex.lng !== "number" ||
      !Number.isFinite(vertex.lat) ||
      !Number.isFinite(vertex.lng)
    ) {
      return false;
    }

    points.push({ lat: vertex.lat, lng: vertex.lng });
  }

  let inside = false;

  for (
    let i = 0, j = points.length - 1;
    i < points.length;
    j = i++
  ) {
    const a = points[i]!;
    const b = points[j]!;

    // A point exactly on an edge counts as inside.
    if (isOnSegment(point, a, b)) {
      return true;
    }

    const crosses =
      a.lat > point.lat !== b.lat > point.lat &&
      point.lng <
        ((b.lng - a.lng) * (point.lat - a.lat)) /
          (b.lat - a.lat) +
          a.lng;

    if (crosses) {
      inside = !inside;
    }
  }

  return inside;
}

function isOnSegment(
  point: Point,
  a: Point,
  b: Point,
): boolean {
  const cross =
    (point.lat - a.lat) * (b.lng - a.lng) -
    (point.lng - a.lng) * (b.lat - a.lat);

  const epsilon = 1e-10;

  if (Math.abs(cross) > epsilon) {
    return false;
  }

  return (
    point.lat >= Math.min(a.lat, b.lat) - epsilon &&
    point.lat <= Math.max(a.lat, b.lat) + epsilon &&
    point.lng >= Math.min(a.lng, b.lng) - epsilon &&
    point.lng <= Math.max(a.lng, b.lng) + epsilon
  );
}