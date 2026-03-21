import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import ListingDetails from './pages/ListingDetails';
import RequestDetails from './pages/RequestDetails';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import SalesAnalytics from './pages/SalesAnalytics';
import Earnings from './pages/Earnings';
import BuyerOffers from './pages/BuyerOffers';

// Import placeholder components for missing routes
const ChatPage = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Chat ID: {id}</p>
          <p className="text-gray-500 mt-2">Chat interface would be implemented here</p>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Details</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Order ID: {id}</p>
          <p className="text-gray-500 mt-2">Order details would be displayed here</p>
        </div>
      </div>
    </div>
  );
};

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
            
            {/* Dynamic Routes for Notifications */}
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/orders/:id" element={<OrdersPage />} />
            <Route path="/requests/:id" element={<RequestDetails />} />
            
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
