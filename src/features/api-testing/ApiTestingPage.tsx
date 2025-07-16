import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import ApiTester from '../../utils/apiTester';
import { testAxiosVsFetch } from '../../utils/axiosVsFetchTest';
import { getApiMode, setApiMode } from '../../lib/apiClient';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export const ApiTestingPage: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'mock' | 'real'>(getApiMode());
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    const timestampedResult: TestResult = {
      ...result,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [timestampedResult, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const handleModeSwitch = (mode: 'mock' | 'real') => {
    setApiMode(mode);
    setCurrentMode(mode);
    addTestResult({
      success: true,
      message: `Switched to ${mode} mode`
    });
  };

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await ApiTester.testConnection();
      addTestResult(result);
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Health check failed with exception',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runConnectionsTest = async () => {
    setIsLoading(true);
    try {
      const result = await ApiTester.testConnectionsEndpoint();
      addTestResult(result);
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Connections test failed with exception',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAxiosVsFetchTest = async () => {
    setIsLoading(true);
    try {
      await testAxiosVsFetch();
      addTestResult({
        success: true,
        message: 'Axios vs Fetch comparison completed (check console for details)'
      });
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Axios vs Fetch test failed',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const apiInfo = ApiTester.getApiInfo() as {
    mode: 'mock' | 'real';
    baseURL: string;
    timeout: number;
    headers: Record<string, any>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">API Testing Dashboard</h1>
        <Badge variant={currentMode === 'real' ? 'success' : 'info'}>
          {currentMode.toUpperCase()} MODE
        </Badge>
      </div>

      {/* API Configuration Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Current API Configuration</h2>
        <div className="bg-gray-50 rounded-md p-4">
          <pre className="text-sm text-gray-700">
            {JSON.stringify(apiInfo, null, 2)}
          </pre>
        </div>
      </Card>

      {/* Mode Switching */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">API Mode Control</h2>
        <div className="space-x-4">
          <Button
            variant={currentMode === 'real' ? 'primary' : 'secondary'}
            onClick={() => handleModeSwitch('real')}
            disabled={currentMode === 'real'}
          >
            Use Real API (AWS)
          </Button>
          <Button
            variant={currentMode === 'mock' ? 'primary' : 'secondary'}
            onClick={() => handleModeSwitch('mock')}
            disabled={currentMode === 'mock'}
          >
            Use Mock API
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Current endpoint: <code className="bg-gray-100 px-1 rounded">{apiInfo.baseURL}</code>
        </p>
      </Card>

      {/* API Tests */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">API Tests</h2>
        <div className="space-x-4 mb-4">
          <Button
            onClick={runHealthCheck}
            disabled={isLoading}
            variant="primary"
          >
            {isLoading ? 'Testing...' : 'Test Health Endpoint'}
          </Button>
          <Button
            onClick={runConnectionsTest}
            disabled={isLoading}
            variant="primary"
          >
            {isLoading ? 'Testing...' : 'Test Connections Endpoint'}
          </Button>
          <Button
            onClick={runAxiosVsFetchTest}
            disabled={isLoading}
            variant="secondary"
          >
            {isLoading ? 'Testing...' : 'Compare Axios vs Fetch'}
          </Button>
          <Button
            onClick={clearResults}
            variant="secondary"
            disabled={testResults.length === 0}
          >
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Test Results</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-md p-4 ${
                  result.success 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={result.success ? 'success' : 'error'}>
                      {result.success ? 'SUCCESS' : 'FAILED'}
                    </Badge>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm font-medium mb-2">{result.message}</p>
                {result.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      View Details
                    </summary>
                    <pre className="mt-2 bg-white border rounded p-2 overflow-x-auto text-xs">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {testResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No test results yet. Run a test to see results here.
          </div>
        )}
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Testing Instructions</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Real API Mode:</strong> Tests will hit the AWS API Gateway at {apiInfo.baseURL}</p>
          <p>• <strong>Mock API Mode:</strong> Tests will use local mock data</p>
          <p>• <strong>Health Endpoint:</strong> Tests basic connectivity to /health</p>
          <p>• <strong>Connections Endpoint:</strong> Tests the /connections endpoint for schema management</p>
          <p>• Check the browser's Network tab and Console for detailed request/response information</p>
        </div>
      </Card>
    </div>
  );
};
