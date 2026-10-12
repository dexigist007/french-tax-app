import { useMemo } from 'react';
import { computeProfitAndLoss, productMargin, toMap } from '../../features/costing/costing';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { Card, Kpi } from '../components/ui';

export function DashboardScreen() {
  const { data, loadSampleData, clearAll } = useData();
  const { t, eur, pct } = useI18n();
  const ingredients = useMemo(() => toMap(data.ingredients), [data.ingredients]);

  const margins = data.products.map(p => ({ p, m: productMargin(p, ingredients) }));
  const priced = margins.filter(x => x.m.priceHT > 0);
  const avgFoodCost = priced.length ? priced.reduce((s, x) => s + x.m.foodCostPct, 0) / priced.length : 0;
  const negative = margins.filter(x => x.m.marginHT < 0);
  const overTarget = margins.filter(x => x.m.marginHT >= 0 && x.m.foodCostPct > x.p.targetFoodCostPct);

  const lastPeriod = [...data.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  const lastPnl = lastPeriod ? computeProfitAndLoss(lastPeriod, toMap(data.products), toMap(data.menus), ingredients) : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi label={t('kpiProducts')} value={String(data.products.length)} />
        <Kpi label={t('kpiAvgFoodCost')} value={pct(avgFoodCost)} tone={avgFoodCost > 32 ? 'bad' : 'good'} />
        <Kpi label={t('kpiOverTarget')} value={String(overTarget.length + negative.length)} tone={overTarget.length + negative.length ? 'bad' : 'good'} />
        <Kpi label={`${t('kpiLastResult')}${lastPeriod ? ` (${lastPeriod.month})` : ''}`} value={lastPnl ? eur(lastPnl.netResult) : '—'}
          tone={!lastPnl ? 'neutral' : lastPnl.netResult >= 0 ? 'good' : 'bad'} />
      </div>

      <Card title={t('alerts')}>
        {negative.length + overTarget.length === 0 ? <p className="text-emerald-700">{t('noAlerts')}</p> : (
          <ul className="space-y-2 text-sm">
            {negative.map(({ p }) => <li key={p.id} className="text-red-700">🔴 {t('alertNegative', { name: p.name })}</li>)}
            {overTarget.map(({ p, m }) => (
              <li key={p.id} className="text-amber-700">🟠 {t('alertOverTarget', { name: p.name, fc: pct(m.foodCostPct), target: pct(p.targetFoodCostPct) })}</li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="secondary" onClick={loadSampleData}>{t('loadSample')}</Button>
        <Button variant="danger" onClick={() => confirm(t('confirmClear')) && clearAll()}>{t('clearAll')}</Button>
        <span className="text-xs text-gray-500 ml-auto">🔒 {t('privacy')}</span>
      </div>
    </>
  );
}
