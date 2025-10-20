import React, { useState, useEffect } from 'react';
import { PackageIcon, TruckIcon, ShipIcon, PlaneIcon, ArrowRightIcon, ChevronRightIcon, CheckCircleIcon, UserIcon, MailIcon, PhoneIcon, PlusIcon, XIcon, EyeIcon, HistoryIcon, LogInIcon, UserPlusIcon } from 'lucide-react';
import { shipmentsApi, AuthResponse } from '../utils/api';
import { UserLogin } from '../components/auth/UserLogin';
import { UserRegister } from '../components/auth/UserRegister';

interface UserDashboardProps {
  userShipments: UserShipment[];
  userEmail: string;
  onCancelShipment: (id: number) => void;
  onNewRequest: () => void;
  loadUserShipments: (email: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  userShipments,
  userEmail,
  onCancelShipment,
  onNewRequest,
  loadUserShipments
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: {[key: string]: string} = {
      'pending_confirmation': 'En attente',
      'processing': 'En cours',
      'delivered': 'Livré',
      'rejected': 'Refusé',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="bg-primary text-primary-content py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Mes demandes d'expédition
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Gérez vos demandes d'expédition et suivez leur statut
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Historique des demandes</h2>
            <p className="text-gray-600">Email: {userEmail}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              ← Retour
            </button>
            <button
              onClick={onNewRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <PlusIcon size={18} className="mr-2" />
              Nouvelle demande
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="px-6 py-3 border-b font-medium">N° de suivi</th>
                  <th className="px-6 py-3 border-b font-medium">Origine → Destination</th>
                  <th className="px-6 py-3 border-b font-medium">Statut</th>
                  <th className="px-6 py-3 border-b font-medium">Date de création</th>
                  <th className="px-6 py-3 border-b font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userShipments.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b font-medium">
                      {shipment.tracking_number}
                    </td>
                    <td className="px-6 py-4 border-b">
                      {shipment.origin} → {shipment.destination}
                    </td>
                    <td className="px-6 py-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(shipment.status)}`}>
                        {formatStatus(shipment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b">{shipment.date_created}</td>
                    <td className="px-6 py-4 border-b">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1" title="Voir détails">
                          <EyeIcon size={16} />
                        </button>
                        {shipment.status === 'pending_confirmation' && (
                          <button
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Annuler"
                            onClick={() => onCancelShipment(shipment.id)}
                          >
                            <XIcon size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {userShipments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucune demande trouvée. Créez votre première demande d'expédition.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
  icon: React.ReactNode;
}
interface FormData {
  origin: string;
  destination: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  packageType: string;
  shipperName: string;
  shipperEmail: string;
  shipperPhone: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  receiverEmail: string;
  product: string;
  quantity: number;
}
interface UserShipment {
  id: number;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  date_created: string;
  total_weight: number;
  product?: string;
}
export const QuotePage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    weight: 1,
    length: 30,
    width: 20,
    height: 15,
    packageType: 'package',
    shipperName: '',
    shipperEmail: '',
    shipperPhone: '',
    receiverName: '',
    receiverAddress: '',
    receiverPhone: '',
    receiverEmail: '',
    product: '',
    quantity: 1
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [userShipments, setUserShipments] = useState<UserShipment[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [userEmailForHistory, setUserEmailForHistory] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showHistoryBeforeSubmit, setShowHistoryBeforeSubmit] = useState(false);
  const [allShipments, setAllShipments] = useState<UserShipment[]>([]);
  const [userSessionShipments, setUserSessionShipments] = useState<UserShipment[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load user's session shipments (only those created in this session)
  useEffect(() => {
    const loadUserSessionShipments = async () => {
      try {
        const shipments = await shipmentsApi.getAll();
        // Filter only shipments created by this user in this session (confirmed ones)
        const sessionShipments = shipments.filter(shipment =>
          shipment.status !== 'pending_confirmation' &&
          shipment.status !== 'cancelled' &&
          shipment.status !== 'rejected' &&
          shipment.shipper_email === formData.shipperEmail &&
          userSessionShipments.some(sessionShipment => sessionShipment.id === shipment.id)
        );
        setAllShipments(sessionShipments);
      } catch (error) {
        console.error('Failed to load shipments:', error);
      }
    };
    // Only load if user has provided email and has session shipments
    if (formData.shipperEmail && userSessionShipments.length > 0) {
      loadUserSessionShipments();
    }
  }, [formData.shipperEmail, userSessionShipments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleNextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!formData.origin || !formData.destination) {
        setNotification({type: 'error', message: 'Veuillez remplir l\'origine et la destination.'});
        setTimeout(() => setNotification(null), 5000);
        return;
      }
    } else if (step === 2) {
      // Validate personal information
      if (!formData.shipperName || !formData.shipperEmail || !formData.shipperPhone ||
          !formData.receiverName || !formData.receiverEmail) {
        setNotification({type: 'error', message: 'Veuillez remplir toutes les informations personnelles obligatoires.'});
        setTimeout(() => setNotification(null), 5000);
        return;
      }
      // Load user history when email is provided
      if (formData.shipperEmail && !showHistoryBeforeSubmit) {
        loadUserShipments(formData.shipperEmail);
        setShowHistoryBeforeSubmit(true);
      }
    } else if (step === 3) {
      // Validate package details
      if (formData.weight <= 0) {
        setNotification({type: 'error', message: 'Le poids doit être supérieur à 0.'});
        setTimeout(() => setNotification(null), 5000);
        return;
      }
      // Generate shipping options
      setShippingOptions([{
        id: 'standard',
        name: 'Livraison Standard',
        description: 'Livraison économique par voie terrestre',
        price: calculatePrice('standard'),
        estimatedDelivery: '3-5 jours ouvrables',
        icon: <TruckIcon size={24} className="text-blue-600" />
      }, {
        id: 'express',
        name: 'Livraison Express',
        description: 'Livraison rapide par voie aérienne',
        price: calculatePrice('express'),
        estimatedDelivery: '1-2 jours ouvrables',
        icon: <PlaneIcon size={24} className="text-blue-600" />
      }, {
        id: 'economy',
        name: 'Livraison Économique',
        description: 'Option la plus économique pour les envois non urgents',
        price: calculatePrice('economy'),
        estimatedDelivery: '5-7 jours ouvrables',
        icon: <ShipIcon size={24} className="text-blue-600" />
      }]);
    }
    setStep(step + 1);
  };
  const handlePrevStep = () => {
    setStep(step - 1);
  };
  const calculatePrice = (type: string): number => {
    const basePrice = formData.weight * 5;
    const volume = formData.length * formData.width * formData.height / 5000;
    switch (type) {
      case 'express':
        return Math.round((basePrice * 2 + volume * 0.5) * 100) / 100;
      case 'economy':
        return Math.round((basePrice * 0.7 + volume * 0.3) * 100) / 100;
      case 'standard':
      default:
        return Math.round((basePrice + volume * 0.4) * 100) / 100;
    }
  };
  const handleSelectOption = (id: string) => {
    setSelectedOption(id);
  };
  const handleSubmit = async () => {
    // Check if user is logged in
    if (!currentUser) {
      setNotification({type: 'error', message: 'Veuillez vous connecter pour soumettre une demande.'});
      setTimeout(() => setNotification(null), 5000);
      setShowAuth(true);
      return;
    }

    // Validation
    if (!formData.shipperName || !formData.shipperEmail || !formData.shipperPhone ||
        !formData.receiverName || !formData.origin || !formData.destination) {
      setNotification({type: 'error', message: 'Veuillez remplir tous les champs obligatoires.'});
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      const created = await shipmentsApi.create({
        tracking_number: '', // Will be set by admin when confirmed
        shipper_name: formData.shipperName,
        shipper_address: '', // Could be added later
        shipper_phone: formData.shipperPhone,
        shipper_email: formData.shipperEmail,
        receiver_name: formData.receiverName,
        receiver_address: formData.receiverAddress,
        receiver_phone: formData.receiverPhone,
        receiver_email: formData.receiverEmail,
        origin: formData.origin,
        destination: formData.destination,
        status: 'pending_confirmation',
        packages: 1,
        total_weight: formData.weight,
        product: formData.product,
        quantity: formData.quantity,
        payment_mode: 'Cash',
        total_freight: 0, // Will be set by admin
        expected_delivery: '',
        departure_time: '',
        pickup_date: '',
        pickup_time: '',
        comments: `Type: ${formData.packageType}, Dimensions: ${formData.length}x${formData.width}x${formData.height}cm`,
        date_created: new Date().toISOString().slice(0, 10)
      });

      // Add this shipment to user's session shipments for tracking
      setUserSessionShipments(prev => [...prev, created]);

      setCurrentUserEmail(formData.shipperEmail);
      loadUserShipments(formData.shipperEmail);
      setNotification({type: 'success', message: 'Votre demande d\'expédition a été enregistrée et est en attente de confirmation par l\'administrateur.'});
      setTimeout(() => setNotification(null), 5000);

      // Reset form
      setStep(1);
      setFormData({
        origin: '',
        destination: '',
        weight: 1,
        length: 30,
        width: 20,
        height: 15,
        packageType: 'package',
        shipperName: '',
        shipperEmail: '',
        shipperPhone: '',
        receiverName: '',
        receiverAddress: '',
        receiverPhone: '',
        receiverEmail: '',
        product: '',
        quantity: 1
      });
      setShippingOptions([]);
      setSelectedOption('');
      // Stay on the form page instead of switching to dashboard
    } catch (error) {
      console.error('Failed to create shipment:', error);
      setNotification({type: 'error', message: 'Erreur lors de la création de l\'expédition.'});
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleLogin = (user: AuthResponse) => {
    setCurrentUser(user);
    setShowAuth(false);
    setNotification({type: 'success', message: `Bienvenue ${user.name} !`});
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegister = (user: AuthResponse) => {
    setCurrentUser(user);
    setShowAuth(false);
    setNotification({type: 'success', message: `Bienvenue ${user.name} ! Votre compte a été créé.`});
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserShipments([]);
    setAllShipments([]);
    setUserSessionShipments([]);
    setNotification({type: 'success', message: 'Vous avez été déconnecté.'});
    setTimeout(() => setNotification(null), 3000);
  };

  const loadUserShipments = async (email: string) => {
    try {
      const allShipments = await shipmentsApi.getAll();
      const userShipments = allShipments.filter(shipment => shipment.shipper_email === email);
      setUserShipments(userShipments);
      setHasHistory(userShipments.length > 0);
      setUserEmailForHistory(email);
    } catch (error) {
      console.error('Failed to load user shipments:', error);
    }
  };

  const handleCancelShipment = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      try {
        await shipmentsApi.update(id, { status: 'cancelled' });
        loadUserShipments(currentUserEmail);
        setNotification({type: 'success', message: 'Demande annulée avec succès.'});
        setTimeout(() => setNotification(null), 5000);
      } catch (error) {
        console.error('Failed to cancel shipment:', error);
        setNotification({type: 'error', message: 'Erreur lors de l\'annulation.'});
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return 'bg-orange-100 text-orange-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: {[key: string]: string} = {
      'pending_confirmation': 'En attente',
      'processing': 'En cours',
      'delivered': 'Livré',
      'rejected': 'Refusé',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  // Show auth modal if needed
  if (showAuth) {
    return (
      <div>
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}
        {authMode === 'login' ? (
          <UserLogin
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <UserRegister
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  return <div className="w-full bg-gray-50">
    {notification && (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {notification.message}
      </div>
    )}

    {!showDashboard ? (
      <>
        <div className="bg-primary text-primary-content py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Créer une demande d'expédition
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  Remplissez le formulaire ci-dessous pour créer votre demande d'expédition.
                  Elle sera examinée par notre équipe avant confirmation.
                </p>
              </div>
              <div className="ml-8">
                {currentUser ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-100">Bienvenue, {currentUser.name}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setShowAuth(true); setAuthMode('login'); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                    >
                      <LogInIcon size={16} className="mr-2" />
                      Connexion
                    </button>
                    <button
                      onClick={() => { setShowAuth(true); setAuthMode('register'); }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                    >
                      <UserPlusIcon size={16} className="mr-2" />
                      Inscription
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden -mt-8">
            {/* Progress Steps */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">
                      Origine & Destination
                    </div>
                  </div>
                </div>
                <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">Informations personnelles</div>
                  </div>
                </div>
                <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">Détails du colis</div>
                  </div>
                </div>
                <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    4
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">Confirmation</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Form Content */}
            <div className="p-6">
              {step === 1 && <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Origine et Destination
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label htmlFor="origin" className="block text-gray-700 text-sm font-medium mb-2">
                      Adresse d'origine <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="origin" name="origin" className="input input-bordered input-primary w-full text-lg py-3" placeholder="Ex: 123 Rue de Paris, 75001 Paris" value={formData.origin} onChange={handleInputChange} required />
                  </div>
                  <div className="form-control">
                    <label htmlFor="destination" className="block text-gray-700 text-sm font-medium mb-2">
                      Adresse de destination{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="destination" name="destination" className="input input-bordered input-primary w-full text-lg py-3" placeholder="Ex: 456 Avenue de Lyon, 69001 Lyon" value={formData.destination} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <button type="button" onClick={handleNextStep} className="btn btn-primary">Suivant</button>
                </div>
              </div>}
              {step === 2 && <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Informations personnelles
                </h2>
                {/* Shipper Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserIcon size={20} className="mr-2" />
                    Informations de l'expéditeur
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">Nom complet <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        value={formData.shipperName}
                        onChange={(e) => setFormData({...formData, shipperName: e.target.value})}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 flex items-center">
                        <PhoneIcon size={16} className="mr-1" />
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        value={formData.shipperPhone}
                        onChange={(e) => setFormData({...formData, shipperPhone: e.target.value})}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 flex items-center">
                        <MailIcon size={16} className="mr-1" />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        value={formData.shipperEmail}
                        onChange={(e) => setFormData({...formData, shipperEmail: e.target.value})}
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Receiver Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserIcon size={20} className="mr-2" />
                    Informations du destinataire
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">Nom complet <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        value={formData.receiverName}
                        onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                        placeholder="Nom du destinataire"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 flex items-center">
                        <PhoneIcon size={16} className="mr-1" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        value={formData.receiverPhone}
                        onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1 flex items-center">
                        <MailIcon size={16} className="mr-1" />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        value={formData.receiverEmail}
                        onChange={(e) => setFormData({...formData, receiverEmail: e.target.value})}
                        placeholder="destinataire@exemple.com"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">Adresse complète</label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                        value={formData.receiverAddress}
                        onChange={(e) => setFormData({...formData, receiverAddress: e.target.value})}
                        placeholder="Adresse de livraison complète"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button type="button" onClick={handlePrevStep} className="btn">Précédent</button>
                  <button type="button" onClick={handleNextStep} className="btn btn-primary">Suivant</button>
                </div>
              </div>}
              {step === 3 && <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Détails du colis
                </h2>
                <div className="mb-6">
                  <label className="block text-sm text-gray-700 mb-1">Description du produit</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                    placeholder="Ex: Téléphone portable, vêtements, etc."
                  />
                </div>
                <div className="mb-6 form-control">
                  <label htmlFor="packageType" className="block text-gray-700 text-sm font-medium mb-2">
                    Type de colis
                  </label>
                  <select id="packageType" name="packageType" className="select select-bordered select-primary w-full" value={formData.packageType} onChange={handleInputChange}>
                    <option value="package">Colis standard</option>
                    <option value="document">Document</option>
                    <option value="fragile">Colis fragile</option>
                    <option value="heavy">Colis lourd</option>
                  </select>
                </div>
                <div className="mb-6 form-control">
                  <label htmlFor="weight" className="block text-gray-700 text-sm font-medium mb-2">
                    Poids (kg) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" id="weight" name="weight" min="0.1" step="0.1" className="input input-bordered input-primary w-full text-lg py-3" value={formData.weight} onChange={handleInputChange} required />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-gray-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="mb-6">
                  <h3 className="text-gray-700 text-sm font-medium mb-2">
                    Dimensions (cm)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-control">
                      <label htmlFor="length" className="block text-gray-700 text-xs mb-1">
                        Longueur
                      </label>
                      <input type="number" id="length" name="length" min="1" className="input input-bordered input-primary w-full text-lg py-3" value={formData.length} onChange={handleInputChange} />
                    </div>
                    <div className="form-control">
                      <label htmlFor="width" className="block text-gray-700 text-xs mb-1">
                        Largeur
                      </label>
                      <input type="number" id="width" name="width" min="1" className="input input-bordered input-primary w-full text-lg py-3" value={formData.width} onChange={handleInputChange} />
                    </div>
                    <div className="form-control">
                      <label htmlFor="height" className="block text-gray-700 text-xs mb-1">
                        Hauteur
                      </label>
                      <input type="number" id="height" name="height" min="1" className="input input-bordered input-primary w-full text-lg py-3" value={formData.height} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button type="button" onClick={handlePrevStep} className="btn">
                    Précédent
                  </button>
                  <button type="button" onClick={handleNextStep} className="btn btn-primary">Suivant</button>
                </div>
              </div>}
              {step === 4 && <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Confirmation de la demande
                </h2>
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <h3 className="text-blue-800 font-medium mb-2">
                      Récapitulatif de votre demande
                    </h3>
                    <div className="text-blue-700 text-sm space-y-1">
                      <p><strong>De:</strong> {formData.origin}</p>
                      <p><strong>À:</strong> {formData.destination}</p>
                      <p><strong>Expéditeur:</strong> {formData.shipperName} ({formData.shipperEmail})</p>
                      <p><strong>Destinataire:</strong> {formData.receiverName} ({formData.receiverEmail})</p>
                      <p><strong>Produit:</strong> {formData.product || 'Non spécifié'}</p>
                      <p><strong>Poids:</strong> {formData.weight} kg</p>
                      <p><strong>Dimensions:</strong> {formData.length} × {formData.width} × {formData.height} cm</p>
                      <p><strong>Type:</strong> {formData.packageType}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h4 className="text-yellow-800 font-medium mb-2">Important :</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Votre demande sera examinée par notre équipe administrative</li>
                      <li>• Vous recevrez un email de confirmation avec votre numéro de suivi</li>
                      <li>• Les frais de port définitifs seront communiqués lors de la confirmation</li>
                      <li>• Vous pouvez suivre l'état de votre colis via notre page de suivi</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button type="button" onClick={handlePrevStep} className="btn">
                    Précédent
                  </button>
                  <button type="button" onClick={handleSubmit} className="btn btn-primary">
                    Soumettre la demande
                  </button>
                </div>
              </div>}
            </div>
          </div>
        </div>
        {/* Recent Confirmed Shipments Section - Always visible */}
        {allShipments.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <HistoryIcon size={24} className="mr-2 text-blue-600" />
                  Expéditions récentes confirmées ({allShipments.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="px-4 py-2 border-b font-medium">N° de suivi</th>
                        <th className="px-4 py-2 border-b font-medium">Origine → Destination</th>
                        <th className="px-4 py-2 border-b font-medium">Statut</th>
                        <th className="px-4 py-2 border-b font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allShipments.slice(0, 5).map(shipment => (
                        <tr key={shipment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b font-medium text-blue-600">
                            {shipment.tracking_number || 'En attente de confirmation'}
                          </td>
                          <td className="px-4 py-3 border-b">
                            {shipment.origin} → {shipment.destination}
                          </td>
                          <td className="px-4 py-3 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(shipment.status)}`}>
                              {formatStatus(shipment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-b">{shipment.date_created}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allShipments.length > 5 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowDashboard(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Voir toutes les expéditions ({allShipments.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Pourquoi choisir ColisSelect ?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nous offrons des solutions d'expédition fiables et économiques
                pour tous vos besoins d'envoi.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Livraison fiable
                </h3>
                <p className="text-gray-600">
                  Notre réseau de partenaires de transport garantit une livraison
                  fiable et ponctuelle de vos colis.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <DollarSignIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Prix compétitifs
                </h3>
                <p className="text-gray-600">
                  Nous négocions les meilleurs tarifs avec nos transporteurs pour
                  vous offrir des prix avantageux.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Couverture mondiale
                </h3>
                <p className="text-gray-600">
                  Expédiez vos colis partout dans le monde grâce à notre réseau
                  international de partenaires.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
  ) : (
    <UserDashboard
      userShipments={userShipments}
      userEmail={currentUserEmail}
      onCancelShipment={handleCancelShipment}
      onNewRequest={() => setShowDashboard(false)}
      loadUserShipments={loadUserShipments}
    />
  )}
</div>
};
// Add missing icons
const DollarSignIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({
  className,
  size = 24
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>;
const MapPinIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({
  className,
  size = 24
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>;