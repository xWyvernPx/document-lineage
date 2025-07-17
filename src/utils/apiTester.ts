import { apiClient, setApiMode, getApiMode } from '../lib/apiClient';

/**
 * API Testing Utility for Real AWS API Gateway Integration
 * Use this to test and verify the connection to the real API
 */
export class ApiTester {
  /**
   * Test basic connectivity to the AWS API Gateway
   */
  static async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log(`[API Test] Testing connection to AWS API Gateway...`);
      console.log(`[API Test] Current mode: ${getApiMode()}`);
      console.log(`[API Test] Base URL: ${apiClient.defaults.baseURL}`);

      // Test the connections endpoint instead of health since health requires auth
      const response = await apiClient.get('/connections');
      
      return {
        success: true,
        message: 'Successfully connected to AWS API Gateway via /connections endpoint',
        details: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        }
      };
    } catch (error: any) {
      console.error('[API Test] Connection test failed:', error);
      
      // Handle specific AWS API Gateway errors
      if (error.response?.status === 403 && error.response?.data?.message === 'Missing Authentication Token') {
        return {
          success: false,
          message: 'API Gateway requires authentication for this endpoint',
          details: {
            status: error.response.status,
            statusText: error.response.statusText,
            message: error.response.data.message,
            suggestion: 'Try the /connections endpoint which may not require auth'
          }
        };
      }
      
      return {
        success: false,
        message: 'Failed to connect to AWS API Gateway',
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          data: error.response?.data
        }
      };
    }
  }

  /**
   * Test connections endpoint specifically
   */
  static async testConnectionsEndpoint(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log(`[API Test] Testing connections endpoint...`);
      
      const response = await apiClient.get('/connections');
      
      return {
        success: true,
        message: 'Connections endpoint is working',
        details: {
          status: response.status,
          dataType: typeof response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array',
          sample: response.data
        }
      };
    } catch (error: any) {
      console.error('[API Test] Connections endpoint test failed:', error);
      
      return {
        success: false,
        message: 'Connections endpoint failed',
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          url: error.config?.url,
          data: error.response?.data
        }
      };
    }
  }

  /**
   * Switch to real API mode and test
   */
  static async switchToRealApiAndTest(): Promise<void> {
    console.log('[API Test] Switching to real API mode...');
    setApiMode('real');
    
    const healthResult = await this.testConnection();
    console.log('[API Test] Health check result:', healthResult);
    
    const connectionsResult = await this.testConnectionsEndpoint();
    console.log('[API Test] Connections test result:', connectionsResult);
  }

  /**
   * Switch to mock mode for comparison
   */
  static switchToMockMode(): void {
    console.log('[API Test] Switching to mock mode...');
    setApiMode('mock');
  }

  /**
   * Get current API configuration info
   */
  static getApiInfo(): object {
    return {
      mode: getApiMode(),
      baseURL: apiClient.defaults.baseURL,
      timeout: apiClient.defaults.timeout,
      headers: apiClient.defaults.headers
    };
  }
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).ApiTester = ApiTester;
}

export default ApiTester;
