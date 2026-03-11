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
  Wallet,
  CreditCard,
  TrendingDown,
  Download,
  Filter
} from 'lucide-react';

const Earnings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [earningsData, setEarningsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEarningsData();
  }, [selectedPeriod]);

  const fetchEarningsData = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData = {
        totalEarnings: 45678,
        pendingEarnings: 3456,
        withdrawnEarnings: 42222,
        nextPayout: 1250,
        growthRate: 12.5,
        monthlyData: [
          { month: 'Jan', earnings: 3456, withdrawn: 3000 },
          { month: 'Feb', earnings: 4567, withdrawn: 4000 },
          { month: 'Mar', earnings: 3890, withdrawn: 3500 },
          { month: 'Apr', earnings: 5678, withdrawn: 5200 },
          { month: 'May', earnings: 7234, withdrawn: 6500 },
          { month: 'Jun', earnings: 20853, withdrawn: 20022 }
        ],
        recentPayouts: [
          { id: 1, amount: 4500, date: '2024-06-15', status: 'completed', method: 'Bank Transfer' },
          { id: 2, amount: 3200, date: '2024-06-10', status: 'completed', method: 'PayPal' },
          { id: 3, amount: 1800, date: '2024-06-05', status: 'pending', method: 'Bank Transfer' },
          { id: 4, amount: 2500, date: '2024-05-30', status: 'completed', method: 'UPI' }
        ],
        paymentMethods: [
          { method: 'Bank Transfer', account: '****1234', isDefault: true },
          { method: 'PayPal', account: 'seller@example.com', isDefault: false },
          { method: 'UPI', account: 'seller@upi', isDefault: false }
        ]
      };
      
      setTimeout(() => {
        setEarningsData(mockData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
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

  const handleWithdraw = () => {
    alert('Withdrawal feature coming soon!');
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
                  className="w-full flex items-center space-x-3 text-green-600 bg-green-50 rounded-lg px-3 py-2 transition-colors"
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
            <h1 className="text-lg font-semibold text-gray-800">Earnings</h1>
            <div className="w-6"></div>
          </div>

          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Earnings</h1>
              <p className="text-gray-600">Manage your earnings and withdrawals</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">₹{earningsData?.totalEarnings.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">+{earningsData?.growthRate}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">₹{earningsData?.pendingEarnings.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <Calendar className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-500">Clearing soon</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Withdrawn</p>
                    <p className="text-2xl font-bold text-gray-900">₹{earningsData?.withdrawnEarnings.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowDown className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-500">This month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Next Payout</p>
                    <p className="text-2xl font-bold text-gray-900">₹{earningsData?.nextPayout.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">In 3 days</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleWithdraw}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Withdraw Earnings</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md transform hover:scale-105">
                <Download className="w-5 h-5" />
                <span>Download Statement</span>
              </button>
            </div>

            {/* Earnings Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                  </select>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {earningsData?.monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 w-12">{data.month}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(data.earnings / 20853) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">₹{data.earnings.toLocaleString()}</span>
                      <span className="text-sm text-gray-500"> withdrawn: ₹{data.withdrawn.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payouts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Payouts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earningsData?.recentPayouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{payout.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payout.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payout.method}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payout.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              </div>
              <div className="p-6 space-y-4">
                {earningsData?.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{method.method}</p>
                        <p className="text-sm text-gray-500">{method.account}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Default</span>
                      )}
                      <button className="text-gray-500 hover:text-gray-700">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
