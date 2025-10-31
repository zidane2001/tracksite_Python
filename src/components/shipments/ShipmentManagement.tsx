import React, { useEffect, useState } from 'react';
import { PlusIcon, SearchIcon, EyeIcon, TrashIcon, PencilIcon, PackageIcon, HistoryIcon } from 'lucide-react';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../../utils/storage';
import { calculateShipmentWeights, PackageInput } from '../../utils/weight';
import { AddressAutocomplete } from './AddressAutocomplete';
import { toCsv, downloadCsv } from '../../utils/csv';
import { shipmentsApi, Shipment, API_BASE_URL } from '../../utils/api';
import { TrackingHistoryManagement } from './TrackingHistoryManagement';
export const ShipmentManagement = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [newPackages, setNewPackages] = useState<PackageInput[]>([{ weightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0, quantity: 1 }]);
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newShipperName, setNewShipperName] = useState('');
  const [newShipperAddress, setNewShipperAddress] = useState('');
  const [newShipperPhone, setNewShipperPhone] = useState('');
  const [newShipperEmail, setNewShipperEmail] = useState('');
  const [newReceiverName, setNewReceiverName] = useState('');
  const [newReceiverAddress, setNewReceiverAddress] = useState('');
  const [newReceiverPhone, setNewReceiverPhone] = useState('');
  const [newReceiverEmail, setNewReceiverEmail] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newPaymentMode, setNewPaymentMode] = useState('Cash');
  const [newTotalFreight, setNewTotalFreight] = useState(0);
  const [newExpectedDelivery, setNewExpectedDelivery] = useState('');
  const [newDepartureTime, setNewDepartureTime] = useState('');
  const [newPickupDate, setNewPickupDate] = useState('');
  const [newPickupTime, setNewPickupTime] = useState('');
  const [newComments, setNewComments] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [divisor, setDivisor] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const data = await shipmentsApi.getAll();
      setShipments(data);
      // Save to localStorage as backup
      saveToStorage(STORAGE_KEYS.shipments, data);
    } catch (error) {
      console.error('Failed to load shipments:', error);
      // Fallback to localStorage
      const fallback = loadFromStorage<Shipment[]>(STORAGE_KEYS.shipments, []);
      setShipments(fallback);
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = (shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         (shipment.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         (shipment.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredShipments.length / pageSize);
  const paginatedShipments = filteredShipments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteShipment = async (id: number) => {
    try {
      await shipmentsApi.delete(id);
      setShipments(shipments.filter(shipment => shipment.id !== id));
    } catch (error) {
      console.error('Failed to delete shipment:', error);
      // Fallback to local storage
      const updated = shipments.filter(shipment => shipment.id !== id);
      setShipments(updated);
      saveToStorage(STORAGE_KEYS.shipments, updated);
    }
  };

  const handleConfirmShipment = async (id: number) => {
    // For admin-created shipments, they are already confirmed, so just update status
    try {
      // First, generate a tracking number and update the shipment
      const response = await fetch(`${API_BASE_URL}/api/shipments/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_freight: 0, // Admin can set freight cost
          expected_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
          comments: 'Confirmed by admin'
        })
      });

      if (response.ok) {
        const result = await response.json();
        loadShipments(); // Reload shipments
        setNotification({type: 'success', message: `Expédition confirmée avec succès. Numéro de suivi: ${result.tracking_number}`});
        setTimeout(() => setNotification(null), 5000);
      } else {
        throw new Error('Confirmation failed');
      }
    } catch (error) {
      console.error('Failed to confirm shipment:', error);
      setNotification({type: 'error', message: 'Erreur lors de la confirmation.'});
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleRejectShipment = async (id: number) => {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      try {
        await fetch(`http://localhost:3005/api/shipments/${id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
        loadShipments(); // Reload shipments
        setNotification({type: 'success', message: 'Expédition rejetée.'});
        setTimeout(() => setNotification(null), 5000);
      } catch (error) {
        console.error('Failed to reject shipment:', error);
        setNotification({type: 'error', message: 'Erreur lors du rejet.'});
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };
  const addPackageRow = () => {
    setNewPackages([...newPackages, { weightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0, quantity: 1 }]);
  };
  const removePackageRow = (index: number) => {
    setNewPackages(newPackages.filter((_, i) => i !== index));
  };
  const updatePackageRow = (index: number, field: keyof PackageInput, value: number) => {
    const copy = [...newPackages];
    copy[index] = { ...copy[index], [field]: value } as PackageInput;
    setNewPackages(copy);
  };
  const handleCreateShipment = async () => {
    // Validation
    if (!newShipperName || !newShipperEmail || !newShipperPhone || !newReceiverName || !newOrigin || !newDestination) {
      setNotification({type: 'error', message: 'Veuillez remplir tous les champs obligatoires.'});
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    const { taxedWeightKg } = calculateShipmentWeights(newPackages, divisor);

    try {
      // Admin-created shipments go directly to processing status
      const response = await fetch(`${API_BASE_URL}/api/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Request': 'true'
        },
        body: JSON.stringify({
          shipper_name: newShipperName,
          shipper_address: newShipperAddress,
          shipper_phone: newShipperPhone,
          shipper_email: newShipperEmail,
          receiver_name: newReceiverName,
          receiver_address: newReceiverAddress,
          receiver_phone: newReceiverPhone,
          receiver_email: newReceiverEmail,
          origin: newOrigin,
          destination: newDestination,
          packages: newPackages.reduce((sum, p) => sum + Math.max(1, p.quantity || 1), 0),
          total_weight: taxedWeightKg,
          product: newProduct,
          quantity: newQuantity,
          payment_mode: newPaymentMode,
          total_freight: newTotalFreight,
          expected_delivery: newExpectedDelivery,
          departure_time: newDepartureTime,
          pickup_date: newPickupDate,
          pickup_time: newPickupTime,
          comments: newComments,
          date_created: new Date().toISOString().slice(0, 10)
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Reload shipments from API instead of adding locally
        await loadShipments();
        setIsAddOpen(false);
        setNewPackages([{ weightKg: 0, lengthCm: 0, widthCm: 0, heightCm: 0, quantity: 1 }]);
        setNewOrigin('');
        setNewDestination('');
        setNewShipperName('');
        setNewShipperAddress('');
        setNewShipperPhone('');
        setNewShipperEmail('');
        setNewReceiverName('');
        setNewReceiverAddress('');
        setNewReceiverPhone('');
        setNewReceiverEmail('');
        setNewProduct('');
        setNewQuantity(1);
        setNewPaymentMode('Cash');
        setNewTotalFreight(0);
        setNewExpectedDelivery('');
        setNewDepartureTime('');
        setNewPickupDate('');
        setNewPickupTime('');
        setNewComments('');
        setNotification({type: 'success', message: `Expédition créée avec succès. Numéro de suivi: ${result.tracking_number}`});
        setTimeout(() => setNotification(null), 5000);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to create shipment:', error);
      setNotification({type: 'error', message: 'Erreur lors de la création de l\'expédition.'});
      setTimeout(() => setNotification(null), 5000);
      // Fallback to local storage
      const fallbackShipment: Shipment = {
        id: Date.now(),
        tracking_number: `SHIP${Math.floor(100000000000 + Math.random() * 899999999999)}-COLISSELECT`,
        shipper_name: newShipperName,
        shipper_address: newShipperAddress,
        shipper_phone: newShipperPhone,
        shipper_email: newShipperEmail,
        receiver_name: newReceiverName,
        receiver_address: newReceiverAddress,
        receiver_phone: newReceiverPhone,
        receiver_email: newReceiverEmail,
        origin: newOrigin,
        destination: newDestination,
        status: 'processing',
        packages: newPackages.reduce((sum, p) => sum + Math.max(1, p.quantity || 1), 0),
        total_weight: taxedWeightKg,
        product: newProduct,
        quantity: newQuantity,
        payment_mode: newPaymentMode,
        total_freight: newTotalFreight,
        expected_delivery: newExpectedDelivery,
        departure_time: newDepartureTime,
        pickup_date: newPickupDate,
        pickup_time: newPickupTime,
        comments: newComments,
        date_created: new Date().toISOString().slice(0, 10)
      };
      setShipments([fallbackShipment, ...shipments]);
      saveToStorage(STORAGE_KEYS.shipments, [fallbackShipment, ...shipments]);
    }
  };
  useEffect(() => {
    saveToStorage<Shipment[]>(STORAGE_KEYS.shipments, shipments);
  }, [shipments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleEditShipment = async () => {
    if (editingShipment && editingShipment.tracking_number && editingShipment.origin && editingShipment.destination) {
      try {
        await shipmentsApi.update(editingShipment.id, {
          tracking_number: editingShipment.tracking_number,
          shipper_name: editingShipment.shipper_name,
          shipper_address: editingShipment.shipper_address,
          shipper_phone: editingShipment.shipper_phone,
          shipper_email: editingShipment.shipper_email,
          receiver_name: editingShipment.receiver_name,
          receiver_address: editingShipment.receiver_address,
          receiver_phone: editingShipment.receiver_phone,
          receiver_email: editingShipment.receiver_email,
          origin: editingShipment.origin,
          destination: editingShipment.destination,
          status: editingShipment.status,
          packages: editingShipment.packages,
          total_weight: editingShipment.total_weight,
          product: editingShipment.product,
          quantity: editingShipment.quantity,
          payment_mode: editingShipment.payment_mode,
          total_freight: editingShipment.total_freight,
          expected_delivery: editingShipment.expected_delivery,
          departure_time: editingShipment.departure_time,
          pickup_date: editingShipment.pickup_date,
          pickup_time: editingShipment.pickup_time,
          comments: editingShipment.comments,
          date_created: editingShipment.date_created
        });
        setShipments(shipments.map(shipment => shipment.id === editingShipment.id ? editingShipment : shipment));
        setIsEditOpen(false);
        setEditingShipment(null);
      } catch (error) {
        console.error('Failed to update shipment:', error);
        // Fallback to local storage
        const updated = shipments.map(shipment => shipment.id === editingShipment.id ? editingShipment : shipment);
        setShipments(updated);
        saveToStorage(STORAGE_KEYS.shipments, updated);
      }
    }
  };

  const openEditModal = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsEditOpen(true);
  };

  const openTrackingModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsTrackingOpen(true);
  };
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      case 'pending_confirmation':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  const exportShipmentsCsv = () => {
    const csv = toCsv(filteredShipments.map(s => ({
      id: s.id,
      trackingNumber: s.tracking_number,
      origin: s.origin,
      destination: s.destination,
      status: s.status,
      packages: s.packages,
      totalWeight: s.total_weight,
      dateCreated: s.date_created
    })), ['id', 'trackingNumber', 'origin', 'destination', 'status', 'packages', 'totalWeight', 'dateCreated']);
    downloadCsv('shipments.csv', csv);
  };
  return (
    <div className="p-4 md:p-6">
    {notification && (
      <div className="toast toast-top toast-end z-50">
        <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          <span>{notification.message}</span>
        </div>
      </div>
    )}
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Shipment Management
        </h1>
        <p className="text-base-content/70 text-sm md:text-base">
          Manage all your shipments in one place
        </p>
        {loading && <div className="loading loading-spinner loading-sm text-primary mt-2"></div>}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
        <button
          className="btn btn-outline btn-primary btn-sm md:btn-md"
          onClick={exportShipmentsCsv}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
        <button
          className="btn btn-primary btn-sm md:btn-md"
          onClick={() => setIsAddOpen(true)}
        >
          <PlusIcon size={16} className="mr-2" />
          Add Shipment
        </button>
      </div>
    </div>
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-3 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="form-control flex-1 max-w-md">
            <label className="input input-bordered flex items-center gap-2">
              <SearchIcon size={18} />
              <input
                type="text"
                className="grow"
                placeholder="Search by tracking #, origin, destination..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <select
              className="select select-bordered select-sm md:select-md w-full sm:w-auto"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending_confirmation">Pending Confirmation</option>
              <option value="processing">Processing</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Tracking #</th>
              <th className="hidden sm:table-cell">Requester</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Status</th>
              <th className="hidden md:table-cell">Packages</th>
              <th className="hidden lg:table-cell">Weight</th>
              <th className="hidden xl:table-cell">Date Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedShipments.map(shipment => <tr key={shipment.id}>
              <td className="font-medium">
                <div className="max-w-20 md:max-w-none truncate">{shipment.tracking_number}</div>
              </td>
              <td className="hidden sm:table-cell">
                <div>
                  <div className="font-medium truncate max-w-24 md:max-w-none">{shipment.shipper_name}</div>
                  <div className="text-base-content/60 text-xs truncate max-w-24 md:max-w-none">{shipment.shipper_email}</div>
                </div>
              </td>
              <td className="truncate max-w-16 md:max-w-none">{shipment.origin}</td>
              <td className="truncate max-w-16 md:max-w-none">{shipment.destination}</td>
              <td>
                <div className={`badge ${getStatusBadgeClass(shipment.status)} badge-sm`}>
                  {formatStatus(shipment.status)}
                </div>
              </td>
              <td className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <PackageIcon size={14} />
                  <span>{shipment.packages}</span>
                </div>
              </td>
              <td className="hidden lg:table-cell">
                {shipment.total_weight} kg
              </td>
              <td className="hidden xl:table-cell">{shipment.date_created}</td>
              <td>
                <div className="flex flex-wrap gap-1 justify-end">
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    title="View Details & Copy Tracking"
                    onClick={() => {
                      // Copy tracking number to clipboard
                      const copyToClipboard = (text: string) => {
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(text).then(() => {
                            showCopyNotification();
                          }).catch(() => {
                            fallbackCopy(text);
                          });
                        } else {
                          fallbackCopy(text);
                        }
                      };

                      const fallbackCopy = (text: string) => {
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        showCopyNotification();
                      };

                      const showCopyNotification = () => {
                        setNotification({type: 'success', message: 'Copié !'});
                        setTimeout(() => setNotification(null), 1500);
                      };

                      copyToClipboard(shipment.tracking_number);
                    }}
                  >
                    <EyeIcon size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    title="Tracking History"
                    onClick={() => openTrackingModal(shipment)}
                  >
                    <HistoryIcon size={16} />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    title="Edit Shipment"
                    onClick={() => openEditModal(shipment)}
                  >
                    <PencilIcon size={16} />
                  </button>
                  {shipment.status === 'pending_confirmation' && (
                    <>
                      <button
                        className="btn btn-success btn-xs btn-circle"
                        title="Confirm Shipment"
                        onClick={() => handleConfirmShipment(shipment.id)}
                      >
                        ✓
                      </button>
                      <button
                        className="btn btn-error btn-xs btn-circle"
                        title="Reject Shipment"
                        onClick={() => handleRejectShipment(shipment.id)}
                      >
                        ✗
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn-ghost btn-xs btn-circle text-error"
                    title="Delete Shipment"
                    onClick={() => handleDeleteShipment(shipment.id)}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </td>
            </tr>)}
            {filteredShipments.length === 0 && <tr>
              <td colSpan={9} className="text-center py-8 text-base-content/60">
                No shipments found
              </td>
            </tr>}
          </tbody>
        </table>
      </div>
      <div className="card-actions justify-between items-center p-4">
        <div className="text-sm text-base-content/70">
          Showing {paginatedShipments.length} of {filteredShipments.length} shipments (Page {currentPage} of {totalPages})
        </div>
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {isAddOpen && <div className="modal modal-open">
        <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg">Create Shipment</h3>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Origin</label>
                <AddressAutocomplete placeholder="e.g. Paris, FR" value={newOrigin} onChange={setNewOrigin} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Destination</label>
                <AddressAutocomplete placeholder="e.g. Lyon, FR" value={newDestination} onChange={setNewDestination} />
              </div>
            </div>

            {/* Shipper Information */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Informations Expéditeur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newShipperName}
                    onChange={(e) => setNewShipperName(e.target.value)}
                    placeholder="Nom de l'expéditeur"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newShipperPhone}
                    onChange={(e) => setNewShipperPhone(e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newShipperEmail}
                    onChange={(e) => setNewShipperEmail(e.target.value)}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newShipperAddress}
                    onChange={(e) => setNewShipperAddress(e.target.value)}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </div>

            {/* Receiver Information */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Informations Destinataire</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newReceiverName}
                    onChange={(e) => setNewReceiverName(e.target.value)}
                    placeholder="Nom du destinataire"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newReceiverPhone}
                    onChange={(e) => setNewReceiverPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newReceiverEmail}
                    onChange={(e) => setNewReceiverEmail(e.target.value)}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newReceiverAddress}
                    onChange={(e) => setNewReceiverAddress(e.target.value)}
                    placeholder="Adresse complète de livraison"
                  />
                </div>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Détails de l'expédition</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm text-gray-700 mb-1">Produit</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    placeholder="Description du produit"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mode de paiement</label>
                  <select
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newPaymentMode}
                    onChange={(e) => setNewPaymentMode(e.target.value)}
                  >
                    <option value="Cash">Espèces</option>
                    <option value="Card">Carte bancaire</option>
                    <option value="Transfer">Virement</option>
                    <option value="Check">Chèque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Frais de port (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newTotalFreight}
                    onChange={(e) => setNewTotalFreight(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date de livraison estimée</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newExpectedDelivery}
                    onChange={(e) => setNewExpectedDelivery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Heure de départ</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newDepartureTime}
                    onChange={(e) => setNewDepartureTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date de ramassage</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newPickupDate}
                    onChange={(e) => setNewPickupDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Heure de ramassage</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newPickupTime}
                    onChange={(e) => setNewPickupTime(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm text-gray-700 mb-1">Commentaires</label>
                  <textarea
                    className="w-full p-2 border rounded-lg text-sm md:text-base"
                    value={newComments}
                    onChange={(e) => setNewComments(e.target.value)}
                    placeholder="Commentaires supplémentaires"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Diviseur volumétrique</label>
              <input type="number" className="w-40 p-2 border rounded-lg text-sm md:text-base" value={divisor} onChange={e => setDivisor(parseInt(e.target.value) || 5000)} />
              <span className="text-xs text-gray-500 ml-2">Par défaut 5000 (air), 6000 (certains transporteurs)</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Packages</h3>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg" onClick={addPackageRow}>Add Package</button>
              </div>
              <div className="space-y-3">
                {newPackages.map((pkg, idx) => <div key={idx} className="grid grid-cols-6 gap-2 items-end">
                  <div>
                    <label className="block text-xs text-gray-600">Weight (kg)</label>
                    <input type="number" step="0.01" className="w-full p-2 border rounded-lg" value={pkg.weightKg} onChange={e => updatePackageRow(idx, 'weightKg', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">L (cm)</label>
                    <input type="number" step="0.1" className="w-full p-2 border rounded-lg" value={pkg.lengthCm} onChange={e => updatePackageRow(idx, 'lengthCm', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">W (cm)</label>
                    <input type="number" step="0.1" className="w-full p-2 border rounded-lg" value={pkg.widthCm} onChange={e => updatePackageRow(idx, 'widthCm', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">H (cm)</label>
                    <input type="number" step="0.1" className="w-full p-2 border rounded-lg" value={pkg.heightCm} onChange={e => updatePackageRow(idx, 'heightCm', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Qty</label>
                    <input type="number" min="1" className="w-full p-2 border rounded-lg" value={pkg.quantity} onChange={e => updatePackageRow(idx, 'quantity', parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="flex items-end">
                    <button className="px-3 py-2 border rounded-lg text-red-600" onClick={() => removePackageRow(idx)}>Remove</button>
                  </div>
                </div>)}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {(() => {
                  const w = calculateShipmentWeights(newPackages, divisor);
                  return <span>Actual: {w.actualWeightKg} kg • Volumetric: {w.volumetricWeightKg} kg • Taxed: <strong>{w.taxedWeightKg} kg</strong></span>;
                })()}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 md:mt-6">
              <button className="btn btn-ghost order-2 sm:order-1" onClick={() => setIsAddOpen(false)}>Annuler</button>
              <button className="btn btn-primary order-1 sm:order-2" onClick={handleCreateShipment}>Créer le colis</button>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={() => setIsAddOpen(false)}>Close</button>
            </form>
          </div>
        </div>
      </div>}
      {isEditOpen && editingShipment && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg">Edit Shipment</h3>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={editingShipment.tracking_number}
                    onChange={(e) => setEditingShipment({ ...editingShipment, tracking_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={editingShipment.status}
                    onChange={(e) => setEditingShipment({ ...editingShipment, status: e.target.value as Shipment['status'] })}
                  >
                    <option value="pending_confirmation">Pending Confirmation</option>
                    <option value="processing">Processing</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Origin</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={editingShipment.origin}
                    onChange={(e) => setEditingShipment({ ...editingShipment, origin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={editingShipment.destination}
                    onChange={(e) => setEditingShipment({ ...editingShipment, destination: e.target.value })}
                  />
                </div>
              </div>

              {/* Edit Shipper Information */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Informations Expéditeur</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.shipper_name}
                      onChange={(e) => setEditingShipment({ ...editingShipment, shipper_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.shipper_phone}
                      onChange={(e) => setEditingShipment({ ...editingShipment, shipper_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.shipper_email}
                      onChange={(e) => setEditingShipment({ ...editingShipment, shipper_email: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.shipper_address}
                      onChange={(e) => setEditingShipment({ ...editingShipment, shipper_address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Receiver Information */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Informations Destinataire</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.receiver_name}
                      onChange={(e) => setEditingShipment({ ...editingShipment, receiver_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.receiver_phone}
                      onChange={(e) => setEditingShipment({ ...editingShipment, receiver_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.receiver_email}
                      onChange={(e) => setEditingShipment({ ...editingShipment, receiver_email: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.receiver_address}
                      onChange={(e) => setEditingShipment({ ...editingShipment, receiver_address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Shipment Details */}
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Détails de l'expédition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-sm text-gray-700 mb-1">Produit</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.product || ''}
                      onChange={(e) => setEditingShipment({ ...editingShipment, product: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.quantity || 1}
                      onChange={(e) => setEditingShipment({ ...editingShipment, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Mode de paiement</label>
                    <select
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.payment_mode || 'Cash'}
                      onChange={(e) => setEditingShipment({ ...editingShipment, payment_mode: e.target.value })}
                    >
                      <option value="Cash">Espèces</option>
                      <option value="Card">Carte bancaire</option>
                      <option value="Transfer">Virement</option>
                      <option value="Check">Chèque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Frais de port (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.total_freight || 0}
                      onChange={(e) => setEditingShipment({ ...editingShipment, total_freight: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Date de livraison estimée</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.expected_delivery || ''}
                      onChange={(e) => setEditingShipment({ ...editingShipment, expected_delivery: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Heure de départ</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.departure_time ? editingShipment.departure_time.replace(' ', 'T') : ''}
                      onChange={(e) => setEditingShipment({ ...editingShipment, departure_time: e.target.value.replace('T', ' ') })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Date de ramassage</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.pickup_date || ''}
                      onChange={(e) => setEditingShipment({ ...editingShipment, pickup_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Heure de ramassage</label>
                    <input
                      type="time"
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.pickup_time || ''}
                      onChange={(e) => setEditingShipment({ ...editingShipment, pickup_time: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-sm text-gray-700 mb-1">Commentaires</label>
                    <textarea
                      className="w-full p-2 border rounded-lg text-sm md:text-base"
                      value={editingShipment.comments || ''}
                      onChange={(e) => setEditingShipment({ ...editingShipment, comments: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Packages</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded-lg"
                    value={editingShipment.packages}
                    onChange={(e) => setEditingShipment({ ...editingShipment, packages: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border rounded-lg"
                    value={editingShipment.total_weight}
                    onChange={(e) => setEditingShipment({ ...editingShipment, total_weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date Created</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={editingShipment.date_created}
                    onChange={(e) => setEditingShipment({ ...editingShipment, date_created: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 md:mt-6">
                <button
                  className="btn btn-ghost order-2 sm:order-1"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingShipment(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary order-1 sm:order-2"
                  onClick={handleEditShipment}
                >
                  Mettre à jour
                </button>
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn" onClick={() => {
                  setIsEditOpen(false);
                  setEditingShipment(null);
                }}>Close</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tracking History Modal */}
      {isTrackingOpen && selectedShipment && (
        <div className="modal modal-open">
          <div className="modal-box max-w-6xl max-h-[90vh] overflow-hidden">
            <h3 className="font-bold text-lg">Tracking History - {selectedShipment.tracking_number}</h3>
            <div className="py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <TrackingHistoryManagement
                shipmentId={selectedShipment.id}
                trackingNumber={selectedShipment.tracking_number}
              />
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn" onClick={() => {
                  setIsTrackingOpen(false);
                  setSelectedShipment(null);
                }}>Close</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
 );
};