import React, { useState } from 'react';
import { SearchIcon, PackageIcon, TruckIcon, CheckCircleIcon, ClockIcon, MapPinIcon, AlertCircleIcon, MapIcon, PhoneIcon, MailIcon } from 'lucide-react';
import { trackingApi, TrackingResult } from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});
export const TrackingPage: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const result = await trackingApi.track(trackingNumber.trim());
      setTrackingResult(result);
    } catch (err) {
      setError('Tracking number not found. Please check and try again.');
      setTrackingResult(null);
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <TruckIcon className="h-6 w-6 text-blue-600" />;
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-yellow-600" />;
      case 'delayed':
        return <AlertCircleIcon className="h-6 w-6 text-red-600" />;
      case 'picked_up':
        return <PackageIcon className="h-6 w-6 text-purple-600" />;
      default:
        return <PackageIcon className="h-6 w-6 text-gray-600" />;
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'En transit';
      case 'delivered':
        return 'Livré';
      case 'processing':
        return 'En cours de traitement';
      case 'delayed':
        return 'Retardé';
      case 'picked_up':
        return 'Pris en charge';
      default:
        return status;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'badge badge-info';
      case 'delivered':
        return 'badge badge-success';
      case 'processing':
        return 'badge badge-warning';
      case 'delayed':
        return 'badge badge-error';
      case 'picked_up':
        return 'badge';
      default:
        return 'badge';
    }
  };
  return <div className="w-full bg-gray-50">
    <div className="bg-primary text-primary-content py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Suivre votre colis
        </h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Entrez votre numéro de suivi pour connaître l'état et la position de
          votre colis en temps réel.
        </p>
      </div>
    </div>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 -mt-8">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow form-control">
              <label htmlFor="tracking-number" className="block text-gray-700 text-sm font-medium mb-2">
                Numéro de suivi
              </label>
              <div className="relative">
                <input type="text" id="tracking-number" className={`input input-bordered input-primary w-full ${error ? 'input-error' : ''}`} placeholder="Ex: SHIP065364729622-COLISSELECT" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <p className="mt-1 text-xs text-gray-500">
                For testing, use tracking number: SHIP065364729622-COLISSELECT
              </p>
            </div>
            <div className="md:self-end">
              <button type="submit" className={`btn btn-primary ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Track'}
              </button>
            </div>
          </div>
        </form>
      </div>
      {trackingResult && <div className="max-w-6xl mx-auto mt-8 space-y-6">
        {/* Shipment Information */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {trackingResult.shipment.tracking_number}
                </h2>
                <p className="text-gray-600 mt-1">
                  <span className={`${getStatusBadge(trackingResult.shipment.status)} text-xs`}>
                    {getStatusText(trackingResult.shipment.status)}
                  </span>
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-600">
                  Estimated delivery date:
                </p>
                <p className="text-lg font-medium text-gray-800">
                  {trackingResult.shipment.expected_delivery || 'To be determined'}
                </p>
              </div>
            </div>
          </div>

          {/* Shipper Information */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipper Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-800">{trackingResult.shipment.shipper_name}</p>
                <p className="text-gray-600">{trackingResult.shipment.shipper_address}</p>
                <p className="text-gray-600">{trackingResult.shipment.shipper_phone}</p>
                <p className="text-gray-600">{trackingResult.shipment.shipper_email}</p>
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Receiver Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-800">{trackingResult.shipment.receiver_name}</p>
                <p className="text-gray-600">{trackingResult.shipment.receiver_address}</p>
                <p className="text-gray-600">{trackingResult.shipment.receiver_phone}</p>
                <p className="text-gray-600">{trackingResult.shipment.receiver_email}</p>
              </div>
            </div>
          </div>

          {/* Shipment Status */}
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipment Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Origin</p>
                <p className="font-medium text-gray-800">{trackingResult.shipment.origin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-gray-800">{getStatusText(trackingResult.shipment.status)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="font-medium text-gray-800">{trackingResult.shipment.destination}</p>
              </div>
            </div>
          </div>

          {/* Shipment Information */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-medium text-gray-800">{trackingResult.shipment.product || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium text-gray-800">{trackingResult.shipment.quantity || 1}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium text-gray-800">{trackingResult.shipment.total_weight}kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shipping Cost</p>
                <p className="font-medium text-gray-800">€{trackingResult.shipment.total_freight || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Payment Mode</p>
                <p className="font-medium text-gray-800">{trackingResult.shipment.payment_mode || 'Cash'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pickup Date</p>
                <p className="font-medium text-gray-800">{trackingResult.shipment.pickup_date || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Packages Table */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Packages</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Qty</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Length(cm)</th>
                    <th className="px-4 py-2 text-left">Width(cm)</th>
                    <th className="px-4 py-2 text-left">Height(cm)</th>
                    <th className="px-4 py-2 text-left">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2">{trackingResult.shipment.quantity || 1}</td>
                    <td className="px-4 py-2">Package</td>
                    <td className="px-4 py-2">{trackingResult.shipment.product || 'N/A'}</td>
                    <td className="px-4 py-2">-</td>
                    <td className="px-4 py-2">-</td>
                    <td className="px-4 py-2">-</td>
                    <td className="px-4 py-2">{trackingResult.shipment.total_weight}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Poids volumétrique total : 0.00kg</p>
              <p>Volume total : 0.00cu. m.</p>
              <p>Poids actuel total : {trackingResult.shipment.total_weight}kg</p>
            </div>
          </div>
        </div>

        {/* Tracking History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Location</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Updated by</th>
                    <th className="px-4 py-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingResult.history.map((step, index) => {
                    const [date, time] = step.date_time.split(' ');
                    return (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{date}</td>
                        <td className="px-4 py-2">{time}</td>
                        <td className="px-4 py-2">{step.location}</td>
                        <td className="px-4 py-2">{step.status}</td>
                        <td className="px-4 py-2">admin</td>
                        <td className="px-4 py-2">{step.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapIcon className="h-5 w-5 mr-2" />
              Route Tracking
            </h3>
          </div>
          <div className="p-6">
            <div className="h-96 rounded-lg overflow-hidden border">
              <MapContainer
                center={[48.8566, 2.3522]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {trackingResult.history
                  .filter(step => step.latitude && step.longitude)
                  .map((step, index) => (
                    <Marker key={index} position={[step.latitude!, step.longitude!]}>
                      <Popup>
                        <div>
                          <p className="font-medium">{step.location}</p>
                          <p className="text-sm text-gray-600">{step.status}</p>
                          <p className="text-xs text-gray-500">{step.date_time}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>}
    </div>
    {/* Additional Info Section */}
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Need Help?
            </h2>
            <p className="text-gray-600 mb-4">
              If you have questions about your package or encounter issues with
              tracking, our customer service team is here to help you.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-800">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-800">support@colisselect.com</span>
              </div>
            </div>
            <button className="mt-6 bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Contact Support
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Tracking FAQ
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800">
                  How long does it take to update the status?
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Status updates are generally performed within 2-4 hours
                  following each step of the shipping process.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  What to do if my package is marked as "Delayed"?
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  A delay can be due to various reasons. Please wait 24 hours
                  for an update or contact our customer service.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  How can I track multiple packages at once?
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  To track multiple packages, please log into your customer
                  account or contact our customer service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
};