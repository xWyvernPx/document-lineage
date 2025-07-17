// Test script to compare fetch vs axios for AWS API Gateway
import { apiClient } from '../lib/apiClient';

export const testAxiosVsFetch = async () => {
  const baseUrl = 'https://5g7oefhzwb.execute-api.ap-southeast-1.amazonaws.com/dev';
  const endpoint = '/connections';
  
  console.log('=== Testing Axios vs Fetch ===');
  
  // Test with fetch (your working version)
  try {
    console.log('1. Testing with fetch...');
    const fetchResponse = await fetch(baseUrl + endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    const fetchData = await fetchResponse.json();
    console.log('✅ Fetch success:', {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: Object.fromEntries(fetchResponse.headers.entries()),
      data: fetchData
    });
  } catch (error) {
    console.error('❌ Fetch failed:', error);
  }
  
  // Test with axios (configured)
  try {
    console.log('2. Testing with axios...');
    console.log('Axios config:', {
      baseURL: apiClient.defaults.baseURL,
      headers: apiClient.defaults.headers,
      timeout: apiClient.defaults.timeout,
      withCredentials: apiClient.defaults.withCredentials
    });
    
    const axiosResponse = await apiClient.get(endpoint);
    console.log('✅ Axios success:', {
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: axiosResponse.headers,
      data: axiosResponse.data
    });
  } catch (error: any) {
    console.error('❌ Axios failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL
      }
    });
  }
};

// Test just axios
export const testAxiosOnly = async () => {
  try {
    console.log('=== Testing Axios Only ===');
    const response = await apiClient.get('/connections');
    console.log('✅ Axios success:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Axios failed:', error);
    throw error;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testAxiosVsFetch = testAxiosVsFetch;
  (window as any).testAxiosOnly = testAxiosOnly;
}
