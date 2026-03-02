import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { api } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token header
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user from token
  const loadUser = useCallback(async () => {
    console.log('🔐 loadUser called');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🔐 No token found, setting loading to false');
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'No token found' });
      return;
    }

    setAuthToken(token);
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });

    try {
      console.log('🔐 Making API call to /auth/me');
      const response = await api.get('/auth/me');
      console.log('🔐 User data received:', response.data);
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: response.data.user });
    } catch (error) {
      console.error('🔐 Load user error:', error);
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: error.response?.data?.message || 'Failed to load user' });
      setAuthToken(null);
    }
  }, []);

  // Login user
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      setAuthToken(token);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { token, user } });
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      return { success: false, error: message };
    }
  };

  // Register user
  const register = async (userData) => {
    console.log('🔐 AuthContext register called with:', userData);
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      console.log('📡 Making API request to register...');
      const response = await api.post('/auth/register', userData);
      console.log('📡 API response:', response.data);
      const { token, user } = response.data;
      
      setAuthToken(token);
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: { token, user } });
      
      console.log('✅ Registration successful in AuthContext');
      return { success: true, user };
    } catch (error) {
      console.error('❌ AuthContext register error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: message });
      return { success: false, error: message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.data.user });
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/password', passwordData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    console.log('🔐 clearError called');
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is seller
  const isSeller = () => {
    return hasRole('seller');
  };

  // Check if user is buyer
  const isBuyer = () => {
    return hasRole('buyer');
  };

  // Initialize on mount
  useEffect(() => {
    console.log('🔐 AuthContext mounted, calling loadUser');
    loadUser();
  }, []); // Remove loadUser dependency to prevent infinite loop

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    clearError,
    hasRole,
    isAdmin,
    isSeller,
    isBuyer,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
