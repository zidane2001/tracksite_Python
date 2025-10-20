import React, { useEffect, useState } from 'react';
import { TruckIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, MapPinIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { shipmentsApi, Shipment } from '../../utils/api';

interface DeliveryDriver {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  status: 'available' | 'busy' | 'offline';
  current_location?: string;
}

export const DeliveriesManagement: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('in_transit');
  const [loading, setLoading] = useState(true);

  // Mock drivers data
  const mockDrivers: DeliveryDriver[] = [
    { id: 1, name: 'Jean Dupont', phone: '+33 6 12 34 56 78', vehicle: 'Renault Master', status: 'available', current_location: 'Paris Centre' },
    { id: 2, name: 'Marie Laurent', phone: '+33 6 23 45 67 89', vehicle: 'Peugeot Boxer', status: 'busy', current_location: 'Lyon' },
    { id: 3, name: 'Pierre Martin', phone: '+33 6 34 56 78 90', vehicle: 'Citroën Jumper', status: 'available', current_location: 'Marseille' },
    { id: 4, name: 'Sophie Bernard', phone: '+33 6 45 67 89 01', vehicle: 'Fiat Ducato', status: 'offline' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const shipmentsData = await shipmentsApi.getAll();
      setShipments(shipmentsData);
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Failed to load data:', error);
      setShipments([]);
      setDrivers(mockDrivers);
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter(shipment =>
    selectedStatus === 'all' || shipment.status === selectedStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'in_transit':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'picked_up':
        return <ClockIcon className="h-5 w-5 text-purple-600" />;
      case 'delayed':
        return <AlertTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livrée';
      case 'in_transit': return 'En transit';
      case 'picked_up': return 'Récupérée';
      case 'delayed': return 'Retardée';
      case 'processing': return 'En traitement';
      default: return status;
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDriverStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      default: return status;
    }
  };

  const assignDriver = (shipmentId: number, driverId: number) => {
    // In a real app, this would make an API call
    console.log(`Assigning driver ${driverId} to shipment ${shipmentId}`);
  };

  const markAsDelivered = async (shipmentId: number) => {
    try {
      await shipmentsApi.update(shipmentId, { status: 'delivered' });
      setShipments(shipments.map(s =>
        s.id === shipmentId ? { ...s, status: 'delivered' } : s
      ));
    } catch (error) {
      console.error('Failed to update shipment status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Livraisons</h1>
          <p className="text-gray-600">Suivez et gérez les livraisons en cours</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Transit</p>
              <p className="text-2xl font-bold text-gray-900">
                {shipments.filter(s => s.status === 'in_transit').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Livrées Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">
                {shipments.filter(s => s.status === 'delivered' && s.date_created === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Livreurs Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.status === 'available').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <AlertTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Retard</p>
              <p className="text-2xl font-bold text-gray-900">
                {shipments.filter(s => s.status === 'delayed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <label className="mr-4 text-sm font-medium text-gray-700">Filtrer par statut:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Tous les statuts</option>
            <option value="processing">En traitement</option>
            <option value="picked_up">Récupérée</option>
            <option value="in_transit">En transit</option>
            <option value="delivered">Livrée</option>
            <option value="delayed">Retardée</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Expéditions ({filteredShipments.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredShipments.map((shipment) => (
                <div key={shipment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(shipment.status)}
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{shipment.tracking_number}</div>
                        <div className="text-sm text-gray-600">
                          {shipment.origin} → {shipment.destination}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shipment.receiver_name} • {shipment.total_weight}kg
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {getStatusLabel(shipment.status)}
                      </div>
                      <div className="text-sm text-gray-600">{shipment.date_created}</div>
                      {shipment.status === 'in_transit' && (
                        <button
                          onClick={() => markAsDelivered(shipment.id)}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Marquer livrée
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredShipments.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Aucune expédition trouvée pour ce statut
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drivers List */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Livreurs ({drivers.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {drivers.map((driver) => (
                <div key={driver.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-600">{driver.vehicle}</div>
                        {driver.current_location && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {driver.current_location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDriverStatusColor(driver.status)}`}>
                        {getDriverStatusLabel(driver.status)}
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        <PhoneIcon className="h-3 w-3 inline mr-1" />
                        {driver.phone}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Map Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Carte des Livraisons</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Carte interactive des livraisons</p>
            <p className="text-sm text-gray-400">Intégration Google Maps ou Leaflet possible</p>
          </div>
        </div>
      </div>
    </div>
  );
};