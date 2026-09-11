import {
  haversineDistanceKm,
  calculateBoundingBox,
  parseNearParam,
} from '../../src/common/geo';

describe('Geospatial Utilities Unit Tests', () => {
  describe('haversineDistanceKm', () => {
    it('should calculate distance between Freetown Central and Aberdeen Beach', () => {
      // Freetown (Cotton Tree): 8.4844, -13.2344
      // Aberdeen Beach (Lumley): 8.4912, -13.2875
      const distance = haversineDistanceKm(8.4844, -13.2344, 8.4912, -13.2875);
      expect(distance).toBeGreaterThan(5);
      expect(distance).toBeLessThan(7);
    });

    it('should calculate distance between Freetown and Banana Islands', () => {
      // Freetown: 8.4844, -13.2344
      // Dublin Village, Banana Islands: 8.1214, -13.1368
      const distance = haversineDistanceKm(8.4844, -13.2344, 8.1214, -13.1368);
      expect(distance).toBeGreaterThan(38);
      expect(distance).toBeLessThan(45);
    });

    it('should return 0 for identical coordinates', () => {
      const distance = haversineDistanceKm(8.4844, -13.2344, 8.4844, -13.2344);
      expect(distance).toBe(0);
    });
  });

  describe('calculateBoundingBox', () => {
    it('should calculate valid bounding box around Freetown coordinates', () => {
      const box = calculateBoundingBox(8.4844, -13.2344, 25);
      expect(box.minLat).toBeLessThan(8.4844);
      expect(box.maxLat).toBeGreaterThan(8.4844);
      expect(box.minLon).toBeLessThan(-13.2344);
      expect(box.maxLon).toBeGreaterThan(-13.2344);
    });
  });

  describe('parseNearParam', () => {
    it('should parse valid lat,lng string', () => {
      const parsed = parseNearParam('8.4844,-13.2344');
      expect(parsed).toEqual({
        latitude: 8.4844,
        longitude: -13.2344,
        radiusKm: 50,
      });
    });

    it('should parse valid lat,lng,radiusKm string', () => {
      const parsed = parseNearParam('8.4844,-13.2344,25');
      expect(parsed).toEqual({
        latitude: 8.4844,
        longitude: -13.2344,
        radiusKm: 25,
      });
    });

    it('should return null for invalid strings', () => {
      expect(parseNearParam(undefined)).toBeNull();
      expect(parseNearParam('')).toBeNull();
      expect(parseNearParam('invalid,coords')).toBeNull();
      expect(parseNearParam('95.0,-13.2344')).toBeNull(); // lat out of bounds
    });
  });
});
