import React, { useEffect, useRef, useState } from 'react';
import { Shipment } from '../../utils/api';
import { parseCoordinates, calculateDistance } from '../../utils/coordinates';

interface ShipmentMapProps {
  shipment: Shipment;
  className?: string;
}

export const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Parse coordinates from shipment
    const originCoords = parseCoordinates(shipment.origin);
    const destCoords = parseCoordinates(shipment.destination);

    if (originCoords && destCoords) {
      // Calculate current position based on shipment status and time
      const statusProgress = getStatusProgress(shipment.status);
      const distance = calculateDistance(originCoords, destCoords);

      // Interpolate position between origin and destination
      const currentLat = originCoords.latitude + (destCoords.latitude - originCoords.latitude) * statusProgress;
      const currentLng = originCoords.longitude + (destCoords.longitude - originCoords.longitude) * statusProgress;

      setCurrentPosition({ lat: currentLat, lng: currentLng });
      setProgress(statusProgress * 100);
    }
  }, [shipment]);

  const getStatusProgress = (status: string): number => {
    switch (status) {
      case 'pending_confirmation': return 0;
      case 'processing': return 0.1;
      case 'picked_up': return 0.3;
      case 'in_transit': return 0.7;
      case 'delivered': return 1;
      case 'delayed': return 0.5;
      default: return 0;
    }
  };

  if (!currentPosition) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-sm">Carte non disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 overflow-hidden ${className}`}>
      {/* Simple SVG Map Representation */}
      <div className="relative h-48 bg-gradient-to-b from-blue-100 to-green-100">
        {/* Origin Point */}
        <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
            📍 Départ
          </div>
        </div>

        {/* Destination Point */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
            🎯 Arrivée
          </div>
        </div>

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <line
            x1="20"
            y1="20"
            x2="calc(100% - 20px)"
            y2="20"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
        </svg>

        {/* Moving Package */}
        <div
          className="absolute top-3 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg transition-all duration-1000 ease-linear"
          style={{
            left: `${16 + (progress / 100) * (100 - 32)}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
            📦 En cours
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-2 left-4 right-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 mt-1 text-center">
            Progression: {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="p-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">Statut:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
              shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
              shipment.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {shipment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div className="text-gray-600">
            {shipment.expected_delivery && (
              <div className="text-xs">
                Livraison: {new Date(shipment.expected_delivery).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};