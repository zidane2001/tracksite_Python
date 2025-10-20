import React, { useEffect, useState } from 'react';
import { FileTextIcon, DownloadIcon, EyeIcon, PlusIcon, SearchIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
import { shipmentsApi, Shipment } from '../../utils/api';

interface Invoice {
  id: number;
  shipment_id: number;
  invoice_number: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string;
  shipment?: Shipment;
}

export const InvoicesManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const shipmentsData = await shipmentsApi.getAll();
      setShipments(shipmentsData);

      // Generate invoices from shipments
      const invoicesData = shipmentsData.map(shipment => ({
        id: shipment.id,
        shipment_id: shipment.id,
        invoice_number: `INV-${shipment.id.toString().padStart(6, '0')}`,
        amount: shipment.total_freight || 0,
        status: getInvoiceStatus(shipment),
        issue_date: shipment.date_created,
        due_date: calculateDueDate(shipment.date_created),
        shipment: shipment
      }));

      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceStatus = (shipment: Shipment): 'pending' | 'paid' | 'overdue' => {
    if (shipment.status === 'delivered') return 'paid';
    if (shipment.status === 'delayed') return 'overdue';
    return 'pending';
  };

  const calculateDueDate = (issueDate: string): string => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 30); // 30 days payment terms
    return date.toISOString().split('T')[0];
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.shipment?.tracking_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const exportInvoicesCsv = () => {
    const csvContent = [
      ['Numéro Facture', 'Numéro Suivi', 'Montant', 'Statut', 'Date Émission', 'Date Échéance', 'Expéditeur', 'Destinataire'],
      ...filteredInvoices.map(invoice => [
        invoice.invoice_number,
        invoice.shipment?.tracking_number || '',
        `€${invoice.amount.toFixed(2)}`,
        formatStatus(invoice.status),
        invoice.issue_date,
        invoice.due_date,
        invoice.shipment?.shipper_name || '',
        invoice.shipment?.receiver_name || ''
      ])
    ];

    const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factures-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    // Simple PDF generation placeholder - in real app, use a library like jsPDF
    const content = `
FACTURE - ${invoice.invoice_number}

Numéro de suivi: ${invoice.shipment?.tracking_number}
Date d'émission: ${invoice.issue_date}
Date d'échéance: ${invoice.due_date}

Expéditeur: ${invoice.shipment?.shipper_name}
Adresse: ${invoice.shipment?.shipper_address}

Destinataire: ${invoice.shipment?.receiver_name}
Adresse: ${invoice.shipment?.receiver_address}

Détails:
- Produit: ${invoice.shipment?.product || 'N/A'}
- Poids: ${invoice.shipment?.total_weight}kg
- Quantité: ${invoice.shipment?.quantity || 1}

MONTANT TOTAL: €${invoice.amount.toFixed(2)}
STATUT: ${formatStatus(invoice.status)}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Factures</h1>
          <p className="text-gray-600">Gérez les factures de vos expéditions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportInvoicesCsv}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DownloadIcon size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FileTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Factures</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSignIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">
                €{invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSignIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Payées</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Rechercher par numéro de facture ou suivi..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600">Statut:</label>
            <select
              className="p-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-6 py-3 border-b font-medium">N° Facture</th>
                <th className="px-6 py-3 border-b font-medium">N° Suivi</th>
                <th className="px-6 py-3 border-b font-medium">Expéditeur</th>
                <th className="px-6 py-3 border-b font-medium">Destinataire</th>
                <th className="px-6 py-3 border-b font-medium">Montant</th>
                <th className="px-6 py-3 border-b font-medium">Statut</th>
                <th className="px-6 py-3 border-b font-medium">Échéance</th>
                <th className="px-6 py-3 border-b font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b font-medium">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 border-b">
                    {invoice.shipment?.tracking_number}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <div>
                      <div className="font-medium">{invoice.shipment?.shipper_name}</div>
                      <div className="text-xs text-gray-500">{invoice.shipment?.origin}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b">
                    <div>
                      <div className="font-medium">{invoice.shipment?.receiver_name}</div>
                      <div className="text-xs text-gray-500">{invoice.shipment?.destination}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b font-medium">
                    €{invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                      {formatStatus(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b">
                    {invoice.due_date}
                  </td>
                  <td className="px-6 py-4 border-b text-right">
                    <button
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Voir détails"
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800 p-1 ml-2"
                      title="Télécharger PDF"
                      onClick={() => generateInvoicePDF(invoice)}
                    >
                      <DownloadIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Aucune facture trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};