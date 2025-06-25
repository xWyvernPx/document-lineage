import React, { useState } from 'react';
import { 
  User, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  GitBranch,
  FolderOpen,
  BookOpen,
  Database
} from 'lucide-react';
import { Button } from './Button';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  {
    id: 'pipeline',
    name: 'Document Pipeline',
    icon: GitBranch,
    description: 'Track extraction → classification → enrichment → validation flow',
    pages: ['extraction', 'classification', 'enrichment', 'review', 'consumption']
  },
  {
    id: 'documents',
    name: 'Document Management',
    icon: FolderOpen,
    description: 'Upload, list, and view document metadata',
    pages: ['documents', 'upload']
  },
  {
    id: 'terms',
    name: 'Term Dictionary',
    icon: BookOpen,
    description: 'Browse, search, and review business terms',
    pages: ['terms', 'search']
  },
  {
    id: 'schema',
    name: 'Schema Ingestion',
    icon: Database,
    description: 'Import database schemas and metadata',
    pages: ['schema-ingestion']
  }
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getCurrentSection = () => {
    return navigation.find(nav => nav.pages.includes(currentPage)) || navigation[0];
  };

  const getPageTitle = () => {
    const currentSection = getCurrentSection();
    if (currentSection.id === 'pipeline') {
      switch (currentPage) {
        case 'extraction': return 'Document Extraction';
        case 'classification': return 'Smart Classification';
        case 'enrichment': return 'Term Enrichment & Mapping';
        case 'review': return 'Publishing & Approval';
        case 'consumption': return 'Data Consumption';
        default: return 'Document Pipeline';
      }
    }
    if (currentSection.id === 'documents') {
      switch (currentPage) {
        case 'documents': return 'Document Library';
        case 'upload': return 'Upload Documents';
        default: return 'Document Management';
      }
    }
    if (currentSection.id === 'schema') {
      return 'Schema Ingestion';
    }
    return currentSection.name;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        
        {/* Sidebar Header */}
        <div className={`p-6 border-b border-gray-200 flex items-center justify-between ${sidebarCollapsed ? 'px-4' : ''}`}>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Data Lineage UI</h1>
              <p className="text-xs text-gray-500 mt-1">Term Extraction Platform</p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={sidebarCollapsed ? Menu : X}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = item.pages.includes(currentPage);
            const Icon = item.icon;
            
            return (
              <div key={item.id} className="group">
                <button
                  onClick={() => {
                    if (item.id === 'pipeline') {
                      onNavigate('extraction');
                    } else if (item.id === 'documents') {
                      onNavigate('documents');
                    } else if (item.id === 'terms') {
                      onNavigate('terms');
                    } else if (item.id === 'schema') {
                      onNavigate('schema-ingestion');
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <Icon className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} ${
                    sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                  }`} />
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Pipeline Steps - Only show when pipeline is active */}
        {getCurrentSection().id === 'pipeline' && !sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Pipeline Steps
            </h4>
            <div className="space-y-1">
              {[
                { id: 'extraction', name: 'Upload' },
                { id: 'classification', name: 'Classification' },
                { id: 'enrichment', name: 'Enrichment & Mapping' },
                { id: 'review', name: 'Publishing & Approval' },
                { id: 'consumption', name: 'Consumption' }
              ].map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    currentPage === step.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentPage === step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span>{step.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-gray-200 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`text-xs text-gray-500 ${sidebarCollapsed ? 'text-center' : ''}`}>
            {!sidebarCollapsed && (
              <>
                <div className="font-medium text-gray-700 mb-1">Quick Stats</div>
                <div className="space-y-1">
                  <div>248 Documents</div>
                  <div>1,847 Terms</div>
                  <div>644 Pending Review</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                icon={Menu}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    demo@example.com
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}