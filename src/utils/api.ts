// API client for backend communication - Railway deployment
// API is hosted on Railway, frontend served from Railway
export const API_BASE_URL = 'https://tracksitepython.up.railway.app';

export interface Location {
  id: number;
  name: string;
  slug: string;
  country: string;
}

export interface Zone {
  id: number;
  name: string;
  slug: string;
  locations: string;
  description: string;
}

export interface ShippingRate {
  id: number;
  name: string;
  type: 'flat' | 'weight';
  min_weight: number;
  max_weight: number;
  rate: number;
  insurance: number;
  description: string;
}

export interface PickupRate {
  id: number;
  zone: string;
  min_weight: number;
  max_weight: number;
  rate: number;
  description: string;
}

export interface Shipment {
  id: number;
  tracking_number: string;
  shipper_name: string;
  shipper_address: string;
  shipper_phone: string;
  shipper_email: string;
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  receiver_email: string;
  origin: string;
  destination: string;
  status: 'pending_confirmation' | 'processing' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed' | 'rejected' | 'cancelled';
  packages: number;
  total_weight: number;
  product?: string;
  quantity?: number;
  payment_mode?: string;
  total_freight?: number;
  expected_delivery?: string;
  departure_time?: string;
  pickup_date?: string;
  pickup_time?: string;
  comments?: string;
  date_created: string;
}

export interface TrackingHistory {
  id?: number;
  shipment_id?: number;
  date_time: string;
  location: string;
  status: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

export interface TrackingResult {
  shipment: Shipment;
  history: TrackingHistory[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent' | 'user';
  branch?: string;
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  branch?: string;
  status: string;
}

// Generic API functions with better error handling
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Locations API
export const locationsApi = {
  getAll: () => apiRequest<Location[]>('/api/locations'),
  create: (data: Omit<Location, 'id'>) => apiRequest<Location>('/api/locations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Location>) => apiRequest<{ message: string }>(`/api/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ message: string }>(`/api/locations/${id}`, {
    method: 'DELETE',
  }),
};

// Zones API
export const zonesApi = {
  getAll: () => apiRequest<Zone[]>('/api/zones'),
  create: (data: Omit<Zone, 'id'>) => apiRequest<Zone>('/api/zones', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Zone>) => apiRequest<{ message: string }>(`/api/zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ message: string }>(`/api/zones/${id}`, {
    method: 'DELETE',
  }),
};

// Shipping Rates API
export const shippingRatesApi = {
  getAll: () => apiRequest<ShippingRate[]>('/api/shipping-rates'),
  create: (data: Omit<ShippingRate, 'id'>) => apiRequest<ShippingRate>('/api/shipping-rates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<ShippingRate>) => apiRequest<{ message: string }>(`/api/shipping-rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ message: string }>(`/api/shipping-rates/${id}`, {
    method: 'DELETE',
  }),
};

// Pickup Rates API
export const pickupRatesApi = {
  getAll: () => apiRequest<PickupRate[]>('/api/pickup-rates'),
  create: (data: Omit<PickupRate, 'id'>) => apiRequest<PickupRate>('/api/pickup-rates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<PickupRate>) => apiRequest<{ message: string }>(`/api/pickup-rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ message: string }>(`/api/pickup-rates/${id}`, {
    method: 'DELETE',
  }),
};

// Shipments API
export const shipmentsApi = {
  getAll: (status?: string) => {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return apiRequest<Shipment[]>(`/api/shipments${query}`);
  },
  create: (data: Omit<Shipment, 'id'>, isAdmin: boolean = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (isAdmin) {
      headers['X-Admin-Request'] = 'true';
    }
    
    return apiRequest<Shipment>('/api/shipments', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },
  update: (id: number, data: Partial<Shipment>) => apiRequest<{ message: string }>(`/api/shipments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ message: string }>(`/api/shipments/${id}`, {
    method: 'DELETE',
  }),
  confirm: (id: number, data: { total_freight?: number; expected_delivery?: string; comments?: string }) => 
    apiRequest<{ message: string; tracking_number: string }>(`/api/shipments/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reject: (id: number, data: { reason: string }) => 
    apiRequest<{ message: string }>(`/api/shipments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest<User[]>('/api/users'),
  create: (data: Omit<User, 'id'>) => apiRequest<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<User>) => apiRequest<{ message: string }>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => apiRequest<{ message: string }>(`/api/users/${id}`, {
    method: 'DELETE',
  }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) => apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (name: string, email: string, password: string) => apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
};

// Tracking API
export const trackingApi = {
  track: async (trackingNumber: string): Promise<TrackingResult> => {
    const response = await fetch(`${API_BASE_URL}/api/track/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Colis non trouvé');
      }
      throw new Error(`Erreur de tracking: ${response.status}`);
    }
    return response.json();
  }
};

// Tracking History API
export const trackingHistoryApi = {
  getAll: (shipmentId: number) => apiRequest<TrackingHistory[]>(`/api/tracking-history/${shipmentId}`),
  create: (shipmentId: number, data: Omit<TrackingHistory, 'id' | 'shipment_id'>) => apiRequest<TrackingHistory>(`/api/tracking-history/${shipmentId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (historyId: number, data: Partial<TrackingHistory>) => apiRequest<{ message: string }>(`/api/tracking-history/${historyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (historyId: number) => apiRequest<{ message: string }>(`/api/tracking-history/${historyId}`, {
    method: 'DELETE',
  }),
};