import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppRouter } from './components/AppRouter';
import { useAlert } from './hooks/useAlert';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { configureAmplify } from './auth/cognito-config';

// Initialize Amplify configuration
configureAmplify();

function AppContent() {
  const location = useLocation();
  const { AlertModal } = useAlert();

  // Special handling for async processing app (no layout, has its own auth)
  const isAsyncProcessingRoute = location.pathname === '/async-processing';

  if (isAsyncProcessingRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
        <AlertModal />
      </div>
    );
  }

  // All other routes use Layout with Auth
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <AppRouter />
          </Layout>
          <AlertModal />
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;