import React, { useState } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RequestButton = ({ listingId, listingTitle, sellerId, className = '' }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [error, setError] = useState('');

  // Check if user is logged in and is not the seller
  const canRequest = user && user.role === 'buyer' && user.id !== sellerId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canRequest) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Sending request for listing:', listingId);
      console.log('📋 Message:', message);

      const response = await api.post('/requests', {
        listingId,
        message: message.trim()
      });

      if (response.data.success) {
        console.log('✅ Request sent successfully:', response.data.data);
        setIsRequested(true);
        setShowModal(false);
        setMessage('');
        
        // Show success message
        alert('Request sent successfully! You can track it in "My Orders" section.');
      } else {
        setError(response.data.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('❌ Error sending request:', error);
      setError(error.response?.data?.message || 'Failed to send request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    if (!canRequest) return;
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage('');
    setError('');
  };

  // Don't render if user is not a buyer or is the seller
  if (!canRequest) {
    return null;
  }

  return (
    <>
      {/* Request Button */}
      <button
        onClick={handleOpenModal}
        disabled={isRequested}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
          isRequested 
            ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
            : 'hover:shadow-lg transform hover:scale-105'
        } ${className}`}
      >
        {isRequested ? (
          <>
            <Send className="w-4 h-4 mr-2" />
            Request Sent
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 mr-2" />
            Request to Buy
          </>
        )}
      </button>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Request to Buy
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Listing Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{listingTitle}</p>
                <p className="text-xs text-gray-500">Request ID: {listingId}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Message Input */}
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message to the seller (e.g., questions about the product, delivery preferences, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows="4"
                    maxLength="500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/500 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestButton;
