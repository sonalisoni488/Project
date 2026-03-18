import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ChatComponent from '../components/ChatComponent';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  DollarSign,
  Search,
  LogOut,
  Menu,
  X,
  Heart,
  History,
  User as UserIcon,
  LineChart,
  MessageSquare,
  MessageCircle
} from 'lucide-react';

const BuyerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [purchaseAnalytics, setPurchaseAnalytics] = useState([]);
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, orderId: null, paymentMethod: 'cash_on_delivery' });
  const [trackingModal, setTrackingModal] = useState({ isOpen: false, order: null });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchRequests(); // Load requests as "My Orders"
    fetchChats(); // Load chats
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/buyer/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      console.log('🔍 Fetching buyer orders...');
      const response = await api.get('/orders/buyer');
      console.log('📋 Received buyer orders data:', response.data);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching buyer orders:', error);
      console.error('❌ Error response:', error.response?.data);
      // Set empty array on error to prevent crashes
      setOrders([]);
    }
  };

  const fetchRequests = async () => {
    try {
      console.log('🔍 Fetching buyer requests...');
      const response = await api.get('/requests/buyer');
      console.log('📋 Received buyer requests data:', response.data);
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching buyer requests:', error);
      console.error('❌ Error response:', error.response?.data);
      // Set empty array on error to prevent crashes
      setRequests([]);
    }
  };

  const fetchChats = async () => {
    try {
      console.log('🔍 Fetching buyer chats...');
      const response = await api.get('/chats');
      console.log('📋 Received chats data:', response.data);
      setChats(response.data.data || []);
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
      console.error('❌ Error response:', error.response?.data);
      setChats([]);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      // Mock data for now
      const historyData = [
        {
          id: 1,
          listingTitle: 'Metal Scrap',
          sellerName: 'Bob Wilson',
          totalAmount: 300,
          purchaseDate: '2026-03-10',
          status: 'completed'
        },
        {
          id: 2,
          listingTitle: 'Paper Waste',
          sellerName: 'Alice Brown',
          totalAmount: 100,
          purchaseDate: '2026-03-08',
          status: 'completed'
        },
        {
          id: 3,
          listingTitle: 'Plastic Bottles',
          sellerName: 'Green Earth Co',
          totalAmount: 150,
          purchaseDate: '2026-02-28',
          status: 'completed'
        },
        {
          id: 4,
          listingTitle: 'E-Waste Components',
          sellerName: 'Tech Recycle',
          totalAmount: 250,
          purchaseDate: '2026-02-15',
          status: 'completed'
        },
        {
          id: 5,
          listingTitle: 'Glass Materials',
          sellerName: 'Glass Pro',
          totalAmount: 180,
          purchaseDate: '2026-01-20',
          status: 'completed'
        },
        {
          id: 6,
          listingTitle: 'Organic Waste',
          sellerName: 'Nature Recycle',
          totalAmount: 120,
          purchaseDate: '2025-12-15',
          status: 'completed'
        }
      ];

      setPurchaseHistory(historyData);

      // Generate analytics data from purchase history
      const analytics = generatePurchaseAnalytics(historyData);
      setPurchaseAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    }
  };

  const generatePurchaseAnalytics = (history) => {
    // Group purchases by month and calculate totals
    const monthlyData = {};

    history.forEach(purchase => {
      const date = new Date(purchase.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalAmount: 0,
          count: 0,
          monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        };
      }

      monthlyData[monthKey].totalAmount += purchase.totalAmount;
      monthlyData[monthKey].count += 1;
    });

    // Convert to array and sort by month
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const fetchSavedListings = async () => {
    try {
      // Mock data for now
      setSavedListings([
        {
          id: 1,
          title: 'Organic Waste Materials',
          sellerName: 'Green Earth Co',
          price: 50,
          wasteType: 'Organic',
          location: 'New York',
          savedDate: '2026-03-12'
        },
        {
          id: 2,
          title: 'Glass Bottles Bulk',
          sellerName: 'Recycle Pro',
          price: 80,
          wasteType: 'Glass',
          location: 'Los Angeles',
          savedDate: '2026-03-11'
        }
      ]);
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    // Fetch data based on section
    switch (section) {
      case 'orders':
        fetchRequests(); // Use requests as orders
        break;
      case 'requests':
        fetchRequests();
        break;
      case 'chats':
        fetchChats();
        break;
      case 'history':
        fetchPurchaseHistory();
        break;
      case 'saved':
        fetchSavedListings();
        break;
      default:
        fetchDashboardData();
    }
  };

  const handlePayment = async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/payment`, {
        paymentMethod: paymentModal.paymentMethod,
        paymentId: `PAY-${Date.now()}`
      });

      if (response.data.success) {
        alert('Payment processed successfully!');
        setPaymentModal({ isOpen: false, orderId: null, paymentMethod: 'cash_on_delivery' });
        fetchOrders(); // Refresh orders
      } else {
        alert('Payment failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleViewTracking = (order) => {
    setTrackingModal({ isOpen: true, order });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-auto h-screen overflow-y-auto`}>
            {/* Mobile menu header */}
            <div className="flex items-center justify-between h-16 px-4 border-b lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex flex-col h-full lg:h-auto">
              <div className="flex-1 px-4 py-6 space-y-2">
                <button
                  onClick={() => handleSectionChange('dashboard')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeSection === 'dashboard'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>Browse Marketplace</span>
                </button>

                <button
                  onClick={() => handleSectionChange('orders')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeSection === 'orders'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Your Orders</span>
                </button>

                <button
                  onClick={() => handleSectionChange('requests')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeSection === 'requests'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Your Requests</span>
                </button>

                <button
                  onClick={() => handleSectionChange('chats')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeSection === 'chats'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>My Chats</span>
                </button>

                <button
                  onClick={() => handleSectionChange('history')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeSection === 'history'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <History className="h-5 w-5" />
                  <span>Purchase History</span>
                </button>

                <button
                  onClick={() => handleSectionChange('saved')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeSection === 'saved'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Saved Listings</span>
                </button>

                <button
                  onClick={() => handleSectionChange('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeSection === 'profile'
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Profile</span>
                </button>
              </div>

              <div className="px-4 py-6 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            {/* Mobile menu button */}
            <div className="lg:hidden p-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Render different sections based on activeSection */}
              {activeSection === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {dashboardData?.dashboard?.welcomeMessage || 'Welcome back!'}
                </h1>
                <p className="text-gray-600">
                  Browse waste materials and manage your purchase orders
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData?.dashboard?.stats?.totalPurchases || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData?.dashboard?.stats?.activeOrders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                      <History className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData?.dashboard?.stats?.completedOrders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${dashboardData?.dashboard?.stats?.totalSpent || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {dashboardData?.dashboard?.sections?.map((section, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {section.description}
                    </p>
                    <button
                      onClick={() => {
                        if (section.action === 'Browse') navigate('/marketplace');
                        else if (section.action === 'View Orders') handleSectionChange('orders');
                        else if (section.action === 'View Saved') handleSectionChange('saved');
                      }}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      {section.action}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === 'orders' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
                <p className="text-gray-600">Track your current orders, view product details, and manage payments</p>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                      <p className="mt-1 text-sm text-gray-500">When you send requests, they will appear here</p>
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
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">{request.listing?.title}</h3>
                                  <p className="text-xs text-gray-500">Seller: {request.seller?.name}</p>
                                  <p className="text-xs text-gray-500">{request.seller?.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${request.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  request.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                    'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}>
                                  {request.status === 'pending' ? '⏳ Pending' :
                                    request.status === 'accepted' ? '✅ Order Confirmed' : '❌ Rejected'}
                                </span>
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-3">
                              {/* Product Details */}
                              <div className="flex items-center space-x-4">
                                {request.listing?.imageUrl && (
                                  <img
                                    src={request.listing.imageUrl}
                                    alt={request.listing.title}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{request.listing?.title}</h4>
                                  <p className="text-sm text-gray-600">{request.listing?.description}</p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-sm font-medium text-gray-900">Type: {request.listing?.wasteType}</span>
                                    <span className="text-sm font-medium text-green-600">Price: ${request.offerPrice}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Buyer Message */}
                              {request.message && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-blue-900 mb-1">Your Message:</p>
                                  <p className="text-sm text-blue-700">{request.message}</p>
                                </div>
                              )}

                              {/* Seller Response */}
                              {request.responseMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-green-900 mb-1">Seller Response:</p>
                                  <p className="text-sm text-green-700">{request.responseMessage}</p>
                                </div>
                              )}
                            </div>
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
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Requests</h1>
                <p className="text-gray-600">View your sent requests and seller responses</p>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Sent Requests</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {requests.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No requests yet</h3>
                      <p className="mt-1 text-sm text-gray-500">When you send requests, they will appear here</p>
                    </div>
                  ) : (
                    requests.map((request) => (
                      <div key={request._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{request.listing?.title}</h3>
                            <p className="text-gray-600 mt-1">{request.message}</p>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {request.status || 'pending'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Offer Price</p>
                                <p className="font-medium">${request.offerPrice}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Seller</p>
                                <p className="font-medium">{request.seller?.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
          {activeSection === 'history' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
                <p className="text-gray-600">View your completed purchases and spending analysis</p>
              </div>

              {/* Purchase Analytics Graph */}
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Purchase Analysis</h2>
                    <LineChart className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Spending Trend</h3>
                    <div className="h-64 relative">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                        <div className="border-b border-gray-200"></div>
                      </div>

                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 -ml-8">
                        {(() => {
                          const maxValue = Math.max(...purchaseAnalytics.map(d => d.totalAmount));
                          return [0, 25, 50, 75, 100].map(percent =>
                            Math.round(maxValue * (percent / 100))
                          );
                        })().map((value, index) => (
                          <div key={index} className="text-right">
                            ${value}
                          </div>
                        ))}
                      </div>

                      {/* Line Chart */}
                      <svg className="w-full h-full" viewBox="0 0 400 256" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                          <line
                            key={i}
                            x1="0"
                            y1={i * 64}
                            x2="400"
                            y2={i * 64}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Data line */}
                        {purchaseAnalytics.length > 1 && (
                          <polyline
                            points={purchaseAnalytics.map((data, index) => {
                              const x = (index / (purchaseAnalytics.length - 1)) * 400;
                              const maxValue = Math.max(...purchaseAnalytics.map(d => d.totalAmount));
                              const y = 256 - (maxValue > 0 ? (data.totalAmount / maxValue) * 256 : 0);
                              return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Data points */}
                        {purchaseAnalytics.map((data, index) => {
                          const x = (index / (purchaseAnalytics.length - 1)) * 400;
                          const maxValue = Math.max(...purchaseAnalytics.map(d => d.totalAmount));
                          const y = 256 - (maxValue > 0 ? (data.totalAmount / maxValue) * 256 : 0);

                          return (
                            <g key={data.month}>
                              {/* Data point circle */}
                              <circle
                                cx={x}
                                cy={y}
                                r="5"
                                fill="#10b981"
                                stroke="white"
                                strokeWidth="2"
                              />

                              {/* Value label */}
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-xs font-semibold fill-gray-700"
                              >
                                ${data.totalAmount}
                              </text>

                              {/* X-axis label */}
                              <text
                                x={x}
                                y={250}
                                textAnchor="middle"
                                className="text-xs fill-gray-600"
                              >
                                {data.monthName.split(' ')[0]}
                              </text>

                              {/* Order count */}
                              <text
                                x={x}
                                y={265}
                                textAnchor="middle"
                                className="text-xs fill-gray-500"
                              >
                                {data.count} orders
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Analytics Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Purchases</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {purchaseHistory.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${purchaseHistory.reduce((sum, p) => sum + p.totalAmount, 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Average Order</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${purchaseHistory.length > 0 ?
                          Math.round(purchaseHistory.reduce((sum, p) => sum + p.totalAmount, 0) / purchaseHistory.length) :
                          0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase History List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Completed Purchases</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {purchaseHistory.map((purchase) => (
                    <div key={purchase.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{purchase.listingTitle}</h3>
                          <p className="text-sm text-gray-600">Seller: {purchase.sellerName}</p>
                          <p className="text-sm text-gray-600">Purchase Date: {purchase.purchaseDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${purchase.totalAmount}</p>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {purchase.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'saved' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Listings</h1>
                <p className="text-gray-600">Manage your favorite and saved listings</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Seller: {listing.sellerName}</p>
                      <p className="text-sm text-gray-600 mb-2">Type: {listing.wasteType}</p>
                      <p className="text-sm text-gray-600 mb-2">Location: {listing.location}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-green-600">${listing.price}</p>
                        <button className="text-red-600 hover:text-red-800">
                          <Heart className="h-5 w-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === 'chats' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Chats</h1>
                <p className="text-gray-600">View your conversations with sellers</p>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Active Conversations</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {chats.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No chats yet</h3>
                      <p className="mt-1 text-sm text-gray-500">When you send requests, chats will appear here</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div key={chat._id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedChat(chat)}>
                        <div className="flex items-start justify-between">
                          {/* Left Side - Last Message */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{chat.listing?.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">Seller: {chat.participants.find(p => p._id === chat.listing?.seller)?.name}</p>
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

          {activeSection === 'profile' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-10 h-10 text-gray-600" />
                    </div>
                    <div className="ml-6">
                      <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                      <p className="text-gray-600">{user?.email}</p>
                      <p className="text-gray-600">{user?.location}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        defaultValue={user?.location}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
            </div>
          </div>
        </div>
      </div>


      {/* Payment Modal */}
      {
        paymentModal.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setPaymentModal({ isOpen: false, orderId: null, paymentMethod: 'cash_on_delivery' })}></div>

              <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                  <button
                    onClick={() => setPaymentModal({ isOpen: false, orderId: null, paymentMethod: 'cash_on_delivery' })}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">Select your preferred payment method:</p>

                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentModal.paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentModal({ ...paymentModal, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive the order</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentModal.paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentModal({ ...paymentModal, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Credit Card</p>
                        <p className="text-sm text-gray-500">Pay securely with your credit card</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentModal.paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentModal({ ...paymentModal, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">PayPal</p>
                        <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentModal.paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentModal({ ...paymentModal, paymentMethod: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-500">Direct bank transfer</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentModal({ isOpen: false, orderId: null, paymentMethod: 'cash_on_delivery' })}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePayment(paymentModal.orderId)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Process Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Tracking Modal */}
      {
        trackingModal.isOpen && trackingModal.order && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setTrackingModal({ isOpen: false, order: null })}></div>

              <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Order Tracking</h3>
                  <button
                    onClick={() => setTrackingModal({ isOpen: false, order: null })}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-semibold text-gray-900">{trackingModal.order.orderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${trackingModal.order.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        trackingModal.order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          trackingModal.order.status === 'processing' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            trackingModal.order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                              trackingModal.order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                        {trackingModal.order.status}
                      </span>
                    </div>
                  </div>

                  {trackingModal.order.trackingNumber && (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-indigo-700 mb-1">Tracking Number</p>
                          <p className="text-lg font-mono text-gray-900">{trackingModal.order.trackingNumber}</p>
                          <p className="text-sm text-gray-600 mt-1">Carrier: {trackingModal.order.shippingCarrier || 'Local Courier'}</p>
                        </div>
                        <button
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                          onClick={() => window.open(`https://www.google.com/search?q=${trackingModal.order.trackingNumber}`, '_blank')}
                        >
                          Track Online
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Order Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Order Timeline</h4>

                    {trackingModal.order.orderTimeline && trackingModal.order.orderTimeline.length > 0 ? (
                      <div className="space-y-3">
                        {trackingModal.order.orderTimeline.map((event, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No timeline events available</p>
                    )}
                  </div>

                  {/* Estimated Delivery */}
                  {trackingModal.order.estimatedDelivery && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-semibold text-blue-700">Estimated Delivery</p>
                          <p className="text-gray-900">{new Date(trackingModal.order.estimatedDelivery).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setTrackingModal({ isOpen: false, order: null })}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

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
    </>
  );
};

export default BuyerDashboard;
