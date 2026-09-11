'use client';

import { useState, useCallback } from 'react';

export interface LandmarkPreset {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export const SIERRA_LEONE_PRESETS: LandmarkPreset[] = [
  {
    id: 'freetown-central',
    name: 'Freetown Central',
    region: 'Western Area Urban',
    latitude: 8.4844,
    longitude: -13.2344,
  },
  {
    id: 'aberdeen-lumley',
    name: 'Aberdeen & Lumley Beach',
    region: 'Western Area Coastal',
    latitude: 8.4912,
    longitude: -13.2875,
  },
  {
    id: 'river-no-2',
    name: 'River No. 2 & Tokeh Beach',
    region: 'Peninsula Coast',
    latitude: 8.3305,
    longitude: -13.195,
  },
  {
    id: 'banana-islands',
    name: 'Banana Islands',
    region: 'Southern Peninsula',
    latitude: 8.1214,
    longitude: -13.1368,
  },
  {
    id: 'tacugama',
    name: 'Tacugama Chimpanzee Sanctuary',
    region: 'Rainforest Reserve',
    latitude: 8.4411,
    longitude: -13.1932,
  },
  {
    id: 'tiwai-island',
    name: 'Tiwai Island Wildlife Reserve',
    region: 'Southern Province',
    latitude: 7.55,
    longitude: -11.35,
  },
];

export interface GeolocationState {
  coords: { latitude: number; longitude: number } | null;
  radiusKm: number;
  isLocating: boolean;
  error: string | null;
  selectedPresetId: string | null;
  locationName: string | null;
}

export function useGeolocation(defaultRadiusKm = 50) {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    radiusKm: defaultRadiusKm,
    isLocating: false,
    error: null,
    selectedPresetId: null,
    locationName: null,
  });

  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setState((s) => ({ ...s, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((s) => ({
          ...s,
          isLocating: false,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          selectedPresetId: 'gps',
          locationName: 'My Current Location',
        }));
      },
      (err) => {
        setState((s) => ({
          ...s,
          isLocating: false,
          error: err.message || 'Unable to retrieve your location.',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const selectPreset = useCallback((presetId: string) => {
    const preset = SIERRA_LEONE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setState((s) => ({
      ...s,
      coords: { latitude: preset.latitude, longitude: preset.longitude },
      selectedPresetId: preset.id,
      locationName: preset.name,
      error: null,
    }));
  }, []);

  const setRadiusKm = useCallback((radiusKm: number) => {
    setState((s) => ({ ...s, radiusKm }));
  }, []);

  const clearLocation = useCallback(() => {
    setState((s) => ({
      ...s,
      coords: null,
      selectedPresetId: null,
      locationName: null,
      error: null,
    }));
  }, []);

  const nearParam = state.coords
    ? `${state.coords.latitude},${state.coords.longitude},${state.radiusKm}`
    : undefined;

  return {
    ...state,
    nearParam,
    requestGpsLocation,
    selectPreset,
    setRadiusKm,
    clearLocation,
    presets: SIERRA_LEONE_PRESETS,
  };
}
