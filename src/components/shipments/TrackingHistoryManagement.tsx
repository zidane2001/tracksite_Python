import React, { useEffect, useState } from 'react';
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon, MapPinIcon } from 'lucide-react';
import { trackingHistoryApi, TrackingHistory } from '../../utils/api';

interface TrackingHistoryManagementProps {
  shipmentId: number;
  trackingNumber: string;
}

export const TrackingHistoryManagement: React.FC<TrackingHistoryManagementProps> = ({
  shipmentId,
  trackingNumber
}) => {
  const [history, setHistory] = useState<TrackingHistory[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<TrackingHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [newHistory, setNewHistory] = useState<Partial<TrackingHistory>>({
    date_time: new Date().toISOString().slice(0, 16),
    location: '',
    status: 'processing',
    description: '',
    latitude: undefined,
    longitude: undefined
  });

  useEffect(() => {
    loadHistory();
  }, [shipmentId]);

  const loadHistory = async () => {
    try {
      const data = await trackingHistoryApi.getAll(shipmentId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load tracking history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHistory = async () => {
    if (!newHistory.location || !newHistory.status) {
      alert('Location and status are required');
      return;
    }

    try {
      await trackingHistoryApi.create(shipmentId, newHistory as Omit<TrackingHistory, 'id' | 'shipment_id'>);
      setIsAddOpen(false);
      setNewHistory({
        date_time: new Date().toISOString().slice(0, 16),
        location: '',
        status: 'processing',
        description: '',
        latitude: undefined,
        longitude: undefined
      });
      loadHistory();
    } catch (error) {
      console.error('Failed to create tracking history:', error);
    }
  };

  const handleUpdateHistory = async () => {
    if (!editingHistory || !editingHistory.location || !editingHistory.status) {
      alert('Location and status are required');
      return;
    }

    try {
      await trackingHistoryApi.update(editingHistory.id!, editingHistory);
      setIsEditOpen(false);
      setEditingHistory(null);
      loadHistory();
    } catch (error) {
      console.error('Failed to update tracking history:', error);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tracking entry?')) return;

    try {
      await trackingHistoryApi.delete(id);
      loadHistory();
    } catch (error) {
      console.error('Failed to delete tracking history:', error);
    }
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <div className="text-center py-8">Loading tracking history...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tracking History</h2>
            <p className="text-gray-600">Manage tracking updates for {trackingNumber}</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setIsAddOpen(true)}
          >
            <PlusIcon size={18} className="mr-2" />
            Add Update
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="px-6 py-3 border-b font-medium">Date & Time</th>
              <th className="px-6 py-3 border-b font-medium">Location</th>
              <th className="px-6 py-3 border-b font-medium">Status</th>
              <th className="px-6 py-3 border-b font-medium">Description</th>
              <th className="px-6 py-3 border-b font-medium">Coordinates</th>
              <th className="px-6 py-3 border-b font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                  {new Date(entry.date_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 border-b">{entry.location}</td>
                <td className="px-6 py-4 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(entry.status)}`}>
                    {formatStatus(entry.status)}
                  </span>
                </td>
                <td className="px-6 py-4 border-b">{entry.description}</td>
                <td className="px-6 py-4 border-b">
                  {entry.latitude && entry.longitude ? (
                    <div className="flex items-center">
                      <MapPinIcon size={14} className="mr-1 text-gray-500" />
                      {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 border-b text-right">
                  <button
                    className="text-green-600 hover:text-green-800 p-1 ml-2"
                    title="Edit"
                    onClick={() => {
                      setEditingHistory(entry);
                      setIsEditOpen(true);
                    }}
                  >
                    <PencilIcon size={16} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-1 ml-2"
                    title="Delete"
                    onClick={() => handleDeleteHistory(entry.id!)}
                  >
                    <TrashIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No tracking history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Tracking Update</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-lg"
                    value={newHistory.date_time}
                    onChange={(e) => setNewHistory({ ...newHistory, date_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={newHistory.location}
                    onChange={(e) => setNewHistory({ ...newHistory, location: e.target.value })}
                    placeholder="e.g. Paris Warehouse"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status *</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={newHistory.status}
                    onChange={(e) => setNewHistory({ ...newHistory, status: e.target.value })}
                  >
                    <option value="processing">Processing</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    value={newHistory.description}
                    onChange={(e) => setNewHistory({ ...newHistory, description: e.target.value })}
                    placeholder="Description of the update"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full p-2 border rounded-lg"
                      value={newHistory.latitude || ''}
                      onChange={(e) => setNewHistory({ ...newHistory, latitude: parseFloat(e.target.value) || undefined })}
                      placeholder="48.8566"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full p-2 border rounded-lg"
                      value={newHistory.longitude || ''}
                      onChange={(e) => setNewHistory({ ...newHistory, longitude: parseFloat(e.target.value) || undefined })}
                      placeholder="2.3522"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 border rounded-lg"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={handleCreateHistory}
                >
                  Add Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editingHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Tracking Update</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-lg"
                    value={editingHistory.date_time.slice(0, 16)}
                    onChange={(e) => setEditingHistory({ ...editingHistory, date_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={editingHistory.location}
                    onChange={(e) => setEditingHistory({ ...editingHistory, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status *</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={editingHistory.status}
                    onChange={(e) => setEditingHistory({ ...editingHistory, status: e.target.value })}
                  >
                    <option value="processing">Processing</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    value={editingHistory.description}
                    onChange={(e) => setEditingHistory({ ...editingHistory, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full p-2 border rounded-lg"
                      value={editingHistory.latitude || ''}
                      onChange={(e) => setEditingHistory({ ...editingHistory, latitude: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full p-2 border rounded-lg"
                      value={editingHistory.longitude || ''}
                      onChange={(e) => setEditingHistory({ ...editingHistory, longitude: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 border rounded-lg"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingHistory(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={handleUpdateHistory}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};