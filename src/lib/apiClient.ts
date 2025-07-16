import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Environment configuration for API URLs
const API_CONFIG = {
  development: {
    baseURL: 'https://xwhdjaer9f.execute-api.ap-southeast-1.amazonaws.com/dev/', // AWS API Gateway
    timeout: 15000,
  },
  production: {
    baseURL: 'https://xwhdjaer9f.execute-api.ap-southeast-1.amazonaws.com/dev/', // AWS API Gateway
    timeout: 20000,
  },
  mock: {
    baseURL: '/mock-api', // Mock API for development
    timeout: 5000,
  },
} as const;

// Get current environment mode
const getEnvironment = (): 'development' | 'production' | 'mock' => {
  // Check for explicit mode override
  if (localStorage.getItem('api-mode') === 'mock') return 'mock';
  if (localStorage.getItem('api-mode') === 'real') return import.meta.env.PROD ? 'production' : 'development';
  
  // Default behavior: use real API in both development and production
  return import.meta.env.PROD ? 'production' : 'development';
};

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const env = getEnvironment();
  const config = API_CONFIG[env];
  
  console.log('[API Client] Environment:', env);
  console.log('[API Client] Config:', config);
  console.log('[API Client] localStorage api-mode:', localStorage.getItem('api-mode'));
  
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Accept': 'application/json',
    },
    // Disable credentials for AWS API Gateway
    withCredentials: false,
  });

  // Request interceptor for logging and auth
  instance.interceptors.request.use(
    (config) => {
      // Add Content-Type only for requests that need it (POST, PUT, PATCH)
      if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
        config.headers['Content-Type'] = 'application/json';
      }

      // Log outgoing requests in development
      if (import.meta.env.DEV) {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          headers: config.headers,
        });
      }

      // Skip auth token for now since AWS API Gateway connections endpoint doesn't require it
      // const token = localStorage.getItem('auth-token');
      // if (token && !config.url?.includes('/connections')) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }

      // Add request timestamp for performance monitoring
      config.metadata = { startTime: Date.now() };

      return config;
    },
    (error) => {
      console.error('[API] Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and logging
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (import.meta.env.DEV) {
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
        
        // Warn about slow responses
        if (duration > 2000) {
          console.warn(`[API] Slow response: ${duration}ms for ${response.config.url}`);
        }
      }

      return response;
    },
    (error) => {
      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        const { status, data, config } = error.response;
        
        console.error(`[API] ${status} Error for ${config.method?.toUpperCase()} ${config.url}:`, data);
        
        // Handle specific error cases
        switch (status) {
          case 401:
            // Unauthorized - clear auth token and redirect to login
            localStorage.removeItem('auth-token');
            console.warn('[API] Authentication required');
            break;
          case 403:
            // Forbidden - show access denied message
            console.warn('[API] Access denied - insufficient permissions');
            break;
          case 404:
            // Not found - handle gracefully
            console.warn('[API] Resource not found');
            break;
          case 429:
            // Rate limited - could implement retry with backoff
            console.warn('[API] Rate limited - too many requests');
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            // Server errors - could show maintenance message
            console.error('[API] Server error - service may be temporarily unavailable');
            break;
          default:
            // AWS API Gateway specific errors
            if (data?.message) {
              console.error(`[API] AWS API Gateway Error: ${data.message}`);
            }
        }
      } else if (error.request) {
        // Network error
        console.error('[API] Network error - request made but no response received:', error.request);
      } else {
        // Request setup error
        console.error('[API] Request setup error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the main API client instance
export const apiClient = createApiClient();

// Utility function to switch API mode
export const setApiMode = (mode: 'mock' | 'real') => {
  localStorage.setItem('api-mode', mode);
  // Reload to apply new configuration
  window.location.reload();
};

// Utility function to get current API mode
export const getApiMode = (): 'mock' | 'real' => {
  return localStorage.getItem('api-mode') as 'mock' | 'real' || 'real';
};

// Utility function to check if we're in mock mode
export const isMockMode = (): boolean => {
  const mode = getApiMode();
  console.log('[API Client] isMockMode() called, mode:', mode);
  return mode === 'mock';
};

// Export types for use in other files
export type ApiResponse<T = any> = AxiosResponse<T>;
export type ApiError = {
  message: string;
  code?: string;
  details?: any;
};

// Declare module augmentation for axios config metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
