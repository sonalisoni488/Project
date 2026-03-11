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
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download
} from 'lucide-react';

const SalesAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData = {
        totalRevenue: 45678,
        totalSales: 156,
        averageOrderValue: 293,
        growthRate: 12.5,
        monthlyData: [
          { month: 'Jan', sales: 12, revenue: 3456 },
          { month: 'Feb', sales: 18, revenue: 4567 },
          { month: 'Mar', sales: 15, revenue: 3890 },
          { month: 'Apr', sales: 22, revenue: 5678 },
          { month: 'May', sales: 28, revenue: 7234 },
          { month: 'Jun', sales: 61, revenue: 20853 }
        ],
        topCategories: [
          { category: 'Plastic', sales: 45, percentage: 28.8 },
          { category: 'Metal', sales: 38, percentage: 24.4 },
          { category: 'Paper', sales: 32, percentage: 20.5 },
          { category: 'E-waste', sales: 25, percentage: 16.0 },
          { category: 'Organic', sales: 16, percentage: 10.3 }
        ],
        recentTransactions: [
          { id: 1, item: 'Plastic Bottles', amount: 450, date: '2024-06-15', status: 'completed' },
          { id: 2, item: 'Metal Scrap', amount: 780, date: '2024-06-14', status: 'completed' },
          { id: 3, item: 'Paper Waste', amount: 320, date: '2024-06-13', status: 'pending' },
          { id: 4, item: 'E-waste', amount: 1250, date: '2024-06-12', status: 'completed' }
        ]
      };
      
      setTimeout(() => {
        setAnalyticsData(mockData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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
                  className="w-full flex items-center space-x-3 text-green-600 bg-green-50 rounded-lg px-3 py-2 transition-colors"
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
                  className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors"
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
            <h1 className="text-lg font-semibold text-gray-800">Sales Analytics</h1>
            <div className="w-6"></div>
          </div>

          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Analytics</h1>
              <p className="text-gray-600">Track your sales performance and business insights</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{analyticsData?.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+{analyticsData?.growthRate}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.totalSales}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+15.3%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{analyticsData?.averageOrderValue}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+8.2%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Growth Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData?.growthRate}%</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">Positive</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Sales Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Sales</h3>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {analyticsData?.monthlyData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-12">{data.month}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(data.sales / 61) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{data.sales}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
                  <PieChart className="w-5 h-5 text-gray-500" />
                </div>
                <div className="space-y-4">
                  {analyticsData?.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 
                          index === 3 ? 'bg-purple-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{category.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{category.sales}</span>
                        <span className="text-sm text-gray-500">({category.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData?.recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.item}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{transaction.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
