import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { I18nProvider } from './utils/i18n';
import { API_BASE_URL } from './utils/api';
import { App } from './App';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { AdminLogin } from './components/auth/AdminLogin';
import { UserLayout } from './layouts/UserLayout';
import { HomePage } from './pages/HomePage';
import { TrackingPage } from './pages/TrackingPage';
import { QuotePage } from './pages/QuotePage';
import { ContactPage } from './pages/ContactPage';
import { ShippingServicePage } from './pages/services/ShippingServicePage.tsx';
import { AirServicePage } from './pages/services/AirServicePage.tsx';
import { DeliveryServicePage } from './pages/services/DeliveryServicePage.tsx';
import { SpecialServicePage } from './pages/services/SpecialServicePage.tsx';
import { AnimatePresence } from 'framer-motion';
function AnimatedRoutes() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication - session persists until logout
    const checkAuth = () => {
      try {
        const storedAuth = localStorage.getItem('adminAuthenticated');
        console.log('Checking stored auth:', storedAuth);
        if (storedAuth === 'true') {
          setIsAuthenticated(true);
          console.log('User authenticated from localStorage');
        } else {
          setIsAuthenticated(false);
          console.log('No stored authentication found');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'admin@colisselect.com', password: '22022017' }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, setting authentication');
        setIsAuthenticated(true);
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data));
        console.log('Authentication stored in localStorage');
      } else {
        console.log('Login failed - invalid credentials');
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    console.log('Logging out user');
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    console.log('Authentication removed from localStorage');
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminDashboard />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          }
        />
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="quote" element={<QuotePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="services/shipping" element={<ShippingServicePage />} />
          <Route path="services/air" element={<AirServicePage />} />
          <Route path="services/delivery" element={<DeliveryServicePage />} />
          <Route path="services/special" element={<SpecialServicePage />} />
        </Route>
      </Routes>
    </AnimatePresence>;
}
export function AppRouter() {
  return <I18nProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </I18nProvider>;
}