// hooks/useShipmentWebSocket.ts
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

interface GpsUpdate {
  type?: string;
  lat: number;
  lng: number;
  progress: number;
  timestamp: number;
}

export function useShipmentWebSocket(shipmentId: number) {
  const [lastUpdate, setLastUpdate] = useState<GpsUpdate | null>(null);

  const { sendMessage, lastJsonMessage, readyState } = useWebSocket<GpsUpdate>(
    `ws://localhost:8080/shipment/${shipmentId}`,  // Remplace par ton endpoint backend
    {
      onOpen: () => console.log('WebSocket connected for shipment', shipmentId),
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  useEffect(() => {
    if (lastJsonMessage !== null && lastJsonMessage.type === 'gps_update') {
      setLastUpdate(lastJsonMessage);
    }
  }, [lastJsonMessage]);

  const sendHeartbeat = () => {
    sendMessage(JSON.stringify({ type: 'heartbeat', shipmentId }));
  };

  return {
    lastUpdate,
    readyState,  // (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)
    sendHeartbeat,
  };
}