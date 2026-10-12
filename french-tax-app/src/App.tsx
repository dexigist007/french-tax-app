import { useState } from 'react';
import { DataProvider, useData } from './ui/contexts/DataContext';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import type { TranslationKey } from './i18n/translations';
import { DashboardScreen } from './ui/screens/DashboardScreen';
import { IngredientsScreen } from './ui/screens/IngredientsScreen';
import { ProductsScreen } from './ui/screens/ProductsScreen';
import { MenusScreen } from './ui/screens/MenusScreen';
import { PnlScreen } from './ui/screens/PnlScreen';
import { AnalysisScreen } from './ui/screens/AnalysisScreen';
import './index.css';

type Tab = 'dashboard' | 'ingredients' | 'products' | 'menus' | 'pnl' | 'analysis';
const TABS: { id: Tab; label: TranslationKey }[] = [
  { id: 'dashboard', label: 'navDashboard' },
  { id: 'ingredients', label: 'navIngredients' },
  { id: 'products', label: 'navProducts' },
  { id: 'menus', label: 'navMenus' },
  { id: 'pnl', label: 'navPnl' },
  { id: 'analysis', label: 'navAnalysis' },
];

function Shell() {
  const { t, lang, setLang } = useI18n();
  const { data } = useData();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [periodId, setPeriodId] = useState<string | null>(null);
  // Default to the most recent month when none is selected (or the selected one was deleted).
  const latest = [...data.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  const activePeriod = data.periods.some(p => p.id === periodId) ? periodId : latest?.id ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-bold text-lg text-orange-600">🍔 {t('appName')}</span>
          <div className="flex rounded-md border overflow-hidden text-sm">
            {(['fr', 'tr'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 ${lang === l ? 'bg-orange-600 text-white' : 'bg-white text-gray-600'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map(x => (
            <button key={x.id} onClick={() => setTab(x.id)}
              className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 ${tab === x.id ? 'border-orange-600 text-gray-900 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t(x.label)}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 animate-fade-in" key={tab}>
        {tab === 'dashboard' && <DashboardScreen />}
        {tab === 'ingredients' && <IngredientsScreen />}
        {tab === 'products' && <ProductsScreen />}
        {tab === 'menus' && <MenusScreen />}
        {tab === 'pnl' && <PnlScreen periodId={activePeriod} onSelect={setPeriodId} />}
        {tab === 'analysis' && <AnalysisScreen periodId={activePeriod} onSelect={setPeriodId} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <DataProvider>
        <Shell />
      </DataProvider>
    </I18nProvider>
  );
}
