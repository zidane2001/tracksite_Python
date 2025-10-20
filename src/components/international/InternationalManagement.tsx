import React, { useEffect, useState } from 'react';
import { GlobeIcon, PlaneIcon, TruckIcon, ShipIcon, PlusIcon, SearchIcon, EditIcon, TrashIcon } from 'lucide-react';
import { shipmentsApi, Shipment } from '../../utils/api';

interface InternationalRoute {
  id: number;
  origin_country: string;
  destination_country: string;
  transport_mode: 'air' | 'sea' | 'road' | 'rail';
  estimated_days: number;
  base_cost: number;
  currency: string;
  customs_required: boolean;
  active: boolean;
}

export const InternationalManagement: React.FC = () => {
  const [routes, setRoutes] = useState<InternationalRoute[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for international routes
  const mockRoutes: InternationalRoute[] = [
    {
      id: 1,
      origin_country: 'France',
      destination_country: 'USA',
      transport_mode: 'air',
      estimated_days: 7,
      base_cost: 85.50,
      currency: 'EUR',
      customs_required: true,
      active: true
    },
    {
      id: 2,
      origin_country: 'France',
      destination_country: 'China',
      transport_mode: 'sea',
      estimated_days: 35,
      base_cost: 45.20,
      currency: 'EUR',
      customs_required: true,
      active: true
    },
    {
      id: 3,
      origin_country: 'France',
      destination_country: 'Germany',
      transport_mode: 'road',
      estimated_days: 2,
      base_cost: 25.00,
      currency: 'EUR',
      customs_required: false,
      active: true
    },
    {
      id: 4,
      origin_country: 'France',
      destination_country: 'UK',
      transport_mode: 'air',
      estimated_days: 1,
      base_cost: 65.00,
      currency: 'EUR',
      customs_required: true,
      active: true
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const shipmentsData = await shipmentsApi.getAll();
      setShipments(shipmentsData);
      setRoutes(mockRoutes);
    } catch (error) {
      console.error('Failed to load data:', error);
      setRoutes(mockRoutes);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.origin_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.destination_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.transport_mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'air': return <PlaneIcon className="h-5 w-5 text-blue-600" />;
      case 'sea': return <ShipIcon className="h-5 w-5 text-blue-600" />;
      case 'road': return <TruckIcon className="h-5 w-5 text-green-600" />;
      case 'rail': return <TruckIcon className="h-5 w-5 text-purple-600" />;
      default: return <GlobeIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransportLabel = (mode: string) => {
    switch (mode) {
      case 'air': return 'Avion';
      case 'sea': return 'Mer';
      case 'road': return 'Route';
      case 'rail': return 'Rail';
      default: return mode;
    }
  };

  const internationalShipments = shipments.filter(shipment => {
    // Consider international if origin and destination are different countries
    // This is a simplified check - in real app, you'd have country codes
    return shipment.origin !== shipment.destination;
  });

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
          <h1 className="text-2xl font-bold text-gray-800">Gestion Internationale</h1>
          <p className="text-gray-600">Routes et expéditions internationales</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => setIsAddModalOpen(true)}
        >
          <PlusIcon size={18} />
          Ajouter Route
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <GlobeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Routes Internationales</p>
              <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <PlaneIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expéditions Internationales</p>
              <p className="text-2xl font-bold text-gray-900">{internationalShipments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <ShipIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Routes Actives</p>
              <p className="text-2xl font-bold text-gray-900">{routes.filter(r => r.active).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Moyenne Délai</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(routes.reduce((sum, r) => sum + r.estimated_days, 0) / routes.length)} jrs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Rechercher par pays ou mode de transport..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-6 py-3 border-b font-medium">Route</th>
                <th className="px-6 py-3 border-b font-medium">Transport</th>
                <th className="px-6 py-3 border-b font-medium">Délai Estimé</th>
                <th className="px-6 py-3 border-b font-medium">Coût Base</th>
                <th className="px-6 py-3 border-b font-medium">Douane</th>
                <th className="px-6 py-3 border-b font-medium">Statut</th>
                <th className="px-6 py-3 border-b font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">
                    <div className="flex items-center">
                      <GlobeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium">
                          {route.origin_country} → {route.destination_country}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <div className="flex items-center">
                      {getTransportIcon(route.transport_mode)}
                      <span className="ml-2">{getTransportLabel(route.transport_mode)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b">
                    {route.estimated_days} jours
                  </td>
                  <td className="px-6 py-4 border-b font-medium">
                    {route.currency} {route.base_cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      route.customs_required
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {route.customs_required ? 'Requise' : 'Non requise'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      route.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {route.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b text-right">
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Modifier">
                      <EditIcon size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-1 ml-2" title="Supprimer">
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRoutes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucune route trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent International Shipments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expéditions Internationales Récentes</h3>
        <div className="space-y-3">
          {internationalShipments.slice(0, 5).map((shipment) => (
            <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <GlobeIcon className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">{shipment.tracking_number}</div>
                  <div className="text-sm text-gray-600">
                    {shipment.origin} → {shipment.destination}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">€{shipment.total_freight?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-gray-600">{shipment.date_created}</div>
              </div>
            </div>
          ))}
          {internationalShipments.length === 0 && (
            <p className="text-gray-500 text-center py-4">Aucune expédition internationale récente</p>
          )}
        </div>
      </div>
    </div>
  );
};