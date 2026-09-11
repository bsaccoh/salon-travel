export interface GeoNearFilter {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

/**
 * Parse `near` parameter formatted as `latitude,longitude,radiusKm`
 * e.g., "8.4657,-13.2317,25"
 */
export function parseNearParam(nearStr?: string): GeoNearFilter | null {
  if (!nearStr) return null;

  const parts = nearStr.split(',').map((p) => parseFloat(p.trim()));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return null;
  }

  const latitude = parts[0];
  const longitude = parts[1];
  const radiusKm = parts.length >= 3 && !isNaN(parts[2]) && parts[2] > 0 ? parts[2] : 50; // Default 50km

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude, radiusKm };
}

/**
 * Haversine formula to compute great-circle distance between two points in km.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
