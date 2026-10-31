import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LocationPreferenceModal } from './components/common/LocationPreferenceModal';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ComparePricesPage } from './pages/ComparePricesPage';
import { LocationsPage } from './pages/LocationsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { BuyerRegisterPage } from './pages/BuyerRegisterPage';
import { BuyerLoginPage } from './pages/BuyerLoginPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { DailyPriceManagementPage } from './pages/DailyPriceManagementPage';
import { PriceHistoryPage } from './pages/PriceHistoryPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

// Route Guards
const ProtectedBuyerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500">
        Loading buyer portal...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500">
        Checking admin privileges...
      </div>
    );
  }
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LocationProvider>
          <AuthProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-slate-900 font-sans overflow-x-hidden w-full max-w-full">
                <LocationPreferenceModal />
                <Navbar />
                <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
                  <Routes>
                  {/* Public Farmer Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/compare" element={<ComparePricesPage />} />
                  <Route path="/locations" element={<LocationsPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />

                  {/* Authentication Routes */}
                  <Route path="/register" element={<BuyerRegisterPage />} />
                  <Route path="/login" element={<BuyerLoginPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Protected Buyer Routes */}
                  <Route
                    path="/buyer/dashboard"
                    element={
                      <ProtectedBuyerRoute>
                        <BuyerDashboardPage />
                      </ProtectedBuyerRoute>
                    }
                  />
                  <Route
                    path="/buyer/prices"
                    element={
                      <ProtectedBuyerRoute>
                        <DailyPriceManagementPage />
                      </ProtectedBuyerRoute>
                    }
                  />
                  <Route
                    path="/buyer/subscription"
                    element={
                      <ProtectedBuyerRoute>
                        <SubscriptionPage />
                      </ProtectedBuyerRoute>
                    }
                  />
                  <Route
                    path="/buyer/history"
                    element={
                      <ProtectedBuyerRoute>
                        <PriceHistoryPage />
                      </ProtectedBuyerRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboardPage />
                      </ProtectedAdminRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </LocationProvider>
    </LanguageProvider>
  </ErrorBoundary>
);
}
