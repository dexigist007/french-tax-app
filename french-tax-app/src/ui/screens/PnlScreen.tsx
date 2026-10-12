import { useMemo } from 'react';
import type { Period, SaleItemType } from '../../core/types';
import { computeProfitAndLoss, toMap } from '../../features/costing/costing';
import { PlatformFactory } from '../../core/platform/factory';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { Card, Field, Kpi, Num, newId } from '../components/ui';

interface Props { periodId: string | null; onSelect: (id: string) => void }

export function PeriodPicker({ periodId, onSelect }: Props) {
  const { data, save } = useData();
  const { t } = useI18n();
  const periods = [...data.periods].sort((a, b) => b.month.localeCompare(a.month));

  const create = async () => {
    const latest = periods[0];
    const next = new Date().toISOString().slice(0, 7);
    const month = periods.some(p => p.month === next) && latest ? nextMonth(latest.month) : next;
    const p: Period = {
      id: newId(), month, updatedAt: 0,
      // Carry over overheads and delivery settings: they rarely change month to month.
      sales: [],
      fixedCosts: latest ? latest.fixedCosts.map(c => ({ ...c, id: newId() })) : [],
      deliverySharePct: latest?.deliverySharePct ?? 0,
      deliveryCommissionPct: latest?.deliveryCommissionPct ?? 30,
    };
    await save('periods', p);
    onSelect(p.id);
  };

  return (
    <div className="flex flex-wrap items-end gap-2 mb-4">
      <Field label={t('month')}>
        <select className="input-field" value={periodId ?? ''} onChange={e => onSelect(e.target.value)}>
          {periods.map(p => <option key={p.id} value={p.id}>{p.month}</option>)}
        </select>
      </Field>
      <Button variant="secondary" onClick={create}>+ {t('newPeriod')}</Button>
    </div>
  );
}

const nextMonth = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(Date.UTC(y, mo, 1));
  return d.toISOString().slice(0, 7);
};

