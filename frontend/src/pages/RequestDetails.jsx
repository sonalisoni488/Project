import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/requests/${id}`);
        
        if (response.data.success) {
          setRequest(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch request details');
        }
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await api.put(`/requests/${id}/status`, { status: newStatus });
      
      if (response.data.success) {
        setRequest(prev => ({ ...prev, status: newStatus }));
      } else {
        setError(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update request status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-red-800">Error Loading Request</h2>
                <p className="text-red-600 mt-2">{error}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-yellow-800">Request Not Found</h2>
              <p className="text-yellow-600 mt-2">The request you're looking for doesn't exist or has been removed.</p>
            </div>
            <button
              onClick={() => navigate('/buyer-dashboard')}
              className="mt-4 w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="ml-2">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Request Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">Listing:</span>
                      <span className="text-gray-600">{request.listing?.title || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">Location:</span>
                      <span className="text-gray-600">{request.listing?.location || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">Offered Price:</span>
                      <span className="text-gray-600">${request.listing?.price || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="font-medium">Requested:</span>
                      <span className="text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{request.message}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Status & Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                <div className={`p-4 rounded-lg ${getStatusColor(request.status)}`}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className="font-medium">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                  </div>
                  <p className="text-sm mt-2">
                    {request.status === 'pending' && 'Your request is waiting for seller response.'}
                    {request.status === 'accepted' && 'Seller has accepted your request! You can proceed with payment.'}
                    {request.status === 'rejected' && 'Seller has declined this request.'}
                    {request.status === 'completed' && 'Request has been completed successfully.'}
                  </p>
                </div>
              </div>

              {/* Seller Actions */}
              {user?.role === 'seller' && request.status === 'pending' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleStatusUpdate('accepted')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>
                  </div>
                </div>
              )}

              {/* Buyer Actions */}
              {user?.role === 'buyer' && request.status === 'accepted' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/orders/create/${request._id}`)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Proceed to Payment
                    </button>
                    <button
                      onClick={() => navigate(`/chat/${request.chat?._id}`)}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat with Seller
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
