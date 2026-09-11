/**
 * Geospatial utility functions for radius calculations and bounding box queries.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two points on the Earth
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers (rounded to 1 decimal place)
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/**
 * Calculates a bounding box around a center coordinate for a given radius.
 * Used to efficiently filter candidate rows in database indexes.
 *
 * @param lat Center latitude
 * @param lon Center longitude
 * @param radiusKm Radius in kilometers
 */
export function calculateBoundingBox(
  lat: number,
  lon: number,
  radiusKm: number,
): BoundingBox {
  const latDelta = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
  const lonDelta =
    ((radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI)) /
    Math.cos((lat * Math.PI) / 180);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - Math.abs(lonDelta),
    maxLon: lon + Math.abs(lonDelta),
  };
}

export interface NearLocation {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

/**
 * Parses the `near` query parameter formatted as `lat,lng` or `lat,lng,radiusKm`.
 *
 * @param near Near query string
 * @returns Parsed location object or null if invalid/not provided
 */
export function parseNearParam(near?: string): NearLocation | null {
  if (!near) return null;

  const parts = near.split(',').map((p) => p.trim());
  if (parts.length < 2) return null;

  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  const radiusKm = parts[2] ? parseFloat(parts[2]) : 50; // Default 50km radius

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || radiusKm <= 0) {
    return null;
  }

  return { latitude, longitude, radiusKm };
}
