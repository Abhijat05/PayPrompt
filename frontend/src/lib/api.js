import axios from "axios";

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track request retries to prevent infinite loops
const retryQueue = new Map();

// Request interceptor for adding auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    // Add token to Authorization header if requiresAuth is not explicitly set to false
    if (config.requiresAuth !== false && config._token) {
      config.headers.Authorization = `Bearer ${config._token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    const message = error.response?.data?.message || "An unexpected error occurred";

    // Only log to console in development
    if (import.meta.env.DEV) {
      console.error(`API Error: ${message}`, error);
    }

    return Promise.reject(error);
  }
);

// Helper function to execute API calls with better error handling
const executeApiCall = async (apiCallFn) => {
  try {
    return await apiCallFn();
  } catch (error) {
    // Check specific error types and handle them appropriately
    if (axios.isAxiosError(error)) {
      // Handle specific HTTP errors
      if (error.response?.status === 401) {
        // Handle unauthorized error (e.g., redirect to login)
        console.warn("Authentication error occurred");
      }

      if (error.response?.status === 429) {
        // Rate limiting - could implement retry with backoff
        console.warn("Rate limit hit, please try again later");
      }
    }

    throw error;
  }
};

// Example implementation of the customerService
export const customerService = {
  getAllCustomers: async (token) => {
    try {
      // Try to connect to your backend API
      const response = await fetch('http://localhost:3000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Log the error details for debugging
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        // Create a fallback response during development if backend is down
        if (process.env.NODE_ENV === 'development') {
          console.warn('Creating fallback customer data since API is not available');
          return [];
        }
        
        throw new Error('Failed to fetch customers');
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      
      // For development purposes - return empty array
      if (process.env.NODE_ENV === 'development') {
        return [];
      }
      
      throw error; // Re-throw the original error
    }
  },

  getCustomerProfile: async (customerId, token) => {
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // For development, create a customer record if it doesn't exist
        if (response.status === 404 && process.env.NODE_ENV === 'development') {
          console.warn('Customer not found, attempting to create one');
          
          // Try to create a new customer
          const createResponse = await fetch('http://localhost:3000/api/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              clerkId: customerId,
              name: 'New Customer',
              address: 'Address pending update',
              phone: 'Phone pending update',
              balance: 1000
            })
          });
          
          if (createResponse.ok) {
            const newCustomer = await createResponse.json();
            return newCustomer;
          }
        }
        
        throw new Error('Failed to fetch customer profile');
      }

      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  getTransactionHistory: async (customerId, params = {}, token) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await fetch(
      `http://localhost:3000/api/customers/${customerId}/transactions?${queryParams}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  },

  updateCustomerBalance: async (customerId, data, token) => {
    const response = await fetch(`http://localhost:3000/api/customers/${customerId}/balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update balance');
    }

    return response.json();
  }
};

export const orderService = {
  getAllOrders: async (params = {}, token) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await fetch(`http://localhost:3000/api/orders?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }
};
