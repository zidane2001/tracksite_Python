// Utility functions for coordinate parsing and distance calculation

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function parseCoordinates(coordString: string): Coordinates | null {
  // Parse coordinates in format like "12°46'50.4"N 77°29'50.2"E"
  const coordRegex = /(-?\d+)[°]\s*(\d+)[′']\s*([\d.]+)[″"]?\s*([NS])\s+(-?\d+)[°]\s*(\d+)[′']\s*([\d.]+)[″"]?\s*([EW])/i;
  const match = coordString.trim().match(coordRegex);

  if (!match) {
    // Try decimal format like "12.780667, 77.497278"
    const decimalRegex = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
    const decimalMatch = coordString.trim().match(decimalRegex);
    if (decimalMatch) {
      return {
        latitude: parseFloat(decimalMatch[1]),
        longitude: parseFloat(decimalMatch[2])
      };
    }
    return null;
  }

  const [, latDeg, latMin, latSec, latDir, lonDeg, lonMin, lonSec, lonDir] = match;

  let latitude = parseInt(latDeg) + parseInt(latMin) / 60 + parseFloat(latSec) / 3600;
  let longitude = parseInt(lonDeg) + parseInt(lonMin) / 60 + parseFloat(lonSec) / 3600;

  if (latDir.toUpperCase() === 'S') latitude = -latitude;
  if (lonDir.toUpperCase() === 'W') longitude = -longitude;

  return { latitude, longitude };
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDeliveryTime(distanceKm: number, averageSpeedKmh: number = 50): number {
  // Calculate delivery time in hours based on distance and average speed
  // Average speed can be adjusted based on transportation method
  const travelTimeHours = distanceKm / averageSpeedKmh;

  // Add processing time (pickup, customs, etc.) - 24 hours minimum
  const processingTimeHours = 24;

  // Add buffer time based on distance
  const bufferHours = Math.min(distanceKm * 0.1, 48); // Max 48 hours buffer

  return travelTimeHours + processingTimeHours + bufferHours;
}

export function getTransportMethod(speedKmh: number, distanceKm: number, travelTimeHours: number): { icon: string, name: string, color: string, maxSpeed: number } {
  // For intercontinental distances (>3000km) or very long travel times (>72 hours)
  if (distanceKm > 3000 || travelTimeHours > 72) {
    if (travelTimeHours > 72) {
      return { icon: '🚢', name: 'Bateau', color: 'bg-teal-100 text-teal-800', maxSpeed: 30 };
    } else {
      return { icon: '✈️', name: 'Avion', color: 'bg-purple-100 text-purple-800', maxSpeed: 900 };
    }
  }

  // For continental distances with reasonable travel times
  if (speedKmh > 250) {
    return { icon: '✈️', name: 'Avion', color: 'bg-purple-100 text-purple-800', maxSpeed: 900 };
  } else if (speedKmh > 120) {
    return { icon: '🚄', name: 'Train rapide', color: 'bg-indigo-100 text-indigo-800', maxSpeed: 250 };
  } else if (speedKmh > 80) {
    return { icon: '🚚', name: 'Camion', color: 'bg-blue-100 text-blue-800', maxSpeed: 120 };
  } else if (speedKmh > 30) {
    return { icon: '🚐', name: 'Fourgonnette', color: 'bg-yellow-100 text-yellow-800', maxSpeed: 80 };
  } else {
    return { icon: '🚢', name: 'Bateau', color: 'bg-teal-100 text-teal-800', maxSpeed: 30 };
  }
}

export function formatCoordinates(coords: Coordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}

// Reverse geocoding function to get location names from coordinates
export async function reverseGeocode(coords: Coordinates): Promise<string> {
  try {
    // Using Nominatim API (OpenStreetMap) for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TracsitePython/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    // Extract meaningful location information
    if (data && data.display_name) {
      // Try to get city/state/country in a readable format
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.municipality;
      const state = address.state || address.region;
      const country = address.country;

      if (city && state && country) {
        return `${city}, ${state}, ${country}`;
      } else if (city && country) {
        return `${city}, ${country}`;
      } else if (state && country) {
        return `${state}, ${country}`;
      } else {
        // Fallback to a shortened version of display_name
        const parts = data.display_name.split(', ');
        return parts.slice(0, 3).join(', '); // Take first 3 parts for readability
      }
    }

    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`; // Fallback to coordinates
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`; // Fallback to coordinates
  }
}