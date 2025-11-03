import React, { useState } from 'react';
import { SearchIcon, PackageIcon, TruckIcon, CheckCircleIcon, ClockIcon, MapPinIcon, AlertCircleIcon, MapIcon, PhoneIcon, MailIcon } from 'lucide-react';
import { trackingApi, TrackingResult } from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ShipmentMap } from '../components/shipments/ShipmentMap';

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
      setError('Veuillez entrer un numéro de suivi');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const result = await trackingApi.track(trackingNumber.trim());
      setTrackingResult(result);
    } catch (err) {
      setError('Numéro de suivi introuvable. Veuillez vérifier et réessayer.');
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
  return <div className="w-full bg-base-200 overflow-x-hidden">
    <div className="hero bg-primary text-primary-content py-12">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Suivre votre colis
          </h1>
          <p className="text-xl text-primary-content/80">
            Entrez votre numéro de suivi pour connaître l'état et la position de
            votre colis en temps réel.
          </p>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto card bg-base-100 shadow-lg -mt-8">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow form-control">
                <label htmlFor="tracking-number" className="label">
                  <span className="label-text">Numéro de suivi</span>
                </label>
                <div className="relative">
                  <input type="text" id="tracking-number" className={`input input-bordered input-primary w-full ${error ? 'input-error' : ''}`} placeholder="Ex: SHIP065364729622-COLISSELECT" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <SearchIcon className="h-5 w-5 text-base-content/60" />
                  </div>
                </div>
                {error && <div className="alert alert-error mt-2">
                  <span>{error}</span>
                </div>}
                <p className="mt-1 text-xs text-base-content/60">
                  Pour tester, utilisez le numéro: SHIP873128135455-COLISSELECT
                </p>
              </div>
              <div className="md:self-end">
                <button type="submit" className={`btn btn-primary ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                  {isLoading ? 'Chargement...' : 'Suivre'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {trackingResult && <div className="max-w-6xl mx-auto mt-8 space-y-6">
        {/* Shipment Information */}
        <div className="card bg-base-100 shadow-lg overflow-hidden">
          <div className="card-body border-b bg-gradient-to-r from-primary/10 to-info/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="card-title">
                  {trackingResult.shipment.tracking_number}
                </h2>
                <p className="text-base-content/70 mt-1">
                  <div className={`${getStatusBadge(trackingResult.shipment.status)}`}>
                    {getStatusText(trackingResult.shipment.status)}
                  </div>
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-base-content/70">
                  Estimated delivery date:
                </p>
                <p className="text-lg font-medium text-base-content">
                  {trackingResult.shipment.expected_delivery || 'To be determined'}
                </p>
              </div>
            </div>
          </div>

          {/* Shipper Information */}
          <div className="card-body border-b">
            <h3 className="card-title">Informations Expéditeur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-base-content">{trackingResult.shipment.shipper_name}</p>
                <p className="text-base-content/70">{trackingResult.shipment.shipper_address}</p>
                <p className="text-base-content/70">{trackingResult.shipment.shipper_phone}</p>
                <p className="text-base-content/70">{trackingResult.shipment.shipper_email}</p>
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div className="card-body border-b">
            <h3 className="card-title">Informations Destinataire</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-base-content">{trackingResult.shipment.receiver_name}</p>
                <p className="text-base-content/70">{trackingResult.shipment.receiver_address}</p>
                <p className="text-base-content/70">{trackingResult.shipment.receiver_phone}</p>
                <p className="text-base-content/70">{trackingResult.shipment.receiver_email}</p>
              </div>
            </div>
          </div>

          {/* Shipment Status */}
          <div className="card-body border-b bg-base-200">
            <h3 className="card-title">Statut de l'expédition</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-base-content/60">Origin</p>
                <p className="font-medium text-base-content">{trackingResult.shipment.origin}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Status</p>
                <p className="font-medium text-base-content">{getStatusText(trackingResult.shipment.status)}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Destination</p>
                <p className="font-medium text-base-content">{trackingResult.shipment.destination}</p>
              </div>
            </div>
          </div>

          {/* Shipment Information */}
          <div className="card-body border-b">
            <h3 className="card-title">Informations de l'expédition</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-base-content/60">Product</p>
                <p className="font-medium text-base-content">{trackingResult.shipment.product || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Quantity</p>
                <p className="font-medium text-base-content">{trackingResult.shipment.quantity || 1}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Weight</p>
                <p className="font-medium text-base-content">{trackingResult.shipment.total_weight}kg</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Shipping Cost</p>
                <p className="font-medium text-base-content">€{trackingResult.shipment.total_freight || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-base-content/60">Payment Mode</p>
                <p className="font-medium text-base-content">{trackingResult.shipment.payment_mode || 'Cash'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60">Pickup Date</p>
                <p className="font-medium text-base-content">{trackingResult.shipment.pickup_date || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Packages Table */}
          <div className="card-body border-b">
            <h3 className="card-title">Colis</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Qty</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Length(cm)</th>
                    <th>Width(cm)</th>
                    <th>Height(cm)</th>
                    <th>Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{trackingResult.shipment.quantity || 1}</td>
                    <td>Package</td>
                    <td>{trackingResult.shipment.product || 'N/A'}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>{trackingResult.shipment.total_weight}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-base-content/70">
              <p>Poids volumétrique total : 0.00kg</p>
              <p>Volume total : 0.00cu. m.</p>
              <p>Poids actuel total : {trackingResult.shipment.total_weight}kg</p>
            </div>
          </div>
        </div>

        {/* Tracking History */}
        <div className="card bg-base-100 shadow-lg overflow-hidden">
          <div className="card-body border-b">
            <h3 className="card-title">Historique de suivi</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Updated by</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingResult.history.map((step, index) => {
                    const [date, time] = step.date_time.split(' ');
                    return (
                      <tr key={index}>
                        <td>{date}</td>
                        <td>{time}</td>
                        <td>{step.location}</td>
                        <td>{step.status}</td>
                        <td>admin</td>
                        <td>{step.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-Time Map Section */}
        <div className="card bg-base-100 shadow-lg overflow-hidden">
          <div className="card-body border-b">
            <h3 className="card-title flex items-center">
              <MapIcon className="h-5 w-5 mr-2" />
              Suivi en temps réel - Mouvement GPS
            </h3>
            <p className="text-sm text-base-content/70">
              Suivez le mouvement de votre colis en temps réel sur la carte ci-dessous
            </p>
          </div>
          <div className="card-body">
            <ShipmentMap shipment={trackingResult.shipment} className="w-full" />
          </div>
        </div>
      </div>}
    </div>
    {/* Additional Info Section */}
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">
                Besoin d'aide ?
              </h2>
              <p className="text-base-content/70 mb-4">
                Si vous avez des questions sur votre colis ou rencontrez des problèmes
                avec le suivi, notre équipe de service client est là pour vous aider.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-primary mr-2" />
                  <span className="text-base-content">+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center">
                  <MailIcon className="h-5 w-5 text-info mr-2" />
                  <span className="text-base-content">support@colisselect.com</span>
                </div>
              </div>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">
                  Contacter le support
                </button>
              </div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">
                FAQ Suivi
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-base-content">
                    How long does it take to update the status?
                  </h3>
                  <p className="text-base-content/70 text-sm mt-1">
                    Status updates are generally performed within 2-4 hours
                    following each step of the shipping process.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-base-content">
                    What to do if my package is marked as "Delayed"?
                  </h3>
                  <p className="text-base-content/70 text-sm mt-1">
                    A delay can be due to various reasons. Please wait 24 hours
                    for an update or contact our customer service.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-base-content">
                    How can I track multiple packages at once?
                  </h3>
                  <p className="text-base-content/70 text-sm mt-1">
                    To track multiple packages, please log into your customer
                    account or contact our customer service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
};