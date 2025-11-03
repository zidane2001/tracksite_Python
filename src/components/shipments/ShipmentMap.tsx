import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Shipment } from '../../utils/api';
import { parseCoordinates, calculateDistance, calculateDeliveryTime, getTransportMethod } from '../../utils/coordinates';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

// Fix default icons for Leaflet
import 'leaflet-defaulticon-compatibility';

import { usePersistedState } from '../../hooks/usePersistedState';
import { useShipmentWebSocket } from '../../hooks/useShipmentWebSocket';
import { shipmentProgressApi } from '../../utils/api';

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

const getTransportInfo = (speed: number, distance: number, travelTimeHours: number) => {
  return getTransportMethod(speed, distance, travelTimeHours);
};

export const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment, className = '' }) => {
  const { id } = shipment;  // Utilise l'ID du shipment pour la clé localStorage
  const mapRef = useRef<L.Map>(null);

  // États pour la persistance cross-device via backend
  const [backendProgress, setBackendProgress] = useState<{
    progress: number;
    current_lat?: number;
    current_lng?: number;
    last_updated: string;
  } | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // États persistés via localStorage (fallback)
  const [startTime] = usePersistedState<number>(`shipment-${id}-startTime`, (() => {
    // Utiliser la date de départ si disponible, sinon Date.now()
    if (shipment.pickup_date && shipment.pickup_time) {
      try {
        const departureDateTime = new Date(`${shipment.pickup_date}T${shipment.pickup_time}`);
        return departureDateTime.getTime();
      } catch (e) {
        console.warn('Invalid pickup date/time, using current time', e);
      }
    }
    return Date.now();
  })());
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

  // Charger le progrès depuis le backend au montage
  useEffect(() => {
    const loadBackendProgress = async () => {
      try {
        const progress = await shipmentProgressApi.get(id);
        setBackendProgress(progress);
        // Synchroniser avec localStorage
        setCurrentProgress(progress.progress);
        if (progress.current_lat && progress.current_lng) {
          setCurrentPosition({ lat: progress.current_lat, lng: progress.current_lng });
        }
      } catch (error) {
        console.warn('Failed to load backend progress, using localStorage', error);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadBackendProgress();
  }, [id]);

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

  // Calcul vitesse & distance basée sur le temps de trajet réel (départ - arrivée)
  const { totalDistance, calculatedSpeed } = useMemo(() => {
    if (!originCoords || !destCoords) return { totalDistance: 0, calculatedSpeed: 80 };

    const distance = calculateDistance(
      { latitude: originCoords.lat, longitude: originCoords.lng },
      { latitude: destCoords.lat, longitude: destCoords.lng }
    );

    let speed = 80;
    if (shipment.pickup_date && shipment.pickup_time && shipment.departure_time) {
      try {
        // Créer la date/heure de départ
        const departureDateTime = new Date(`${shipment.pickup_date}T${shipment.pickup_time}`);
        // Créer la date/heure d'arrivée depuis departure_time (qui contient maintenant la date et heure d'arrivée)
        const arrivalDateTime = new Date(shipment.departure_time.replace(' ', 'T'));

        const hours = (arrivalDateTime.getTime() - departureDateTime.getTime()) / (1000 * 60 * 60);
        if (hours > 0 && distance > 0) speed = distance / hours;
      } catch (e) {
        console.warn('Invalid shipment times', e);
      }
    }
    return { totalDistance: distance, calculatedSpeed: speed };
  }, [originCoords, destCoords, shipment.pickup_date, shipment.pickup_time, shipment.departure_time]);

  useEffect(() => {
    const travelTimeHours = (shipment.departure_time && shipment.pickup_date && shipment.pickup_time) ?
      (new Date(shipment.departure_time).getTime() - new Date(`${shipment.pickup_date}T${shipment.pickup_time}`).getTime()) / (1000 * 60 * 60) : 0;
    const info = getTransportInfo(calculatedSpeed, totalDistance, travelTimeHours);
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

      // Vérifier si le shipment a déjà commencé (basé sur la date de départ)
      const hasStarted = shipment.pickup_date && shipment.pickup_time &&
        new Date(`${shipment.pickup_date}T${shipment.pickup_time}`).getTime() <= now;

      if (!hasStarted) {
        // Le shipment n'a pas encore commencé, rester à 0%
        progress = 0;
        setCurrentPosition(originCoords);
        setDistanceTraveled(0);
        setTimeRemaining('Non commencé');
      } else {
        // Priorité au backend progress, puis WebSocket, puis calcul local
        if (backendProgress) {
          // Utiliser le progrès du backend (cross-device sync)
          progress = backendProgress.progress;
          if (backendProgress.current_lat && backendProgress.current_lng) {
            setCurrentPosition({ lat: backendProgress.current_lat, lng: backendProgress.current_lng });
          } else {
            const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * (progress / 100);
            const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * (progress / 100);
            setCurrentPosition({ lat, lng });
          }
        } else if (lastUpdate) {
          // Override avec WebSocket si update reçu
          progress = Math.max(progress, lastUpdate.progress);
          const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * (progress / 100);
          const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * (progress / 100);
          setCurrentPosition({ lat, lng });
          elapsedMs = lastUpdate.timestamp - startTime;  // Sync temps avec serveur
        } else {
          // Interpolation locale si pas d'update WS ni backend
          const elapsedHours = elapsedMs / (1000 * 60 * 60);
          const traveled = Math.min(calculatedSpeed * elapsedHours, totalDistance);
          progress = (traveled / totalDistance) * 100;
          const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * (progress / 100);
          const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * (progress / 100);
          setCurrentPosition({ lat, lng });
          setDistanceTraveled(traveled);
        }

        // Synchroniser avec localStorage
        setCurrentProgress(Math.min(99.9, progress));

        // Sauvegarder dans le backend pour synchronisation cross-device (seulement si pas déjà chargé du backend)
        if (currentPosition && !backendProgress) {
          try {
            shipmentProgressApi.update(id, {
              progress: Math.min(99.9, progress),
              current_lat: currentPosition.lat,
              current_lng: currentPosition.lng,
            }).catch(error => console.warn('Failed to save progress to backend:', error));
          } catch (error) {
            console.warn('Failed to update backend progress:', error);
          }
        }

        // Temps restant
        const remainingDistance = totalDistance - (progress / 100) * totalDistance;
        const remainingHours = remainingDistance / calculatedSpeed;
        setTimeRemaining(formatTimeRemaining(remainingHours));
      }

      // Zoom automatique pour montrer tout le trajet (départ, position actuelle, arrivée)
      if (mapRef.current && originCoords && destCoords) {
        const bounds = L.latLngBounds([
          [originCoords.lat, originCoords.lng],
          [destCoords.lat, destCoords.lng]
        ]);
        if (currentPosition) {
          bounds.extend([currentPosition.lat, currentPosition.lng]);
        }
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
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
  }, [originCoords, destCoords, totalDistance, calculatedSpeed, lastUpdate, startTime, backendProgress, isLoadingProgress, shipment.pickup_date, shipment.pickup_time]);


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
      {/* Carte Leaflet - Zoomable complète */}
      <div className="relative h-96">
        <MapContainer
          center={center as [number, number]}
          zoom={4}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          keyboard={true}
          dragging={true}
          touchZoom={true}
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
              {shipment.origin}
            </Popup>
          </Marker>

          {/* Marqueur Arrivée */}
          <Marker position={[destCoords.lat, destCoords.lng]} icon={targetIcon}>
            <Popup>
              <strong>🎯 Arrivée</strong><br />
              {shipment.destination}
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