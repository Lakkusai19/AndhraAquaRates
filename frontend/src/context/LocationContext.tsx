import React, { createContext, useContext, useState, useEffect } from 'react';
import { District, LocationPreference } from '../types';
import { locationsApi } from '../services/api';

interface LocationContextType {
  districts: District[];
  locationPreference: LocationPreference;
  hasExplicitPreference: boolean;
  isPreferenceModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  setPreferredDistrict: (districtId: number | string) => void;
  detectCurrentLocation: () => Promise<{ success: boolean; message?: string }>;
  setRadiusKm: (radius: number) => void;
  isDetecting: boolean;
}

// Default fallback location is West Godavari (Bhimavaram - the aquaculture hub of AP)
const DEFAULT_LOCATION: LocationPreference = {
  districtId: 1,
  districtName: 'West Godavari',
  lat: 16.5449,
  lng: 81.5212,
  radiusKm: 300,
  isAutoDetected: false,
};

const STORAGE_KEY = 'ashp_seller_location_preference';
const HAS_SET_KEY = 'ashp_seller_location_has_set';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Haversine formula in JS for nearest district matching
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
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

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const [hasExplicitPreference, setHasExplicitPreference] = useState<boolean>(() => {
    return localStorage.getItem(HAS_SET_KEY) === 'true';
  });

  const [locationPreference, setLocationPreferenceState] = useState<LocationPreference>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored location preference:', e);
    }
    return DEFAULT_LOCATION;
  });

  // Fetch districts list on mount
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await locationsApi.getDistricts();
        const list = res.data || [];
        setDistricts(list);

        // If stored district id exists, ensure coords are up to date
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const match = list.find((d: District) => d.id === parsed.districtId);
          if (match && (match.latitude !== parsed.lat || match.longitude !== parsed.lng)) {
            const updated = {
              ...parsed,
              districtName: match.name,
              lat: match.latitude || parsed.lat,
              lng: match.longitude || parsed.lng,
            };
            setLocationPreferenceState(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          }
        } else {
          // If no stored pref, find West Godavari in the returned list
          const wg = list.find((d: District) => d.name.toLowerCase().includes('west godavari'));
          if (wg) {
            const defaultPref: LocationPreference = {
              districtId: wg.id,
              districtName: wg.name,
              lat: wg.latitude ?? DEFAULT_LOCATION.lat,
              lng: wg.longitude ?? DEFAULT_LOCATION.lng,
              radiusKm: 300,
              isAutoDetected: false,
            };
            setLocationPreferenceState(defaultPref);
          }
        }
      } catch (err) {
        console.error('Error fetching districts for LocationProvider:', err);
      }
    };
    loadDistricts();
  }, []);

  const setPreferredDistrict = (districtId: number | string) => {
    const numId = Number(districtId);
    const target = districts.find((d) => d.id === numId);
    if (!target) return;

    const newPref: LocationPreference = {
      districtId: target.id,
      districtName: target.name,
      lat: target.latitude ?? null,
      lng: target.longitude ?? null,
      radiusKm: locationPreference.radiusKm || 300,
      isAutoDetected: false,
    };

    setLocationPreferenceState(newPref);
    setHasExplicitPreference(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPref));
    localStorage.setItem(HAS_SET_KEY, 'true');
  };

  const setRadiusKm = (radius: number) => {
    const updated = { ...locationPreference, radiusKm: radius };
    setLocationPreferenceState(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const detectCurrentLocation = async (): Promise<{ success: boolean; message?: string }> => {
    if (!navigator.geolocation) {
      return { success: false, message: 'Geolocation is not supported by your browser.' };
    }

    setIsDetecting(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetecting(false);
          const { latitude, longitude } = position.coords;

          // Find the nearest AP district
          let closest: District | null = null;
          let minDistance = Infinity;

          districts.forEach((d) => {
            if (d.latitude != null && d.longitude != null) {
              const dist = calculateDistanceKm(latitude, longitude, d.latitude, d.longitude);
              if (dist < minDistance) {
                minDistance = dist;
                closest = d;
              }
            }
          });

          const matchedDistrict = closest || districts.find((d) => d.id === DEFAULT_LOCATION.districtId) || {
            id: DEFAULT_LOCATION.districtId,
            name: DEFAULT_LOCATION.districtName,
            latitude: DEFAULT_LOCATION.lat,
            longitude: DEFAULT_LOCATION.lng,
          };

          const newPref: LocationPreference = {
            districtId: matchedDistrict.id,
            districtName: matchedDistrict.name,
            lat: latitude,
            lng: longitude,
            radiusKm: locationPreference.radiusKm || 300,
            isAutoDetected: true,
          };

          setLocationPreferenceState(newPref);
          setHasExplicitPreference(true);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newPref));
          localStorage.setItem(HAS_SET_KEY, 'true');

          resolve({
            success: true,
            message: `Detected nearest district: ${matchedDistrict.name} (~${Math.round(minDistance)} km)`,
          });
        },
        (error) => {
          setIsDetecting(false);
          let msg = 'Could not retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please select your district manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please try again or select your district manually.';
          }
          resolve({ success: false, message: msg });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const openLocationModal = () => setIsPreferenceModalOpen(true);
  const closeLocationModal = () => setIsPreferenceModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        districts,
        locationPreference,
        hasExplicitPreference,
        isPreferenceModalOpen,
        openLocationModal,
        closeLocationModal,
        setPreferredDistrict,
        detectCurrentLocation,
        setRadiusKm,
        isDetecting,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationPreference = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationPreference must be used within a LocationProvider');
  }
  return context;
};

