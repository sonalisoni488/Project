import axios from 'axios';

// Create axios instance
export const authAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authEndpoints = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  profile: '/auth/profile',
  password: '/auth/password',
  logout: '/auth/logout',
  verify: '/auth/verify',
};

// Listings API endpoints
export const listingEndpoints = {
  listings: '/listings',
  listing: (id) => `/listings/${id}`,
  myListings: '/listings/my/listings',
  create: '/listings',
  update: (id) => `/listings/${id}`,
  delete: (id) => `/listings/${id}`,
  interest: (id) => `/listings/${id}/interest`,
  removeInterest: (id) => `/listings/${id}/interest`,
  stats: '/listings/stats/admin',
};

// Transactions API endpoints
export const transactionEndpoints = {
  transactions: '/transactions',
  transaction: (id) => `/transactions/${id}`,
  create: '/transactions',
  updateStatus: (id) => `/transactions/${id}/status`,
  review: (id) => `/transactions/${id}/review`,
  dispute: (id) => `/transactions/${id}/dispute`,
  resolveDispute: (id) => `/transactions/${id}/dispute/resolve`,
  stats: '/transactions/stats/admin',
};

// API functions for authentication
export const authAPIFunctions = {
  login: (credentials) => authAPI.post(authEndpoints.login, credentials),
  register: (userData) => authAPI.post(authEndpoints.register, userData),
  getProfile: () => authAPI.get(authEndpoints.me),
  updateProfile: (userData) => authAPI.put(authEndpoints.profile, userData),
  changePassword: (passwordData) => authAPI.put(authEndpoints.password, passwordData),
  logout: () => authAPI.post(authEndpoints.logout),
  verifyToken: () => authAPI.get(authEndpoints.verify),
};

// API functions for listings
export const listingAPIFunctions = {
  getListings: (params = {}) => api.get(listingEndpoints.listings, { params }),
  getListing: (id) => api.get(listingEndpoints.listing(id)),
  getMyListings: (params = {}) => api.get(listingEndpoints.myListings, { params }),
  createListing: (formData) => api.post(listingEndpoints.create, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateListing: (id, data) => api.put(listingEndpoints.update(id), data),
  deleteListing: (id) => api.delete(listingEndpoints.delete(id)),
  showInterest: (id) => api.post(listingEndpoints.interest(id)),
  removeInterest: (id) => api.delete(listingEndpoints.removeInterest(id)),
  getStats: () => api.get(listingEndpoints.stats),
};

// API functions for transactions
export const transactionAPIFunctions = {
  getTransactions: (params = {}) => api.get(transactionEndpoints.transactions, { params }),
  getTransaction: (id) => api.get(transactionEndpoints.transaction(id)),
  createTransaction: (data) => api.post(transactionEndpoints.create, data),
  updateTransactionStatus: (id, status) => api.put(transactionEndpoints.updateStatus(id), { status }),
  addReview: (id, reviewData) => api.post(transactionEndpoints.review(id), reviewData),
  createDispute: (id, reason) => api.post(transactionEndpoints.dispute(id), { reason }),
  resolveDispute: (id, resolution) => api.put(transactionEndpoints.resolveDispute(id), { resolution }),
  getStats: (params = {}) => api.get(transactionEndpoints.stats, { params }),
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      message: error.response.data.message || 'Server error',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'Network error. Please check your connection.',
      status: null,
      data: null,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An unexpected error occurred',
      status: null,
      data: null,
    };
  }
};

// Export default API instance
export default api;
