import React, { useEffect, useRef, useState } from 'react';
import { Shipment } from '../../utils/api';
import { parseCoordinates, calculateDistance, calculateDeliveryTime } from '../../utils/coordinates';

interface ShipmentMapProps {
  shipment: Shipment;
  className?: string;
}

export const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentPackagePosition, setCurrentPackagePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Parse coordinates from shipment
    const origin = parseCoordinates(shipment.origin);
    const dest = parseCoordinates(shipment.destination);

    if (origin && dest) {
      setOriginCoords({ lat: origin.latitude, lng: origin.longitude });
      setDestCoords({ lat: dest.latitude, lng: dest.longitude });
    }
  }, [shipment]);

  // Real-time update every second based on actual shipment times and distance
  useEffect(() => {
    if (!originCoords || !destCoords) return;

    const totalDistance = calculateDistance(
      { latitude: originCoords.lat, longitude: originCoords.lng },
      { latitude: destCoords.lat, longitude: destCoords.lng }
    );

    // Calculate speed based on shipment times: speed = distance / time
    let calculatedSpeed = 80; // Default fallback
    let transportMethod = 'truck';

    if (shipment.expected_delivery && shipment.departure_time) {
      try {
        const departureTime = new Date(shipment.departure_time);
        const expectedDelivery = new Date(shipment.expected_delivery);
        const totalTimeHours = (expectedDelivery.getTime() - departureTime.getTime()) / (1000 * 60 * 60);

        if (totalTimeHours > 0) {
          calculatedSpeed = totalDistance / totalTimeHours;

          // Determine transport method based on speed
          if (calculatedSpeed > 800) {
            transportMethod = 'plane';
          } else if (calculatedSpeed > 50) {
            transportMethod = 'truck';
          } else if (calculatedSpeed > 30) {
            transportMethod = 'van';
          } else {
            transportMethod = 'ship';
          }
        }
      } catch (error) {
        console.warn('Error calculating speed from shipment times:', error);
      }
    }

    const totalTimeSeconds = (totalDistance / calculatedSpeed) * 3600; // Convert hours to seconds

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;

      // Calculate progress based on actual speed and time
      const distanceTraveled = (calculatedSpeed * elapsedSeconds) / 3600; // km
      const currentProgress = Math.min(99, (distanceTraveled / totalDistance) * 100);

      setProgress(currentProgress);

      // Calculate current package position using GPS interpolation
      const currentLat = originCoords.lat + (destCoords.lat - originCoords.lat) * (currentProgress / 100);
      const currentLng = originCoords.lng + (destCoords.lng - originCoords.lng) * (currentProgress / 100);
      setCurrentPackagePosition({ lat: currentLat, lng: currentLng });

      // Calculate time remaining based on remaining distance and actual speed
      const remainingDistance = Math.max(0, totalDistance - distanceTraveled);
      const remainingTimeHours = remainingDistance / calculatedSpeed;
      setTimeRemaining(formatTimeRemaining(remainingTimeHours));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [originCoords, destCoords, startTime, shipment]);

  const calculateTimeBasedProgress = (shipment: Shipment, origin: any, dest: any): number => {
    const now = new Date();
    const created = new Date(shipment.date_created);
    const expectedDelivery = shipment.expected_delivery ? new Date(shipment.expected_delivery) : null;

    if (!expectedDelivery) return 0;

    const totalDuration = expectedDelivery.getTime() - created.getTime();
    const elapsedDuration = now.getTime() - created.getTime();

    // Base progress on time elapsed
    let timeProgress = Math.min(100, (elapsedDuration / totalDuration) * 100);

    // Adjust based on status
    switch (shipment.status) {
      case 'pending_confirmation':
        timeProgress = Math.min(timeProgress, 5);
        break;
      case 'processing':
        timeProgress = Math.min(Math.max(timeProgress, 5), 20);
        break;
      case 'picked_up':
        timeProgress = Math.min(Math.max(timeProgress, 20), 40);
        break;
      case 'in_transit':
        timeProgress = Math.min(Math.max(timeProgress, 40), 90);
        break;
      case 'delivered':
        timeProgress = 100;
        break;
      case 'delayed':
        timeProgress = Math.min(timeProgress, 70);
        break;
      default:
        timeProgress = Math.min(timeProgress, 10);
    }

    return Math.max(0, Math.min(100, timeProgress));
  };

  const formatTimeRemaining = (hours: number): string => {
    if (hours <= 0) return 'Livré';
    if (hours < 1) return 'Moins d\'1h';
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}j ${remainingHours}h`;
  };

  // Convert lat/lng to pixel coordinates on our mini-map
  const latLngToPixel = (lat: number, lng: number) => {
    if (!originCoords || !destCoords) return { x: 0, y: 0 };

    // Simple linear interpolation for our mini-map
    const mapWidth = 300; // Approximate map width
    const mapHeight = 200; // Approximate map height

    const latRange = destCoords.lat - originCoords.lat;
    const lngRange = destCoords.lng - originCoords.lng;

    const x = ((lng - originCoords.lng) / lngRange) * (mapWidth - 40) + 20;
    const y = ((lat - originCoords.lat) / latRange) * (mapHeight - 40) + 20;

    return { x: Math.max(10, Math.min(mapWidth - 10, x)), y: Math.max(10, Math.min(mapHeight - 10, y)) };
  };

  if (!originCoords || !destCoords) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-sm">Carte non disponible</div>
          <div className="text-xs mt-1">Coordonnées invalides</div>
        </div>
      </div>
    );
  }

  const originPixel = latLngToPixel(originCoords.lat, originCoords.lng);
  const destPixel = latLngToPixel(destCoords.lat, destCoords.lng);
  const packagePixel = currentPackagePosition ? latLngToPixel(currentPackagePosition.lat, currentPackagePosition.lng) : originPixel;

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 overflow-hidden ${className}`}>
      {/* Map Container */}
      <div className="relative h-64 bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* World Map Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <path d="M50,100 Q100,80 150,90 T250,85 Q300,95 350,100" stroke="#3B82F6" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M60,120 Q120,110 180,115 T280,110 Q320,120 360,125" stroke="#3B82F6" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M40,140 Q90,135 140,140 T240,135 Q290,145 340,150" stroke="#3B82F6" strokeWidth="1" fill="none" opacity="0.3"/>
            <circle cx="200" cy="150" r="80" stroke="#10B981" strokeWidth="1" fill="none" opacity="0.2"/>
            <circle cx="200" cy="150" r="120" stroke="#10B981" strokeWidth="1" fill="none" opacity="0.1"/>
          </svg>
        </div>

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7"
             refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>
          </defs>
          <line
            x1={originPixel.x}
            y1={originPixel.y}
            x2={destPixel.x}
            y2={destPixel.y}
            stroke="#3B82F6"
            strokeWidth="3"
            strokeDasharray="8,4"
            markerEnd="url(#arrowhead)"
          />
        </svg>

        {/* Origin Point */}
        <div
          className="absolute w-6 h-6 bg-red-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center"
          style={{
            left: `${originPixel.x - 12}px`,
            top: `${originPixel.y - 12}px`,
            zIndex: 3
          }}
        >
          <span className="text-white text-xs font-bold">🏠</span>
        </div>
        <div className="absolute bg-white px-2 py-1 rounded shadow-lg text-xs font-medium"
             style={{
               left: `${originPixel.x + 15}px`,
               top: `${originPixel.y - 25}px`,
               zIndex: 4
             }}>
          📍 Départ<br/>
          <span className="text-gray-600 text-xs">
            {originCoords.lat.toFixed(4)}, {originCoords.lng.toFixed(4)}
          </span>
        </div>

        {/* Destination Point */}
        <div
          className="absolute w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-xl flex items-center justify-center"
          style={{
            left: `${destPixel.x - 12}px`,
            top: `${destPixel.y - 12}px`,
            zIndex: 3
          }}
        >
          <span className="text-white text-xs font-bold">🎯</span>
        </div>
        <div className="absolute bg-white px-2 py-1 rounded shadow-lg text-xs font-medium"
             style={{
               left: `${destPixel.x + 15}px`,
               top: `${destPixel.y - 25}px`,
               zIndex: 4
             }}>
          🎯 Arrivée<br/>
          <span className="text-gray-600 text-xs">
            {destCoords.lat.toFixed(4)}, {destCoords.lng.toFixed(4)}
          </span>
        </div>

        {/* Moving Package */}
        <div
          className="absolute w-6 h-6 bg-yellow-400 rounded-full border-3 border-white shadow-2xl flex items-center justify-center animate-bounce"
          style={{
            left: `${packagePixel.x - 12}px`,
            top: `${packagePixel.y - 12}px`,
            zIndex: 5,
            transition: 'all 1s ease-in-out',
            transform: 'translate(-50%, -50%) scale(1.1)'
          }}
        >
          <span className="text-sm animate-pulse">
            {(() => {
              // Dynamic transport icon based on calculated speed
              let transportIcon = '🚚'; // Default truck
              try {
                if (shipment.expected_delivery && shipment.departure_time) {
                  const departureTime = new Date(shipment.departure_time);
                  const expectedDelivery = new Date(shipment.expected_delivery);
                  const totalTimeHours = (expectedDelivery.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
                  const totalDistance = calculateDistance(
                    { latitude: originCoords.lat, longitude: originCoords.lng },
                    { latitude: destCoords.lat, longitude: destCoords.lng }
                  );
                  const calculatedSpeed = totalDistance / totalTimeHours;

                  if (calculatedSpeed > 800) transportIcon = '✈️';
                  else if (calculatedSpeed > 50) transportIcon = '🚚';
                  else if (calculatedSpeed > 30) transportIcon = '🚐';
                  else transportIcon = '🚢';
                }
              } catch (error) {
                // Keep default icon on error
              }
              return transportIcon;
            })()}
          </span>
        </div>
        <div className="absolute bg-yellow-100 border border-yellow-300 px-2 py-1 rounded shadow-lg text-xs font-medium"
             style={{
               left: `${packagePixel.x + 12}px`,
               top: `${packagePixel.y - 30}px`,
               zIndex: 6
             }}>
          {(() => {
            // Dynamic transport method text
            let transportText = '🚚 Camion';
            try {
              if (shipment.expected_delivery && shipment.departure_time) {
                const departureTime = new Date(shipment.departure_time);
                const expectedDelivery = new Date(shipment.expected_delivery);
                const totalTimeHours = (expectedDelivery.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
                const totalDistance = calculateDistance(
                  { latitude: originCoords.lat, longitude: originCoords.lng },
                  { latitude: destCoords.lat, longitude: destCoords.lng }
                );
                const calculatedSpeed = totalDistance / totalTimeHours;

                if (calculatedSpeed > 800) transportText = '✈️ Avion';
                else if (calculatedSpeed > 50) transportText = '🚚 Camion';
                else if (calculatedSpeed > 30) transportText = '🚐 Fourgonnette';
                else transportText = '🚢 Bateau';
              }
            } catch (error) {
              // Keep default text on error
            }
            return transportText;
          })()}<br/>
          <span className="text-gray-600 text-xs">
            {currentPackagePosition ? `${currentPackagePosition.lat.toFixed(4)}, ${currentPackagePosition.lng.toFixed(4)}` : ''}
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Temps restant: {timeRemaining}</span>
            <span>Distance: {(() => {
              const totalDist = calculateDistance(
                { latitude: originCoords.lat, longitude: originCoords.lng },
                { latitude: destCoords.lat, longitude: destCoords.lng }
              );
              const traveled = (progress / 100) * totalDist;
              return `${traveled.toFixed(1)} / ${totalDist.toFixed(1)} km`;
            })()}</span>
          </div>
          <div className="text-xs text-gray-600 mt-1 text-center">
            {(() => {
              // Display calculated speed and transport method
              try {
                if (shipment.expected_delivery && shipment.departure_time) {
                  const departureTime = new Date(shipment.departure_time);
                  const expectedDelivery = new Date(shipment.expected_delivery);
                  const totalTimeHours = (expectedDelivery.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
                  const totalDistance = calculateDistance(
                    { latitude: originCoords.lat, longitude: originCoords.lng },
                    { latitude: destCoords.lat, longitude: destCoords.lng }
                  );
                  const calculatedSpeed = totalDistance / totalTimeHours;

                  let transportName = 'Camion';
                  if (calculatedSpeed > 800) transportName = 'Avion';
                  else if (calculatedSpeed > 50) transportName = 'Camion';
                  else if (calculatedSpeed > 30) transportName = 'Fourgonnette';
                  else transportName = 'Bateau';

                  return `${transportName} - ${calculatedSpeed.toFixed(0)} km/h`;
                }
              } catch (error) {
                // Return default on error
              }
              return 'Camion - 80 km/h';
            })()}
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Statut:</span>
            <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium inline-block ${
              shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
              shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
              shipment.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {shipment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Livraison prévue:</span>
            <div className="mt-1 text-xs text-gray-600">
              {shipment.expected_delivery ? new Date(shipment.expected_delivery).toLocaleDateString('fr-FR') : 'Non définie'}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Progress Bar Section */}
      <div className="p-4 bg-white border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Progression Alternative</h4>
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {/* Progress Details */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Progression:</span> {Math.round(progress)}%
            </div>
            <div>
              <span className="font-medium">Temps restant:</span> {timeRemaining}
            </div>
          </div>

          {/* Distance and Speed Info */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Distance:</span> {(() => {
                const totalDist = calculateDistance(
                  { latitude: originCoords.lat, longitude: originCoords.lng },
                  { latitude: destCoords.lat, longitude: destCoords.lng }
                );
                const traveled = (progress / 100) * totalDist;
                return `${traveled.toFixed(1)} / ${totalDist.toFixed(1)} km`;
              })()}
            </div>
            <div>
              <span className="font-medium">Transport:</span> {(() => {
                try {
                  if (shipment.expected_delivery && shipment.departure_time) {
                    const departureTime = new Date(shipment.departure_time);
                    const expectedDelivery = new Date(shipment.expected_delivery);
                    const totalTimeHours = (expectedDelivery.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
                    const totalDistance = calculateDistance(
                      { latitude: originCoords.lat, longitude: originCoords.lng },
                      { latitude: destCoords.lat, longitude: destCoords.lng }
                    );
                    const calculatedSpeed = totalDistance / totalTimeHours;

                    let transportName = 'Camion';
                    if (calculatedSpeed > 800) transportName = 'Avion';
                    else if (calculatedSpeed > 50) transportName = 'Camion';
                    else if (calculatedSpeed > 30) transportName = 'Fourgonnette';
                    else transportName = 'Bateau';

                    return `${transportName} (${calculatedSpeed.toFixed(0)} km/h)`;
                  }
                } catch (error) {
                  // Return default on error
                }
                return 'Camion (80 km/h)';
              })()}
            </div>
          </div>

          {/* Current Position */}
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-medium">Position actuelle:</span><br/>
            {currentPackagePosition ?
              `${currentPackagePosition.lat.toFixed(4)}, ${currentPackagePosition.lng.toFixed(4)}` :
              'Calcul en cours...'
            }
          </div>
        </div>
      </div>
    </div>
  );
};