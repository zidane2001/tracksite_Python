import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { I18nProvider } from './utils/i18n';
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
    // Always require authentication - no persistent sessions
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  const handleLogin = (code: string) => {
    if (code === '22022017') {
      setIsAuthenticated(true);
      // No persistent storage - authentication lost on page refresh
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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