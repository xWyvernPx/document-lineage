import { useEffect } from 'react';
import { testAxiosOnly } from '../utils/axiosVsFetchTest';

export const AxiosTestComponent: React.FC = () => {
  useEffect(() => {
    // Test axios immediately when component mounts
    const runTest = async () => {
      try {
        console.log('[AxiosTestComponent] Starting axios test...');
        const result = await testAxiosOnly();
        console.log('[AxiosTestComponent] Test successful:', result);
      } catch (error) {
        console.error('[AxiosTestComponent] Test failed:', error);
      }
    };
    
    runTest();
  }, []);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-sm text-blue-800">
        Testing axios configuration on component mount. Check console for results.
      </p>
    </div>
  );
};
