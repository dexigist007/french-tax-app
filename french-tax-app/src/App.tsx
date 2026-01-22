
import { useState } from 'react';
import { ServiceProvider } from './ui/contexts/ServiceContext';
import { Dashboard } from './ui/screens/Dashboard';
import { HouseholdScreen } from './ui/screens/HouseholdScreen';
import { ExportScreen } from './ui/screens/ExportScreen';
import { DeclarationScreen } from './ui/screens/DeclarationScreen';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'household' | 'declaration' | 'export'>('dashboard');

  return (
    <ServiceProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="font-bold text-xl text-blue-600">French Tax Prep</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`${
                      activeTab === 'dashboard'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                  >
                    Dépenses
                  </button>
                  <button
                    onClick={() => setActiveTab('household')}
                    className={`${
                      activeTab === 'household'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                  >
                    Foyer
                  </button>
                  <button
                    onClick={() => setActiveTab('declaration')}
                    className={`${
                      activeTab === 'declaration'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                  >
                    Déclaration
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className={`${
                      activeTab === 'export'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                  >
                    Export & Clôture
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu (simplified) */}
          <div className="sm:hidden flex justify-around border-t py-2 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`p-2 flex-shrink-0 ${activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
              >
                Dépenses
              </button>
              <button 
                onClick={() => setActiveTab('household')}
                className={`p-2 flex-shrink-0 ${activeTab === 'household' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
              >
                Foyer
              </button>
              <button 
                onClick={() => setActiveTab('declaration')}
                className={`p-2 flex-shrink-0 ${activeTab === 'declaration' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
              >
                Déclaration
              </button>
              <button 
                onClick={() => setActiveTab('export')}
                className={`p-2 flex-shrink-0 ${activeTab === 'export' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
              >
                Export
              </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'household' && <HouseholdScreen />}
          {activeTab === 'declaration' && <DeclarationScreen />}
          {activeTab === 'export' && <ExportScreen />}
        </main>
      </div>
    </ServiceProvider>
  );
}

export default App;
