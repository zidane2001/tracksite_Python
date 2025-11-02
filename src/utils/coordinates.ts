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

export function formatCoordinates(coords: Coordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}