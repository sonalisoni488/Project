import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import ListingDetails from './pages/ListingDetails';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import SalesAnalytics from './pages/SalesAnalytics';
import Earnings from './pages/Earnings';
import BuyerOffers from './pages/BuyerOffers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            
            {/* Protected Routes */}
            <Route 
              path="/seller-dashboard" 
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buyer-dashboard" 
              element={
                <ProtectedRoute requiredRole="buyer">
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Seller Dashboard Section Routes */}
            <Route 
              path="/sales-analytics" 
              element={
                <ProtectedRoute requiredRole="seller">
                  <SalesAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/earnings" 
              element={
                <ProtectedRoute requiredRole="seller">
                  <Earnings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/buyer-offers" 
              element={
                <ProtectedRoute requiredRole="seller">
                  <BuyerOffers />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect old signup to register */}
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
