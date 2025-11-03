import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Shipment } from '../../utils/api';
import { parseCoordinates, calculateDistance, calculateDeliveryTime } from '../../utils/coordinates';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

// Fix default icons for Leaflet
import 'leaflet-defaulticon-compatibility';

import { usePersistedState } from '../../hooks/usePersistedState';
import { useShipmentWebSocket } from '../../hooks/useShipmentWebSocket';

import { LatLngExpression } from 'leaflet';

interface ShipmentMapProps {
  shipment: Shipment;
  className?: string;
}

// Custom icons (simple, mais tu peux utiliser des images)
const houseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const targetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const packageIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const formatTimeRemaining = (hours: number): string => {
  if (hours <= 0) return 'Livré';
  if (hours < 1) return "Moins d'1h";
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}j ${remainingHours}h`;
};

const getTransportInfo = (speed: number) => {
  if (speed > 800) return { icon: '✈️', name: 'Avion', color: 'bg-purple-100 text-purple-800' };
  if (speed > 50) return { icon: '🚚', name: 'Camion', color: 'bg-blue-100 text-blue-800' };
  if (speed > 30) return { icon: '🚐', name: 'Fourgonnette', color: 'bg-yellow-100 text-yellow-800' };
  return { icon: '🚢', name: 'Bateau', color: 'bg-teal-100 text-teal-800' };
};

export const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment, className = '' }) => {
  const { id } = shipment;  // Utilise l'ID du shipment pour la clé localStorage
  const mapRef = useRef<L.Map>(null);

  // États persistés via localStorage
  const [startTime] = usePersistedState<number>(`shipment-${id}-startTime`, Date.now());
  const [currentProgress, setCurrentProgress] = usePersistedState<number>(`shipment-${id}-progress`, 0);
  const [currentPosition, setCurrentPosition] = usePersistedState<{ lat: number; lng: number } | null>(
    `shipment-${id}-position`,
    null
  );

  // États normaux
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [speed, setSpeed] = useState(80);
  const [transport, setTransport] = useState({ icon: '🚚', name: 'Camion', color: 'bg-blue-100 text-blue-800' });

  // WebSocket pour updates live
  const { lastUpdate, readyState, sendHeartbeat } = useShipmentWebSocket(id);

  useEffect(() => {
    // Parse coordinates from shipment
    const origin = parseCoordinates(shipment.origin);
    const dest = parseCoordinates(shipment.destination);

    if (origin && dest) {
      setOriginCoords({ lat: origin.latitude, lng: origin.longitude });
      setDestCoords({ lat: dest.latitude, lng: dest.longitude });
    }
  }, [shipment]);

  // Parse coordinates
  const parsed = useMemo(() => {
    const origin = parseCoordinates(shipment.origin);
    const dest = parseCoordinates(shipment.destination);
    return { origin, dest };
  }, [shipment.origin, shipment.destination]);

  useEffect(() => {
    if (parsed.origin && parsed.dest) {
      setOriginCoords({ lat: parsed.origin.latitude, lng: parsed.origin.longitude });
      setDestCoords({ lat: parsed.dest.latitude, lng: parsed.dest.longitude });
    }
  }, [parsed]);

  // Calcul vitesse & distance
  const { totalDistance, calculatedSpeed } = useMemo(() => {
    if (!originCoords || !destCoords) return { totalDistance: 0, calculatedSpeed: 80 };

    const distance = calculateDistance(
      { latitude: originCoords.lat, longitude: originCoords.lng },
      { latitude: destCoords.lat, longitude: destCoords.lng }
    );

    let speed = 80;
    if (shipment.departure_time && shipment.expected_delivery) {
      try {
        const start = new Date(shipment.departure_time).getTime();
        const end = new Date(shipment.expected_delivery).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        if (hours > 0 && distance > 0) speed = distance / hours;
      } catch (e) {
        console.warn('Invalid shipment times', e);
      }
    }
    return { totalDistance: distance, calculatedSpeed: speed };
  }, [originCoords, destCoords, shipment.departure_time, shipment.expected_delivery]);

  useEffect(() => {
    const info = getTransportInfo(calculatedSpeed);
    setSpeed(calculatedSpeed);
    setTransport(info);
  }, [calculatedSpeed]);

  // Animation en temps réel + intégration WebSocket
  useEffect(() => {
    if (!originCoords || !destCoords || totalDistance === 0) return;

    let animationId: number;
    const animate = () => {
      const now = Date.now();
      let elapsedMs = now - startTime;
      let progress = currentProgress;

      // Override avec WebSocket si update reçu
      if (lastUpdate) {
        progress = Math.max(progress, lastUpdate.progress);
        const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * (progress / 100);
        const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * (progress / 100);
        setCurrentPosition({ lat, lng });
        elapsedMs = lastUpdate.timestamp - startTime;  // Sync temps avec serveur
      } else {
        // Interpolation locale si pas d'update WS
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        const traveled = Math.min(calculatedSpeed * elapsedHours, totalDistance);
        progress = (traveled / totalDistance) * 100;
        const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * (progress / 100);
        const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * (progress / 100);
        setCurrentPosition({ lat, lng });
        setDistanceTraveled(traveled);
      }

      // Persist progress
      setCurrentProgress(Math.min(99.9, progress));

      // Temps restant
      const remainingDistance = totalDistance - (progress / 100) * totalDistance;
      const remainingHours = remainingDistance / calculatedSpeed;
      setTimeRemaining(formatTimeRemaining(remainingHours));

      // Zoom sur position actuelle
      if (mapRef.current && currentPosition) {
        mapRef.current.setView([currentPosition.lat, currentPosition.lng], 10);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Heartbeat WS toutes les 30s
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(heartbeatInterval);
    };
  }, [originCoords, destCoords, totalDistance, calculatedSpeed, lastUpdate, startTime, currentProgress]);


  // Polyline positions (route complète)
  const polylinePositions: LatLngExpression[] = useMemo(() => {
    if (!originCoords || !destCoords) return [];
    const steps = 100;  // Résolution de la ligne
    return Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      return [
        originCoords.lat + (destCoords.lat - originCoords.lat) * t,
        originCoords.lng + (destCoords.lng - originCoords.lng) * t,
      ] as LatLngExpression;
    });
  }, [originCoords, destCoords]);

  if (!originCoords || !destCoords) {
    return (
      <div className={`bg-gray-50 rounded-xl p-8 text-center ${className}`}>
        <div className="text-6xl mb-3">🗺️</div>
        <p className="text-gray-600 font-medium">Carte non disponible</p>
      </div>
    );
  }

  const center = [ (originCoords.lat + destCoords.lat) / 2, (originCoords.lng + destCoords.lng) / 2 ];

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 ${className}`}>
      {/* Carte Leaflet */}
      <div className="relative h-96">
        <MapContainer
          center={center as [number, number]}
          zoom={6}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Route Polyline */}
          <Polyline
            positions={polylinePositions}
            color="#3B82F6"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />

          {/* Marqueur Départ */}
          <Marker position={[originCoords.lat, originCoords.lng]} icon={houseIcon}>
            <Popup>
              <strong>📍 Départ</strong><br />
              {originCoords.lat.toFixed(4)}, {originCoords.lng.toFixed(4)}
            </Popup>
          </Marker>

          {/* Marqueur Arrivée */}
          <Marker position={[destCoords.lat, destCoords.lng]} icon={targetIcon}>
            <Popup>
              <strong>🎯 Arrivée</strong><br />
              {destCoords.lat.toFixed(4)}, {destCoords.lng.toFixed(4)}
            </Popup>
          </Marker>

          {/* Marqueur Colis (position actuelle) */}
          {currentPosition && (
            <Marker position={[currentPosition.lat, currentPosition.lng]} icon={packageIcon}>
              <Popup>
                <strong>🚚 Position Actuelle</strong><br />
                {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}<br />
                {transport.icon} {transport.name} ({speed.toFixed(0)} km/h)<br />
                WebSocket: {readyState === 1 ? 'Connecté' : 'Déconnecté'}
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Badge Statut WS */}
        <div className="absolute top-2 right-2 bg-white/90 p-2 rounded shadow-lg text-xs">
          WS: {readyState === 1 ? '🟢 Live' : '🔴 Offline'}
        </div>
      </div>

      {/* Barre de Progression Alternative */}
      <div className="p-5 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span> Progression Détaillée (Persistée)
        </h3>

        <div className="space-y-4">
          {/* Barre Gradient */}
          <div className="relative">
            <div className="bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${currentProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-white drop-shadow-md">{Math.round(currentProgress)}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-900">Temps restant</div>
              <div className="text-blue-700 font-bold">{timeRemaining}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-900">Distance</div>
              <div className="text-green-700 font-bold">
                {distanceTraveled.toFixed(1)} / {totalDistance.toFixed(1)} km
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-900">Vitesse</div>
              <div className="text-purple-700 font-bold">{speed.toFixed(0)} km/h</div>
            </div>
            <div className={`${transport.color} p-3 rounded-lg`}>
              <div className="font-medium">Transport</div>
              <div className="font-bold flex items-center gap-1">
                <span className="text-lg">{transport.icon}</span> {transport.name}
              </div>
            </div>
          </div>

          {/* Position GPS Actuelle */}
          <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono text-center">
            <span className="font-bold text-gray-700">Position GPS (Live) :</span><br />
            {currentPosition ? (
              <span className="text-gray-800">
                {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
              </span>
            ) : (
              <span className="text-gray-500">En attente...</span>
            )}
          </div>

          {/* Statut Shipment */}
          <div className="text-xs text-gray-600 text-center">
            <span className="font-medium">Statut: </span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
              shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {shipment.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};