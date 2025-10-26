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
  const [userShipments, setUserShipments] = useState<UserShipment[]>(() => {
    // Load user shipments from localStorage on component initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.email) {
        const storedShipments = localStorage.getItem(`userShipments_${user.email}`);
        return storedShipments ? JSON.parse(storedShipments) : [];
      }
    }
    return [];
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const [userEmailForHistory, setUserEmailForHistory] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showHistoryBeforeSubmit, setShowHistoryBeforeSubmit] = useState(false);
  const [allShipments, setAllShipments] = useState<UserShipment[]>([]);
  const [userSessionShipments, setUserSessionShipments] = useState<UserShipment[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(() => {
    // Check if user is already logged in on page load
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Load user shipments when component mounts and user is logged in
  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.email) {
        loadUserShipments(user.email);
      }
    }
  }, []); // Empty dependency array to run only once on mount
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load user's shipments history when logged in
  useEffect(() => {
    if (currentUser?.email) {
      loadUserShipments(currentUser.email);
    }
  }, [currentUser]);

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
    localStorage.setItem('currentUser', JSON.stringify(user));
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
    localStorage.removeItem('currentUser');
    setUserShipments([]);
    setAllShipments([]);
    setUserSessionShipments([]);
    setNotification({type: 'success', message: 'Vous avez été déconnecté.'});
    setTimeout(() => setNotification(null), 3000);
  };

  // Update localStorage whenever userShipments changes
  useEffect(() => {
    if (currentUser?.email && userShipments.length > 0) {
      localStorage.setItem(`userShipments_${currentUser.email}`, JSON.stringify(userShipments));
    }
  }, [userShipments, currentUser]);

  const loadUserShipments = async (email: string) => {
    try {
      const allShipments = await shipmentsApi.getAll();
      const userShipments = allShipments.filter(shipment => shipment.shipper_email === email);
      setUserShipments(userShipments);
      setHasHistory(userShipments.length > 0);
      setUserEmailForHistory(email);

      // Save to localStorage for persistence
      localStorage.setItem(`userShipments_${email}`, JSON.stringify(userShipments));
    } catch (error) {
      console.error('Failed to load user shipments:', error);
      // Fallback to localStorage if API fails
      const storedShipments = localStorage.getItem(`userShipments_${email}`);
      if (storedShipments) {
        const parsedShipments = JSON.parse(storedShipments);
        setUserShipments(parsedShipments);
        setHasHistory(parsedShipments.length > 0);
        setUserEmailForHistory(email);
      }
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
        <div className="bg-primary text-primary-content py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                  Créer une demande d'expédition
                </h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto lg:mx-0">
                  Remplissez le formulaire ci-dessous pour créer votre demande d'expédition.
                  Elle sera examinée par notre équipe avant confirmation.
                </p>
              </div>
              <div className="flex-shrink-0">
                {currentUser ? (
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <span className="text-blue-100 text-center sm:text-left">Bienvenue, {currentUser.name}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => { setShowAuth(true); setAuthMode('login'); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm"
                    >
                      <LogInIcon size={16} className="mr-2" />
                      Connexion
                    </button>
                    <button
                      onClick={() => { setShowAuth(true); setAuthMode('register'); }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center text-sm"
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
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden -mt-8 md:-mt-16">
            {/* Progress Steps */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
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
                <div className="hidden sm:block w-12 h-0.5 bg-gray-200 mx-2"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">Informations personnelles</div>
                  </div>
                </div>
                <div className="hidden sm:block w-12 h-0.5 bg-gray-200 mx-2"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    3
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium">Détails du colis</div>
                  </div>
                </div>
                <div className="hidden sm:block w-12 h-0.5 bg-gray-200 mx-2"></div>
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
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="label">
                      <span className="label-text">Adresse d'origine <span className="text-error">*</span></span>
                    </label>
                    <input type="text" name="origin" className="input input-bordered input-primary w-full" placeholder="Ex: 123 Rue de Paris, 75001 Paris" value={formData.origin} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Adresse de destination <span className="text-error">*</span></span>
                    </label>
                    <input type="text" name="destination" className="input input-bordered input-primary w-full" placeholder="Ex: 456 Avenue de Lyon, 69001 Lyon" value={formData.destination} onChange={handleInputChange} required />
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
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Nom complet <span className="text-error">*</span></span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.shipperName}
                        onChange={(e) => setFormData({...formData, shipperName: e.target.value})}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text flex items-center">
                          <PhoneIcon size={16} className="mr-1" />
                          Téléphone <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="tel"
                        className="input input-bordered w-full"
                        value={formData.shipperPhone}
                        onChange={(e) => setFormData({...formData, shipperPhone: e.target.value})}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text flex items-center">
                          <MailIcon size={16} className="mr-1" />
                          Email <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered w-full"
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
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Nom complet <span className="text-error">*</span></span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.receiverName}
                        onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                        placeholder="Nom du destinataire"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text flex items-center">
                          <PhoneIcon size={16} className="mr-1" />
                          Téléphone
                        </span>
                      </label>
                      <input
                        type="tel"
                        className="input input-bordered w-full"
                        value={formData.receiverPhone}
                        onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text flex items-center">
                          <MailIcon size={16} className="mr-1" />
                          Email <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        className="input input-bordered w-full"
                        value={formData.receiverEmail}
                        onChange={(e) => setFormData({...formData, receiverEmail: e.target.value})}
                        placeholder="destinataire@exemple.com"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Adresse complète</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.receiverAddress}
                        onChange={(e) => setFormData({...formData, receiverAddress: e.target.value})}
                        placeholder="Adresse de livraison complète"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                  <button type="button" onClick={handlePrevStep} className="btn w-full sm:w-auto">Précédent</button>
                  <button type="button" onClick={handleNextStep} className="btn btn-primary w-full sm:w-auto">Suivant</button>
                </div>
              </div>}
              {step === 3 && <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Détails du colis
                </h2>
                <div className="mb-6">
                  <label className="label">
                    <span className="label-text">Description du produit</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                    placeholder="Ex: Téléphone portable, vêtements, etc."
                  />
                </div>
                <div className="mb-6">
                  <label className="label">
                    <span className="label-text">Type de colis</span>
                  </label>
                  <select className="select select-bordered select-primary w-full" value={formData.packageType} onChange={handleInputChange} name="packageType">
                    <option value="package">Colis standard</option>
                    <option value="document">Document</option>
                    <option value="fragile">Colis fragile</option>
                    <option value="heavy">Colis lourd</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="label">
                    <span className="label-text">Poids (kg) <span className="text-error">*</span></span>
                  </label>
                  <input type="number" min="0.1" step="0.1" className="input input-bordered input-primary w-full" value={formData.weight} onChange={handleInputChange} name="weight" required />
                </div>
                <div className="mb-6">
                  <label className="label">
                    <span className="label-text">Quantité</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered w-full"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="mb-6">
                  <h3 className="text-gray-700 text-sm font-medium mb-2">
                    Dimensions (cm)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text text-xs">Longueur</span>
                      </label>
                      <input type="number" min="1" className="input input-bordered input-primary w-full" value={formData.length} onChange={handleInputChange} name="length" />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text text-xs">Largeur</span>
                      </label>
                      <input type="number" min="1" className="input input-bordered input-primary w-full" value={formData.width} onChange={handleInputChange} name="width" />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text text-xs">Hauteur</span>
                      </label>
                      <input type="number" min="1" className="input input-bordered input-primary w-full" value={formData.height} onChange={handleInputChange} name="height" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                  <button type="button" onClick={handlePrevStep} className="btn w-full sm:w-auto">
                    Précédent
                  </button>
                  <button type="button" onClick={handleNextStep} className="btn btn-primary w-full sm:w-auto">Suivant</button>
                </div>
              </div>}
              {step === 4 && <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Confirmation de la demande
                </h2>
                <div className="mb-6">
                  <div className="alert alert-info mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div>
                        <h3 className="font-bold">Récapitulatif de votre demande</h3>
                        <div className="text-sm space-y-1">
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
                    </div>
 
                    <div className="alert alert-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      <div>
                        <h4 className="font-bold">Important :</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Votre demande sera examinée par notre équipe administrative</li>
                          <li>• Vous recevrez un email de confirmation avec votre numéro de suivi</li>
                          <li>• Les frais de port définitifs seront communiqués lors de la confirmation</li>
                          <li>• Vous pouvez suivre l'état de votre colis via notre page de suivi</li>
                        </ul>
                      </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                  <button type="button" onClick={handlePrevStep} className="btn w-full sm:w-auto">
                    Précédent
                  </button>
                  <button type="button" onClick={handleSubmit} className="btn btn-primary w-full sm:w-auto">
                    Soumettre la demande
                  </button>
                </div>
              </div>}
            </div>
          </div>
        </div>
        {/* User Shipments History Section - Always visible when logged in */}
        {currentUser && userShipments.length > 0 && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <HistoryIcon size={24} className="mr-2 text-blue-600" />
                  Historique de vos demandes ({userShipments.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="px-4 py-2 border-b font-medium">N° de suivi</th>
                        <th className="px-4 py-2 border-b font-medium">Origine → Destination</th>
                        <th className="px-4 py-2 border-b font-medium">Statut</th>
                        <th className="px-4 py-2 border-b font-medium">Date</th>
                        <th className="px-4 py-2 border-b font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userShipments.slice(0, 5).map(shipment => (
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
                          <td className="px-4 py-3 border-b">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 p-1" title="Voir détails">
                                <EyeIcon size={16} />
                              </button>
                              {shipment.status === 'pending_confirmation' && (
                                <button
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Annuler"
                                  onClick={() => handleCancelShipment(shipment.id)}
                                >
                                  <XIcon size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {userShipments.length > 5 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShowDashboard(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Voir tout l'historique ({userShipments.length})
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