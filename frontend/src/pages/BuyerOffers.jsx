import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Menu, 
  X, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

const BuyerOffers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offersData, setOffersData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffersData();
  }, [selectedFilter, searchTerm]);

  const fetchOffersData = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData = {
        stats: {
          totalOffers: 45,
          pendingOffers: 12,
          acceptedOffers: 28,
          rejectedOffers: 5
        },
        offers: [
          {
            id: 1,
            buyerName: 'John Smith',
            buyerEmail: 'john@example.com',
            listingTitle: 'Premium Plastic Waste',
            listingCategory: 'Plastic',
            offeredPrice: 450,
            originalPrice: 500,
            quantity: 50,
            message: 'I am interested in purchasing this plastic waste for my recycling business. Can we negotiate the price?',
            status: 'pending',
            createdAt: '2024-06-15T10:30:00Z',
            expiresAt: '2024-06-20T10:30:00Z'
          },
          {
            id: 2,
            buyerName: 'Sarah Johnson',
            buyerEmail: 'sarah@company.com',
            listingTitle: 'Metal Scrap Collection',
            listingCategory: 'Metal',
            offeredPrice: 780,
            originalPrice: 850,
            quantity: 100,
            message: 'We need this metal scrap for our manufacturing unit. Quality looks good from the photos.',
            status: 'accepted',
            createdAt: '2024-06-14T14:20:00Z',
            expiresAt: '2024-06-19T14:20:00Z'
          },
          {
            id: 3,
            buyerName: 'Mike Wilson',
            buyerEmail: 'mike@recycling.com',
            listingTitle: 'Paper Waste Bundle',
            listingCategory: 'Paper',
            offeredPrice: 320,
            originalPrice: 400,
            quantity: 75,
            message: 'Looking for bulk paper waste. Is this available for immediate pickup?',
            status: 'rejected',
            createdAt: '2024-06-13T09:15:00Z',
            expiresAt: '2024-06-18T09:15:00Z'
          },
          {
            id: 4,
            buyerName: 'Emily Davis',
            buyerEmail: 'emily@green.com',
            listingTitle: 'E-waste Collection',
            listingCategory: 'E-waste',
            offeredPrice: 1250,
            originalPrice: 1500,
            quantity: 25,
            message: 'Interested in your e-waste. We are certified recyclers and can handle proper disposal.',
            status: 'pending',
            createdAt: '2024-06-12T16:45:00Z',
            expiresAt: '2024-06-17T16:45:00Z'
          },
          {
            id: 5,
            buyerName: 'Robert Brown',
            buyerEmail: 'robert@industry.com',
            listingTitle: 'Organic Waste',
            listingCategory: 'Organic',
            offeredPrice: 180,
            originalPrice: 200,
            quantity: 30,
            message: 'Need organic waste for composting. Can you deliver?',
            status: 'accepted',
            createdAt: '2024-06-11T11:30:00Z',
            expiresAt: '2024-06-16T11:30:00Z'
          }
        ]
      };
      
      setTimeout(() => {
        setOffersData(mockData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching offers data:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (page) => {
    setSidebarOpen(false);
    switch(page) {
      case 'listings':
        navigate('/seller-dashboard');
        break;
      case 'analytics':
        navigate('/sales-analytics');
        break;
      case 'earnings':
        navigate('/earnings');
        break;
      case 'offers':
        navigate('/buyer-offers');
        break;
      default:
        navigate('/seller-dashboard');
    }
  };

  const handleOfferAction = (offerId, action) => {
    alert(`${action} offer ${offerId} - Feature coming soon!`);
  };

  const filteredOffers = offersData?.offers.filter(offer => {
    const matchesFilter = selectedFilter === 'all' || offer.status === selectedFilter;
    const matchesSearch = searchTerm === '' || 
      offer.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.listingCategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:flex md:flex-col h-screen`}>
          <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">Seller Dashboard</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex flex-col flex-1 min-h-0">
            <nav className="flex-1 overflow-y-auto">
              <div className="px-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Menu</h3>
                <button 
                  onClick={() => handleNavigation('listings')}
                  className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>My Listings</span>
                </button>
                <button 
                  onClick={() => handleNavigation('analytics')}
                  className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Sales Analytics</span>
                </button>
                <button 
                  onClick={() => handleNavigation('earnings')}
                  className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Earnings</span>
                </button>
                <button 
                  onClick={() => handleNavigation('offers')}
                  className="w-full flex items-center space-x-3 text-green-600 bg-green-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>Buyer Offers</span>
                </button>
              </div>
            </nav>
            
            <div className="flex-shrink-0 p-4 border-t bg-white">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 min-h-screen">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Buyer Offers</h1>
            <div className="w-6"></div>
          </div>

          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Buyer Offers</h1>
              <p className="text-gray-600">Manage and respond to buyer offers for your listings</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Offers</p>
                    <p className="text-2xl font-bold text-gray-900">{offersData?.stats.totalOffers}</p>
                    <div className="flex items-center mt-2">
                      <Users className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-500">All time</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{offersData?.stats.pendingOffers}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-500">Need action</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Accepted</p>
                    <p className="text-2xl font-bold text-gray-900">{offersData?.stats.acceptedOffers}</p>
                    <div className="flex items-center mt-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">Confirmed</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{offersData?.stats.rejectedOffers}</p>
                    <div className="flex items-center mt-2">
                      <XCircle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-500">Declined</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search offers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Offers</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Offers List */}
            <div className="space-y-4">
              {filteredOffers?.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{offer.buyerName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(offer.status)}`}>
                            {offer.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{offer.buyerEmail}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {new Date(offer.expiresAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{offer.offeredPrice}</div>
                        <div className="text-sm text-gray-500 line-through">₹{offer.originalPrice}</div>
                        <div className="text-sm text-green-600">
                          {Math.round(((offer.originalPrice - offer.offeredPrice) / offer.originalPrice) * 100)}% off
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Listing: {offer.listingTitle}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Category: {offer.listingCategory}</span>
                        <span>Quantity: {offer.quantity} kg</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                        <p className="text-sm text-gray-600 flex-1">{offer.message}</p>
                      </div>
                    </div>

                    {offer.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleOfferAction(offer.id, 'accept')}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleOfferAction(offer.id, 'reject')}
                          className="flex items-center space-x-2 bg-white text-red-600 border-2 border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors shadow-sm hover:shadow-green-200 transform hover:scale-105"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105">
                          <MessageSquare className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                      </div>
                    )}

                    {offer.status === 'accepted' && (
                      <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105">
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105">
                          <MessageSquare className="w-4 h-4" />
                          <span>Contact Buyer</span>
                        </button>
                      </div>
                    )}

                    {offer.status === 'rejected' && (
                      <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105">
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredOffers?.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No offers found</h3>
                <p className="mt-1 text-sm text-gray-500">No offers match your current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerOffers;
