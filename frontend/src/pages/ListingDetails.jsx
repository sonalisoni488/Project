import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Package, DollarSign, User, X, Mail } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [message, setMessage] = useState('');

  console.log('🔍 ListingDetails component mounted with ID:', id);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        console.log('🌐 Making API call to:', `/listings/${id}`);
        const response = await api.get(`/listings/${id}`);
        console.log('🔍 Full response object:', response);
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', response.headers);
        console.log('🔍 Listing details response:', response.data);
        console.log('🔍 Response structure:', {
          hasData: !!response.data,
          hasListing: !!response.data?.listing,
          listingKeys: response.data?.listing ? Object.keys(response.data.listing) : [],
          responseType: typeof response.data
        });
        
        if (response.data?.data?.listing) {
          console.log('✅ Full listing data:', response.data.data.listing);
          console.log('✅ Seller data:', response.data.data.listing.seller);
          console.log('✅ Seller email:', response.data.data.listing.seller?.email);
          console.log('✅ Seller phone:', response.data.data.listing.seller?.phone);
          setListing(response.data.data.listing);
          setLoading(false);
        } else {
          console.error('❌ No listing in response:', response.data);
          setError('Listing not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error fetching listing:', err);
        console.error('❌ Error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        setError('Failed to load listing details');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    setShowContactModal(true);
    setMessage(`Hi ${listing.seller?.name}, I'm interested in your listing: "${listing.title}"`);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setShowAuthModal(false);
  };

  const handleSignup = () => {
    navigate('/register');
    setShowAuthModal(false);
  };

  const handleCloseModal = () => {
    setShowContactModal(false);
    setMessage('');
  };

  const handleSendContact = () => {
    const sellerInfo = listing.seller;
    
    if (sellerInfo?.email) {
      window.location.href = `mailto:${sellerInfo.email}?subject=Interest in your listing: ${listing.title}&body=${encodeURIComponent(message)}`;
      handleCloseModal();
    } else {
      alert('Seller email is not available');
    }
  };

  const handleBackToMarketplace = () => {
    navigate('/marketplace');
  };

  if (loading) {
    console.log('🔄 Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ Showing error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={handleBackToMarketplace}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    console.log('⚠️ No listing data found');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-gray-600 mb-4">Listing not found</div>
          <button
            onClick={handleBackToMarketplace}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering listing details for:', listing._id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBackToMarketplace}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Marketplace
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Listing Details</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image Section */}
            <div className="md:w-1/2">
              <div className="h-96 bg-gray-200 relative">
                <img
                  src={listing.imageUrl || 'https://via.placeholder.com/400x300?text=Waste+Material'}
                  alt={listing.wasteType}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {listing.status || 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-6">
              {/* Title and Waste Type */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {listing.title}
                </h2>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                  {listing.wasteType}
                </span>
              </div>

              {/* Price and Weight */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-700 mb-2">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Price</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${listing.price}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Package className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Weight</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {listing.weight} kg
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{listing.location}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-700">
                    <User className="w-5 h-5 mr-2" />
                    <div>
                      <p className="font-semibold">{listing.seller?.name || 'Seller'}</p>
                      <p className="text-sm text-gray-600">{listing.seller?.location || 'Location not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Posted */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Posted</h3>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleContactSeller}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium transition-colors duration-200"
                >
                  Contact Seller
                </button>
                <button
                  onClick={handleBackToMarketplace}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 font-medium transition-colors duration-200"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Contact Seller</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Seller Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Seller Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="font-medium">{listing.seller?.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{listing.seller?.location}</span>
                  </div>
                </div>
              </div>

              {/* Contact Method */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Method</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-gray-600" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-gray-600">
                        {listing.seller?.email || 'Email not available'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Message</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Enter your message here..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendContact}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
              <button
                onClick={handleCloseAuthModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to Contact Seller</h3>
                <p className="text-gray-600">
                  You need to be logged in to contact the seller. Please sign in to your account or create a new account to continue.
                </p>
              </div>

              {/* User Info (if logged in) */}
              {isAuthenticated && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    <div>
                      <div className="font-medium">Logged in as:</div>
                      <div className="text-sm text-gray-600">{user?.name}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={handleSignup}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;
