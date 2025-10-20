import React, { useEffect, useState } from 'react';
import { BarChart3Icon, TrendingUpIcon, PackageIcon, DollarSignIcon, CalendarIcon, DownloadIcon } from 'lucide-react';
import { shipmentsApi, Shipment } from '../../utils/api';

interface ReportData {
  totalShipments: number;
  totalRevenue: number;
  averageShipmentValue: number;
  shipmentsByStatus: { [key: string]: number };
  monthlyRevenue: { month: string; revenue: number }[];
  topDestinations: { destination: string; count: number }[];
}

export const ReportsManagement: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const shipments = await shipmentsApi.getAll();

      // Filter by date range
      const filteredShipments = shipments.filter(shipment => {
        const shipmentDate = new Date(shipment.date_created);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return shipmentDate >= startDate && shipmentDate <= endDate;
      });

      // Calculate report data
      const totalShipments = filteredShipments.length;
      const totalRevenue = filteredShipments.reduce((sum, s) => sum + (s.total_freight || 0), 0);
      const averageShipmentValue = totalShipments > 0 ? totalRevenue / totalShipments : 0;

      // Shipments by status
      const shipmentsByStatus: { [key: string]: number } = {};
      filteredShipments.forEach(shipment => {
        shipmentsByStatus[shipment.status] = (shipmentsByStatus[shipment.status] || 0) + 1;
      });

      // Monthly revenue (simplified)
      const monthlyRevenue = generateMonthlyRevenue(filteredShipments);

      // Top destinations
      const destinationCount: { [key: string]: number } = {};
      filteredShipments.forEach(shipment => {
        destinationCount[shipment.destination] = (destinationCount[shipment.destination] || 0) + 1;
      });
      const topDestinations = Object.entries(destinationCount)
        .map(([destination, count]) => ({ destination, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setReportData({
        totalShipments,
        totalRevenue,
        averageShipmentValue,
        shipmentsByStatus,
        monthlyRevenue,
        topDestinations
      });
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenue = (shipments: Shipment[]) => {
    const monthlyData: { [key: string]: number } = {};

    shipments.forEach(shipment => {
      const date = new Date(shipment.date_created);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (shipment.total_freight || 0);
    });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const exportReport = () => {
    if (!reportData) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Total Shipments', reportData.totalShipments.toString()],
      ['Total Revenue', `€${reportData.totalRevenue.toFixed(2)}`],
      ['Average Shipment Value', `€${reportData.averageShipmentValue.toFixed(2)}`],
      [''],
      ['Status', 'Count'],
      ...Object.entries(reportData.shipmentsByStatus).map(([status, count]) => [status, count.toString()]),
      [''],
      ['Destination', 'Count'],
      ...reportData.topDestinations.map(dest => [dest.destination, dest.count.toString()])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive shipping reports and analytics</p>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <span className="self-center text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DownloadIcon size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <PackageIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{reportData?.totalShipments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSignIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{reportData?.totalRevenue.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Shipment Value</p>
              <p className="text-2xl font-bold text-gray-900">€{reportData?.averageShipmentValue.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <BarChart3Icon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">
                {(reportData?.shipmentsByStatus.processing || 0) +
                 (reportData?.shipmentsByStatus.picked_up || 0) +
                 (reportData?.shipmentsByStatus.in_transit || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipments by Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipments by Status</h3>
          <div className="space-y-3">
            {reportData?.shipmentsByStatus && Object.entries(reportData.shipmentsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Destinations</h3>
          <div className="space-y-3">
            {reportData?.topDestinations.map((dest, index) => (
              <div key={dest.destination} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium">{dest.destination}</span>
                </div>
                <span className="font-semibold">{dest.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3Icon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Revenue chart visualization</p>
            <p className="text-sm text-gray-400 mt-1">Chart implementation can be added with a library like Chart.js or Recharts</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reportData?.monthlyRevenue.slice(-6).map((month) => (
            <div key={month.month} className="text-center">
              <p className="text-sm text-gray-600">{month.month}</p>
              <p className="font-semibold">€{month.revenue.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};