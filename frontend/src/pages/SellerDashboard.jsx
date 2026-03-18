import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import ChatComponent from '../components/ChatComponent';
import {
  Menu,
  X,
  Plus,
  Package,
  DollarSign,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  LogOut,
  Tag,
  Image,
  FileText,
  MessageSquare,
  MessageCircle
} from 'lucide-react';

const SellerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [activeSection, setActiveSection] = useState('listings');
  const [responseModal, setResponseModal] = useState({ isOpen: false, requestId: null, status: '', responseMessage: '' });
  const [toast, setToast] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    wasteType: '',
    quantity: '',
    unit: '',
    price: '',
    description: '',
    location: '',
    images: []
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [listings, setListings] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (activeSection === 'listings') {
      fetchListings();
    } else if (activeSection === 'requests') {
      fetchRequests();
    } else if (activeSection === 'analytics') {
      fetchDashboardData();
    } else if (activeSection === 'chats') {
      fetchChats();
    }
  }, [activeSection]);

  useEffect(() => {
    fetchChats(); // Load chats on component mount
  }, []);


  const fetchRequests = async () => {
    try {
      console.log('🔍 Fetching seller requests...');
      const response = await api.get('/requests/seller');
      console.log('📋 Received requests data:', response.data);
      setRequests(response.data.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      console.error('❌ Error response:', error.response?.data);
      setIsLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      console.log('🔍 Fetching seller chats...');
      const response = await api.get('/chats');
      console.log('📋 Received chats data:', response.data);
      setChats(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
      console.error('❌ Error response:', error.response?.data);
      setChats([]);
    }
  };

  const fetchListings = async () => {
    try {
      console.log('🔍 Fetching seller listings...');
      const response = await api.get('/seller/listings');
      console.log('📋 Received listings data:', response.data);
      setListings(response.data.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      console.error('❌ Error response:', error.response?.data);
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/seller/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    // Fetch data based on the active section
    switch (section) {
      case 'listings':
        fetchListings();
        break;
      case 'requests':
        fetchRequests();
        break;
      case 'analytics':
        fetchDashboardData();
        break;
      default:
        break;
    }
  };

  const handleResponseSubmit = async () => {
    if (!responseModal.responseMessage.trim()) {
      alert('Please enter a response message');
      return;
    }

    try {
      const response = await api.put(`/requests/${responseModal.requestId}/status`, {
        status: responseModal.status,
        responseMessage: responseModal.responseMessage
      });

      if (response.data.success) {
        alert(`Request ${responseModal.status} successfully!`);
        setResponseModal({ isOpen: false, requestId: null, status: '', responseMessage: '' });
        // Refresh requests list
        fetchRequests();
      } else {
        alert('Failed to respond to request: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Error responding to request. Please try again.');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex-1 px-4 py-6 space-y-2">
              <button
                onClick={() => handleNavigation('listings')}
                className={`w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors ${activeSection === 'listings' ? 'bg-green-50 text-green-600' : ''
                  }`}
              >
                <Package className="w-5 h-5" />
                <span>My Listings</span>
              </button>
              <button
                onClick={() => handleNavigation('requests')}
                className={`w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors ${activeSection === 'requests' ? 'bg-green-50 text-green-600' : ''
                  }`}
              >
                <Users className="w-5 h-5" />
                <span>Buyer Requests</span>
              </button>
              <button
                onClick={() => handleNavigation('analytics')}
                className={`w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors ${activeSection === 'analytics' ? 'bg-green-50 text-green-600' : ''
                  }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => handleNavigation('chats')}
                className={`w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors ${activeSection === 'chats' ? 'bg-green-50 text-green-600' : ''
                  }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>My Chats</span>
              </button>
            </div>

            <div className="px-4 py-6 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Seller Dashboard</h1>
            <div></div>
          </div>

          <div className="p-4 lg:p-8">
            {activeSection === 'listings' && (
              <>
                {/* Page Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">My Listings</h1>
                  <p className="text-gray-600">Manage your waste material listings</p>
                </div>

                {/* Listings List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Your Listings</h2>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add New Listing
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {listings.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No listings yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Create your first listing to start selling</p>
                      </div>
                    ) : (
                      listings.map((listing) => (
                        <div key={listing._id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">

                            {/* LEFT: Image + Content */}
                            <div className="flex gap-4 flex-1">

                              {/* ✅ IMAGE */}
                              <img
                                src={listing.imageUrl}
                                alt={listing.title}
                                className="w-24 h-24 object-cover rounded-lg border"
                              />

                              {/* TEXT CONTENT */}
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                                <p className="text-gray-600 mt-1">{listing.description}</p>

                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <p className="font-medium">{listing.wasteType}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Weight</p>
                                    <p className="font-medium">{listing.weight} kg</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Price</p>
                                    <p className="font-medium">₹{listing.price}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${listing.status === 'available' ? 'bg-green-100 text-green-800' :
                                        listing.status === 'sold' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                      }`}>
                                      {listing.status || 'available'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex space-x-2 ml-4">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {activeSection === 'requests' && (
              <>
                {/* Page Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Buyer Requests</h1>
                  <p className="text-gray-600">Manage and respond to requests from buyers</p>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Buyer Requests</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {requests.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No requests yet</h3>
                        <p className="mt-1 text-sm text-gray-500">When buyers send requests, they will appear here</p>
                      </div>
                    ) : (
                      requests.map((request) => (
                        <div key={request._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                          <div className="flex flex-col lg:flex-row">
                            {/* Left Side - Request Details */}
                            <div className="flex-1 p-4">
                              {/* Header Section */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">{request.buyer?.name}</h3>
                                    <p className="text-xs text-gray-500">{request.buyer?.email}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${request.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                      request.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                        'bg-rose-100 text-rose-800 border border-rose-200'
                                    }`}>
                                    {request.status === 'pending' ? '⏳ Pending' :
                                      request.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                                  </span>
                                </div>
                              </div>

                              {/* Request Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Product Image</p>
                                  {request.listing?.imageUrl ? (
                                    <img
                                      src={request.listing.imageUrl}
                                      alt={request.listing.title}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Listing</p>
                                  <p className="text-sm text-gray-900">{request.listing?.title}</p>
                                  <p className="text-xs text-gray-500">ID: {request.listing?._id}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Offer Price</p>
                                  <p className="text-sm text-gray-900">${request.offerPrice || request.listing?.price}</p>
                                </div>
                              </div>

                              {/* Buyer Message */}
                              {request.message && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Buyer Message</p>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                                </div>
                              )}

                              {/* Response Message */}
                              {request.responseMessage && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Your Response</p>
                                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{request.responseMessage}</p>
                                </div>
                              )}

                              {/* Timestamps */}
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <p>Received: {new Date(request.createdAt).toLocaleDateString()} {new Date(request.createdAt).toLocaleTimeString()}</p>
                                {request.updatedAt && request.updatedAt !== request.createdAt && (
                                  <p>Updated: {new Date(request.updatedAt).toLocaleDateString()}</p>
                                )}
                              </div>

                              {/* Action Buttons */}
                              {request.status === 'pending' && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => setResponseModal({
                                      isOpen: true,
                                      requestId: request._id,
                                      status: 'accepted',
                                      responseMessage: ''
                                    })}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  >
                                    Accept Request
                                  </button>
                                  <button
                                    onClick={() => setResponseModal({
                                      isOpen: true,
                                      requestId: request._id,
                                      status: 'rejected',
                                      responseMessage: ''
                                    })}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    Reject Request
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {activeSection === 'chats' && (
              <>
                {/* Page Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">My Chats</h1>
                  <p className="text-gray-600">View your conversations with buyers</p>
                </div>

                {/* Chats List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Active Conversations</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {chats.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No chats yet</h3>
                        <p className="mt-1 text-sm text-gray-500">When buyers send requests, chats will appear here</p>
                      </div>
                    ) : (
                      chats.map((chat) => (
                        <div key={chat._id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedChat(chat)}>
                          <div className="flex items-start justify-between">
                            {/* Left Side - Last Message */}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{chat.listing?.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">Buyer: {chat.participants.find(p => p._id !== chat.listing?.seller)?.name}</p>
                              <div className="bg-gray-100 rounded-lg p-4 mt-3 border-l-4 border-blue-400">
                                <div className="flex items-start space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-3 h-3 text-gray-600" />
                                  </div>
                                  <p className="text-sm text-gray-800 flex-1">{chat.lastMessage}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Side - Sender Info + Product Image */}
                            <div className="flex flex-col items-end space-y-3">
                              <div className="text-right">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  chat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {chat.status}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(chat.lastMessageAt).toLocaleDateString()}
                                </p>
                              </div>
                              
                              {/* Product Image */}
                              {chat.listing?.imageUrl ? (
                                <img
                                  src={chat.listing.imageUrl}
                                  alt={chat.listing.title}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Other sections can be added here */}
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {responseModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setResponseModal({ isOpen: false, requestId: null, status: '', responseMessage: '' })}></div>

            <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {responseModal.status === 'accepted' ? 'Accept Request' : 'Reject Request'}
                </h3>
                <button
                  onClick={() => setResponseModal({ isOpen: false, requestId: null, status: '', responseMessage: '' })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message
                </label>
                <textarea
                  value={responseModal.responseMessage}
                  onChange={(e) => setResponseModal({ ...responseModal, responseMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                  placeholder="Enter your response message..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setResponseModal({ isOpen: false, requestId: null, status: '', responseMessage: '' })}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResponseSubmit}
                  className={`flex-1 px-4 py-2 text-white rounded-md hover:opacity-90 ${responseModal.status === 'accepted'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {responseModal.status === 'accepted' ? 'Accept' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl h-[85vh] max-h-[700px] m-4">
            <ChatComponent 
              chatId={selectedChat._id} 
              onClose={() => setSelectedChat(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