export function PnlScreen({ periodId, onSelect }: Props) {
  const { data, save, remove } = useData();
  const { t, eur, pct } = useI18n();
  const ingredients = useMemo(() => toMap(data.ingredients), [data.ingredients]);
  const products = useMemo(() => toMap(data.products), [data.products]);
  const menus = useMemo(() => toMap(data.menus), [data.menus]);
  const period = data.periods.find(p => p.id === periodId);

  if (!period) {
    return (
      <Card title={t('pnlTitle')} help={t('pnlHelp')}>
        <PeriodPicker periodId={periodId} onSelect={onSelect} />
        <p className="text-gray-500">{t('noPeriod')}</p>
      </Card>
    );
  }

  const update = (patch: Partial<Period>) => save('periods', { ...period, ...patch });
  const qty = (type: SaleItemType, id: string) => period.sales.find(s => s.itemType === type && s.itemId === id)?.quantity ?? 0;
  const setQty = (itemType: SaleItemType, itemId: string, quantity: number) => {
    const others = period.sales.filter(s => !(s.itemType === itemType && s.itemId === itemId));
    update({ sales: quantity > 0 ? [...others, { itemType, itemId, quantity }] : others });
  };

  const pnl = computeProfitAndLoss(period, products, menus, ingredients);

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      [t('name'), t('unitsSold'), t('revenueTTC'), t('revenueHT'), t('materialCost'), t('grossMargin')],
      ...pnl.items.map(i => [i.name, i.quantity, i.revenueTTC, i.revenueHT, i.cost, i.totalMarginHT].map(v => typeof v === 'number' ? v.toFixed(2) : v)),
      [],
      [t('revenueHT'), pnl.revenueHT.toFixed(2)],
      [t('materialCost'), pnl.materialCost.toFixed(2)],
      [t('grossMargin'), pnl.grossMargin.toFixed(2)],
      [t('deliveryCommissions'), pnl.deliveryCommissions.toFixed(2)],
      [t('fixedCosts'), pnl.fixedCosts.toFixed(2)],
      [t('netResult'), pnl.netResult.toFixed(2)],
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    PlatformFactory.getAdapter().saveFile(`resultat-${period.month}.csv`, '﻿' + csv, 'text/csv');
  };

  const saleRows: { type: SaleItemType; id: string; name: string }[] = [
    ...data.menus.map(m => ({ type: 'menu' as const, id: m.id, name: m.name })),
    ...data.products.map(p => ({ type: 'product' as const, id: p.id, name: p.name })),
  ];

  return (
    <>
      <Card title={t('pnlTitle')} help={t('pnlHelp')} actions={<Button variant="secondary" onClick={exportCsv}>{t('exportCsv')}</Button>}>
        <PeriodPicker periodId={periodId} onSelect={onSelect} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label={t('revenueHT')} value={eur(pnl.revenueHT)} />
          <Kpi label={t('foodCost')} value={pct(pnl.foodCostPct)} tone={pnl.foodCostPct > 32 ? 'bad' : 'good'} />
          <Kpi label={t('netResult')} value={eur(pnl.netResult)} tone={pnl.netResult >= 0 ? 'good' : 'bad'} />
          <Kpi label={t('breakEven')} value={pnl.breakEvenRevenueHT === null ? '—' : eur(pnl.breakEvenRevenueHT)}
            tone={pnl.breakEvenRevenueHT !== null && pnl.revenueHT >= pnl.breakEvenRevenueHT ? 'good' : 'bad'} />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title={t('sales')}>
          {saleRows.map(r => (
            <div key={r.type + r.id} className="flex items-center gap-3 py-1">
              <span className="flex-1 text-sm">{r.type === 'menu' ? '🍱 ' : ''}{r.name}</span>
              <Num className="!mt-0 !w-28 shrink-0" step={1} value={qty(r.type, r.id)} onChange={v => setQty(r.type, r.id, Math.round(v))} />
            </div>
          ))}
        </Card>

        <div>
          <Card title={t('fixedCosts')}>
            {period.fixedCosts.map(c => (
              <div key={c.id} className="flex items-center gap-2 py-1">
                <input className="input-field !mt-0 flex-1" value={c.name}
                  onChange={e => update({ fixedCosts: period.fixedCosts.map(x => x.id === c.id ? { ...x, name: e.target.value } : x) })} />
                <Num className="!mt-0 !w-32 shrink-0" step={10} value={c.amount}
                  onChange={v => update({ fixedCosts: period.fixedCosts.map(x => x.id === c.id ? { ...x, amount: v } : x) })} />
                <button className="text-red-600" onClick={() => update({ fixedCosts: period.fixedCosts.filter(x => x.id !== c.id) })}>✕</button>
              </div>
            ))}
            <button className="text-blue-600 hover:underline text-sm mt-2" onClick={() => update({ fixedCosts: [...period.fixedCosts, { id: newId(), name: '', amount: 0 }] })}>
              + {t('addFixedCost')}
            </button>
          </Card>

          <Card title={t('delivery')}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('deliveryShare')}><Num step={1} value={period.deliverySharePct} onChange={v => update({ deliverySharePct: Math.min(v, 100) })} /></Field>
              <Field label={t('deliveryCommission')}><Num step={1} value={period.deliveryCommissionPct} onChange={v => update({ deliveryCommissionPct: Math.min(v, 100) })} /></Field>
            </div>
          </Card>

          <Card title={t('pnlTitle')}>
            <dl className="text-sm divide-y divide-gray-200">
              <Row label={t('revenueTTC')} value={eur(pnl.revenueTTC)} />
              <Row label={`− ${t('tva')}`} value={eur(pnl.tva)} />
              <Row label={t('revenueHT')} value={eur(pnl.revenueHT)} strong />
              <Row label={`− ${t('materialCost')}`} value={`${eur(pnl.materialCost)} (${pct(pnl.foodCostPct)})`} />
              <Row label={t('grossMargin')} value={`${eur(pnl.grossMargin)} (${pct(pnl.grossMarginPct)})`} strong />
              <Row label={`− ${t('deliveryCommissions')}`} value={eur(pnl.deliveryCommissions)} />
              <Row label={`− ${t('fixedCosts')}`} value={eur(pnl.fixedCosts)} />
              <Row label={`${t('netResult')} — ${pnl.netResult >= 0 ? t('profit') : t('loss')}`} value={`${eur(pnl.netResult)} (${pct(pnl.netResultPct)})`} strong tone={pnl.netResult >= 0 ? 'good' : 'bad'} />
              <Row label={t('breakEven')} value={pnl.breakEvenRevenueHT === null ? t('breakEvenNone') : eur(pnl.breakEvenRevenueHT)} />
            </dl>
            <div className="text-right mt-4">
              <button className="text-red-600 text-sm hover:underline" onClick={() => confirm(t('confirmDelete', { name: period.month })) && remove('periods', period.id)}>
                {t('delete')} {period.month}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'good' | 'bad' }) {
  return (
    <div className={`flex justify-between py-2 ${strong ? 'font-semibold' : ''} ${tone === 'good' ? 'text-emerald-700' : tone === 'bad' ? 'text-red-600' : ''}`}>
      <dt>{label}</dt><dd className="text-right">{value}</dd>
    </div>
  );
}
