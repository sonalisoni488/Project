import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
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
  Image
} from 'lucide-react';

const SellerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [listings, setListings] = useState([]);
  const [showAddListing, setShowAddListing] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    category: 'plastic',
    quantity: '',
    expectedPrice: '',
    description: '',
    location: '',
    image: null
  });

  // Toast notification functions
  const showToast = (message, type = 'info', duration = 5000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const hideToast = () => setToast(null);

  // Enhanced toast with different durations based on type
  const showSuccessToast = (message) => showToast(message, 'success', 4000);
  const showErrorToast = (message) => showToast(message, 'error', 8000);
  const showWarningToast = (message) => showToast(message, 'warning', 6000);
  const showInfoToast = (message) => showToast(message, 'info', 5000);

  // Premium toast component with glassmorphism and advanced animations
  const ToastNotification = () => {
    if (!toast) return null;

    const getIcon = () => {
      switch (toast.type) {
        case 'success':
          return <CheckCircle className="w-5 h-5 flex-shrink-0" />;
        case 'error':
          return <XCircle className="w-5 h-5 flex-shrink-0" />;
        case 'warning':
          return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
        default:
          return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
      }
    };

    const getGlassStyles = () => {
      switch (toast.type) {
        case 'success':
          return 'backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl shadow-white/10 text-gray-800';
        case 'error':
          return 'backdrop-blur-xl bg-red-500/80 border-red-400/30 shadow-2xl shadow-red-500/20 text-white';
        case 'warning':
          return 'backdrop-blur-xl bg-amber-500/80 border-amber-400/30 shadow-2xl shadow-amber-500/20 text-white';
        default:
          return 'backdrop-blur-xl bg-blue-500/80 border-blue-400/30 shadow-2xl shadow-blue-500/20 text-white';
      }
    };

    const getIconBgStyles = () => {
      switch (toast.type) {
        case 'success': 
          return 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 text-white shadow-lg';
        case 'error': 
          return 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600 text-white shadow-lg';
        case 'warning': 
          return 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-white shadow-lg';
        default: 
          return 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 text-white shadow-lg';
      }
    };

    const getProgressStyles = () => {
      switch (toast.type) {
        case 'success': return 'bg-gradient-to-r from-emerald-400 to-green-600';
        case 'error': return 'bg-gradient-to-r from-rose-400 to-red-600';
        case 'warning': return 'bg-gradient-to-r from-amber-400 to-yellow-600';
        default: return 'bg-gradient-to-r from-indigo-400 to-blue-600';
      }
    };

    const getStatusBadge = () => {
      switch (toast.type) {
        case 'success': return 'bg-green-100 text-green-800 border-green-200';
        case 'error': return 'bg-red-100 text-red-800 border-red-200';
        case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    };

    return (
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <div className="pointer-events-auto">
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-3xl blur-xl opacity-30 ${getProgressStyles()}`}></div>
          
          {/* Main toast container */}
          <div 
            className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl ${getGlassStyles()} min-w-[380px] max-w-lg transform transition-all duration-500 ease-out hover:scale-105 hover:rotate-1 animate-in`}
          >
            
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
            </div>
            
            {/* Top decorative line */}
            <div className={`h-1 w-full ${getProgressStyles()} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              <div className="h-full w-1/3 bg-gradient-to-r from-white/60 to-white/90 animate-pulse"></div>
            </div>
            
            <div className="relative p-6">
              <div className="flex items-start gap-4">
                {/* Icon with advanced styling */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${getIconBgStyles()} shadow-2xl transform transition-transform duration-300 hover:scale-110 hover:rotate-12`}>
                  {getIcon()}
                </div>
                
                {/* Content area */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold leading-tight mb-3 break-words">
                    {toast.message}
                  </p>
                  
                  {/* Status and time */}
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge()}`}>
                      {toast.type === 'success' && (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          <span>Success</span>
                        </>
                      )}
                      {toast.type === 'error' && (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          <span>Error</span>
                        </>
                      )}
                      {toast.type === 'warning' && (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          <span>Warning</span>
                        </>
                      )}
                      {toast.type === 'info' && (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          <span>Info</span>
                        </>
                      )}
                    </div>
                    
                    <div className="text-xs opacity-60 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-current opacity-30 mr-2"></div>
                      <span>Just now</span>
                    </div>
                  </div>
                </div>
                
                {/* Advanced close button */}
                <button
                  onClick={hideToast}
                  className="flex-shrink-0 p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <X className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
            
            {/* Bottom progress indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent">
              <div 
                className={`h-full ${getProgressStyles()} relative`}
                style={{
                  animation: 'progressShrink 5s linear forwards',
                  boxShadow: '0 0 10px currentColor'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Ensure image field is never an object
  useEffect(() => {
    if (formData.image && typeof formData.image === 'object' && !(formData.image instanceof File)) {
      console.log('🔧 useEffect: Cleaning image object to null:', formData.image);
      setFormData(prev => ({ ...prev, image: null }));
    }
  }, [formData.image]);
  
  // Add custom styles to document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes progressShrink {
        from { 
          width: 100%; 
          opacity: 1;
        }
        to { 
          width: 0%; 
          opacity: 0.3;
        }
      }
      @keyframes slideInBounce {
        0% {
          transform: translateX(100%) scale(0.8) rotate(-2deg);
          opacity: 0;
        }
        50% {
          transform: translateX(-10%) scale(1.02) rotate(1deg);
          opacity: 0.8;
        }
        100% {
          transform: translateX(0) scale(1) rotate(0deg);
          opacity: 1;
        }
      }
      .animate-in {
        animation: slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Cleanup styles when component unmounts
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const wasteCategories = [
    { value: 'plastic', label: 'Plastic' },
    { value: 'paper', label: 'Paper' },
    { value: 'metal', label: 'Metal' },
    { value: 'textile', label: 'Textile' },
    { value: 'ewaste', label: 'E-waste' },
    { value: 'construction', label: 'Construction material' }
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchListings();
  }, []);

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

  const fetchListings = async () => {
    try {
      const response = await api.get('/seller/listings');
      setListings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      if (files && files[0]) {
        // Validate file
        const file = files[0];
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
          showErrorToast('🖼️ Invalid file type! Please select a JPG, PNG, or GIF image.');
          return;
        }
        
        if (file.size > maxSize) {
          showErrorToast('📸 File too large! Please select an image smaller than 5MB.');
          return;
        }
        
        setFormData(prev => ({ ...prev, [name]: file }));
        showInfoToast(`📸 Image selected: ${file.name}`);
      } else {
        // Keep it as null if no file selected
        setFormData(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Real-time validation feedback
      if (name === 'quantity') {
        const weight = parseFloat(value);
        if (weight > 1000) {
          showWarningToast('⚖️ Weight exceeds 1000 kg limit!');
        } else if (weight < 0.1) {
          showWarningToast('⚖️ Weight must be at least 0.1 kg!');
        }
      }
      
      if (name === 'expectedPrice') {
        const price = parseFloat(value);
        if (price < 0) {
          showWarningToast('💰 Price cannot be negative!');
        }
      }
    }
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    
    // Pre-submission validation
    if (!formData.category) {
      showErrorToast('📂 Please select a waste category!');
      return;
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      showErrorToast('⚖️ Please enter a valid weight!');
      return;
    }
    
    if (parseFloat(formData.quantity) > 1000) {
      showErrorToast('⚖️ Weight cannot exceed 1000 kg!');
      return;
    }
    
    if (!formData.expectedPrice || parseFloat(formData.expectedPrice) < 0) {
      showErrorToast('💰 Please enter a valid price!');
      return;
    }
    
    if (!formData.description || formData.description.trim().length < 10) {
      showErrorToast('📝 Please provide a detailed description (at least 10 characters)!');
      return;
    }
    
    if (!formData.location || formData.location.trim().length < 3) {
      showErrorToast('📍 Please enter a valid location!');
      return;
    }
    
    setIsLoading(true);
    showInfoToast('📤 Creating your listing...');

    try {
      // Create a completely fresh FormData object to avoid prototype pollution
      const formDataToSend = new FormData();
      
      console.log('🔧 Creating FormData from scratch...');
      
      // Add fields one by one to ensure they're properly added
      formDataToSend.append("category", formData.category);
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("expectedPrice", formData.expectedPrice);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);

      // Handle image file separately
      if (formData.image instanceof File) {
        console.log('📸 Image file details:', {
          name: formData.image.name,
          size: formData.image.size,
          type: formData.image.type,
          lastModified: formData.image.lastModified
        });
        formDataToSend.append("image", formData.image);
        console.log("📸 Image added:", formData.image.name);
      } else {
        console.log('⚠️ No image file selected');
      }

      console.log('📦 Final FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
      }

      // Create a custom axios config for FormData to override default Content-Type
      // CRITICAL: Use raw axios to avoid default Content-Type interference
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
          // DO NOT set Content-Type - let axios set it as multipart/form-data with boundary
        }
      };

      console.log('🌐 Sending request with config:', config);
      console.log('📦 FormData being sent:', formDataToSend);
      
      // Verify FormData before sending
      console.log('🔍 FormData verification:');
      console.log('  - Has image field:', formDataToSend.has('image'));
      console.log('  - Image value:', formDataToSend.get('image'));
      console.log('  - All entries count:', Array.from(formDataToSend.entries()).length);

      // Make the request with proper error handling using raw axios
      let response;
      if (editingListing) {
        response = await axios.put(
          `http://localhost:5002/api/seller/listings/${editingListing._id}`,
          formDataToSend,
          config
        );
      } else {
        response = await axios.post(
          "http://localhost:5002/api/seller/listings",
          formDataToSend,
          config
        );
      }
      
      console.log('✅ Response received:', response.data);

      // Show success toast with more details
      showSuccessToast(`Listing created successfully! Your ${formData.category} waste listing is now live.`);

      fetchListings();
      setShowAddListing(false);
      setEditingListing(null);
      setFormData({
        category: "plastic",
        quantity: "",
        expectedPrice: "",
        description: "",
        location: "",
        image: null
      });
    } catch (error) {
      console.error("❌ Error saving listing:", error);
      
      // Enhanced error handling with user-friendly messages
      let errorMessage = "Server error creating listing";
      let errorType = 'error';
      
      if (error.response) {
        // Server responded with error status
        console.error("🔴 Server Response Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Handle specific validation errors with user-friendly messages
        if (error.response.status === 400) {
          if (error.response.data?.message) {
            const message = error.response.data.message;
            
            // Weight validation errors
            if (message.includes('Weight cannot exceed')) {
              errorMessage = "⚖️ Weight too heavy! Maximum allowed is 1000 kg. Please enter a smaller weight.";
            }
            // Category validation errors
            else if (message.includes('not a valid enum value')) {
              errorMessage = "📂 Invalid category! Please select a valid waste category from the dropdown.";
            }
            // Required field errors
            else if (message.includes('required')) {
              errorMessage = "⚠️ Missing information! Please fill in all required fields marked with *.";
            }
            // Image errors
            else if (message.includes('Image')) {
              errorMessage = "🖼️ Image issue! Please select a valid image file for your listing.";
            }
            // General validation
            else {
              errorMessage = "⚠️ Validation failed! Please check all fields and try again.";
            }
          } else {
            errorMessage = "⚠️ Invalid data! Please review your listing information and try again.";
          }
        } else if (error.response.status === 401) {
          errorMessage = "🔐 Session expired! Please log in again to continue.";
          errorType = 'warning';
        } else if (error.response.status === 403) {
          errorMessage = "🚫 Permission denied! You don't have permission to create listings.";
          errorType = 'warning';
        } else if (error.response.status === 413) {
          errorMessage = "📸 Image too large! Please select a smaller image (max 5MB).";
        } else {
          errorMessage = `🔴 Server error (${error.response.status}): ${error.response.data?.message || 'Please try again later.'}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error("🔴 Network Error:", error.request);
        errorMessage = "🌐 Network error! Please check your internet connection and try again.";
        errorType = 'warning';
      } else {
        // Something else happened
        console.error("🔴 Request Setup Error:", error.message);
        errorMessage = "💻 Application error! Please refresh the page and try again.";
      }
      
      // Show enhanced error toast
      if (errorType === 'warning') {
        showWarningToast(errorMessage);
      } else {
        showErrorToast(errorMessage);
      }
      
      // Log the complete error for debugging
      console.error("🔴 Complete Error Details:", {
        message: error.message,
        stack: error.stack,
        config: error.config,
        response: error.response,
        request: error.request
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditListing = (listing) => {
    setEditingListing(listing);
    setFormData({
      category: listing.wasteType,
      quantity: listing.weight,
      expectedPrice: listing.finalPrice,
      description: listing.description,
      location: listing.location,
      image: null
    });
    setShowAddListing(true);
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/seller/listings/${listingId}`);
        fetchListings();
      } catch (error) {
        console.error('Error deleting listing:', error);
      }
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
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 md:flex md:flex-col h-screen`}>
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
                <button className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors">
                  <Package className="w-5 h-5" />
                  <span>My Listings</span>
                </button>
                <button className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                  <span>Sales Analytics</span>
                </button>
                <button className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors">
                  <DollarSign className="w-5 h-5" />
                  <span>Earnings</span>
                </button>
                <button className="w-full flex items-center space-x-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-colors">
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
        <div className="flex-1 md:ml-0">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Seller Dashboard</h1>
            <div className="w-6"></div>
          </div>

          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Listings</h1>
              <p className="text-gray-600">Manage your waste material listings and track your sales</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Listings</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData?.totalListings || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData?.totalSales.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">${dashboardData?.revenue || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Buyer Offers</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData?.buyerOffers || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Listing Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddListing(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Listing</span>
              </button>
            </div>

            {/* Listings */}
            <div className="mb-6">
              {listings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No listings</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new listing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {listings.map((listing) => (
                    <div key={listing._id} className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                      {/* Card Header with Image */}
                      <div className="relative h-32 overflow-hidden bg-gray-50">
                        {listing.imageUrl ? (
                          <img
                            src={listing.imageUrl}
                            alt={listing.wasteType}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            listing.status === 'available' 
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {listing.status === 'available' ? 'Available' : 'Sold'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        {/* Waste Type Badge */}
                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            <Package className="w-3 h-3 mr-1" />
                            {listing.wasteType}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                          {listing.description ? 
                            listing.description.split(' ').slice(0, 6).join(' ') + (listing.description.split(' ').length > 6 ? '...' : '') 
                            : `${listing.wasteType} Material`
                          }
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {listing.description || `High-quality ${listing.wasteType} material available.`}
                        </p>

                        {/* Details */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-xs text-gray-500">
                            <Package className="w-3 h-3 mr-1" />
                            {listing.weight} kg
                          </div>
                          <div className="flex items-center text-xs font-medium text-gray-900">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ₹{listing.finalPrice?.toLocaleString() || listing.suggestedPrice?.toLocaleString() || '0'}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{listing.location}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditListing(listing)}
                            className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing._id)}
                            className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Listing Modal */}
      {showAddListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddListing(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingListing ? 'Edit Listing' : 'Add New Listing'}
              </h3>
              
              <form onSubmit={handleSubmitListing}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Tag className="w-4 h-4 inline mr-1" />
                      Waste Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      {wasteCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Price
                    </label>
                    <input
                      type="number"
                      name="expectedPrice"
                      value={formData.expectedPrice}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Image className="w-4 h-4 inline mr-1" />
                      Upload Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddListing(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : (editingListing ? 'Update' : 'Add')} Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastNotification />
    </div>
  );
};

export default SellerDashboard;
