import { useMemo, useState } from 'react';
import { TVA_RATES } from '../../core/types';
import type { Product, TvaRate } from '../../core/types';
import { computeMargin, productCost, productMargin, recipeLineCosts, suggestPriceTTC, toMap } from '../../features/costing/costing';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { Badge, Card, Field, Num, Table, newId } from '../components/ui';

const blank = (): Product => ({ id: newId(), name: '', category: '', lines: [], priceTTC: 0, tvaRate: 10, targetFoodCostPct: 30, updatedAt: 0 });

export function ProductsScreen() {
  const { data, save, remove } = useData();
  const { t, eur, pct, num } = useI18n();
  const [draft, setDraft] = useState<Product | null>(null);
  const ingredients = useMemo(() => toMap(data.ingredients), [data.ingredients]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setDraft(d => (d ? { ...d, [k]: v } : d));
  const sorted = [...data.products].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const categories = [...new Set(data.products.map(p => p.category).filter(Boolean))];

  const editor = draft && (() => {
    const lines = recipeLineCosts(draft.lines, ingredients);
    const cost = productCost(draft, ingredients);
    const m = computeMargin(cost, draft.priceTTC, draft.tvaRate);
    const suggested = suggestPriceTTC(cost, draft.targetFoodCostPct, draft.tvaRate);
    return (
      <form
        className="mb-6 p-4 bg-blue-50 rounded-lg"
        onSubmit={async e => { e.preventDefault(); if (!draft.name.trim()) return; await save('products', { ...draft, lines: draft.lines.filter(l => l.ingredientId) }); setDraft(null); }}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Field label={t('name')} className="col-span-2">
            <input className="input-field" value={draft.name} onChange={e => set('name', e.target.value)} required autoFocus />
          </Field>
          <Field label={t('category')}>
            <input className="input-field" list="product-categories" value={draft.category} onChange={e => set('category', e.target.value)} />
            <datalist id="product-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label={t('tvaRate')}>
            <select className="input-field" value={draft.tvaRate} onChange={e => set('tvaRate', Number(e.target.value) as TvaRate)}>
              {TVA_RATES.map(r => <option key={r} value={r}>{num(r, 1)} %</option>)}
            </select>
          </Field>
          <Field label={t('targetFoodCost')}><Num value={draft.targetFoodCostPct} onChange={v => set('targetFoodCostPct', v)} step={1} /></Field>
        </div>
        <p className="text-xs text-gray-500 mt-1">{t('tvaHelp')}</p>

        <h3 className="font-semibold mt-4 mb-2">{t('recipe')}</h3>
        <Table head={[t('ingredient'), t('quantity'), t('lineCost'), '']}>
          {lines.map(({ line, ingredient, cost: c }, idx) => (
            <tr key={idx}>
              <td className="px-2 py-1">
                <select
                  className="input-field !mt-0"
                  value={line.ingredientId}
                  onChange={e => set('lines', draft.lines.map((l, i) => (i === idx ? { ...l, ingredientId: e.target.value } : l)))}
                >
                  <option value="">—</option>
                  {data.ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </td>
              <td className="px-2 py-1">
                <div className="flex items-center gap-2">
                  <Num className="!mt-0 !w-28 shrink-0" step={0.001} value={line.quantity} onChange={v => set('lines', draft.lines.map((l, i) => (i === idx ? { ...l, quantity: v } : l)))} />
                  <span className="text-gray-500">{ingredient ? t(`unit_${ingredient.unit}`) : ''}</span>
                </div>
              </td>
              <td className="px-2 py-1">{eur(c)}</td>
              <td className="px-2 py-1 text-right">
                <button type="button" className="text-red-600" onClick={() => set('lines', draft.lines.filter((_, i) => i !== idx))}>✕</button>
              </td>
            </tr>
          ))}
        </Table>
        <button type="button" className="text-blue-600 hover:underline mt-2 text-sm" onClick={() => set('lines', [...draft.lines, { ingredientId: '', quantity: 0 }])}>
          + {t('addLine')}
        </button>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 items-end">
          <Field label={`${t('priceTTC')} (€)`}><Num value={draft.priceTTC} onChange={v => set('priceTTC', v)} step={0.1} /></Field>
          <Stat label={t('cost')} value={eur(cost)} />
          <Stat label={t('margin')} value={eur(m.marginHT)} tone={m.marginHT < 0 ? 'bad' : 'good'} />
          <Stat label={t('foodCost')} value={pct(m.foodCostPct)} tone={m.foodCostPct > draft.targetFoodCostPct ? 'bad' : 'good'} />
          <div>
            <span className="label">{t('suggestedPrice')}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold">{eur(suggested)}</span>
              {suggested > 0 && <button type="button" className="text-blue-600 text-sm hover:underline" onClick={() => set('priceTTC', suggested)}>{t('apply')}</button>}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={() => setDraft(null)}>{t('cancel')}</Button>
          <Button type="submit">{t('save')}</Button>
        </div>
      </form>
    );
  })();

  return (
    <Card title={t('productsTitle')} help={t('productsHelp')} actions={<Button onClick={() => setDraft(blank())}>+ {t('newProduct')}</Button>}>
      {editor}
      {sorted.length === 0 ? <p className="text-gray-500">{t('none')}</p> : (
        <Table head={[t('name'), t('category'), t('cost'), t('priceTTC'), t('priceHT'), t('margin'), t('foodCost'), t('coefficient'), t('suggestedPrice'), '']}>
          {sorted.map(p => {
            const m = productMargin(p, ingredients);
            const over = m.foodCostPct > p.targetFoodCostPct;
            return (
              <tr key={p.id}>
                <td className="px-2 py-2 font-medium">{p.name}</td>
                <td className="px-2 py-2 text-gray-600">{p.category}</td>
                <td className="px-2 py-2">{eur(m.cost)}</td>
                <td className="px-2 py-2">{eur(p.priceTTC)}</td>
                <td className="px-2 py-2 text-gray-600">{eur(m.priceHT)}</td>
                <td className={`px-2 py-2 font-semibold ${m.marginHT < 0 ? 'text-red-600' : ''}`}>{eur(m.marginHT)}</td>
                <td className="px-2 py-2"><Badge tone={m.marginHT < 0 ? 'bad' : over ? 'warn' : 'good'}>{pct(m.foodCostPct)}</Badge></td>
                <td className="px-2 py-2">×{num(m.coefficient, 2)}</td>
                <td className="px-2 py-2">{eur(suggestPriceTTC(m.cost, p.targetFoodCostPct, p.tvaRate))}</td>
                <td className="px-2 py-2 whitespace-nowrap text-right">
                  <button className="text-blue-600 hover:underline mr-3" onClick={() => setDraft(structuredClone(p))}>{t('edit')}</button>
                  <button className="text-red-600 hover:underline" onClick={() => confirm(t('confirmDelete', { name: p.name })) && remove('products', p.id)}>{t('delete')}</button>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className={`mt-1 font-semibold ${tone === 'bad' ? 'text-red-600' : tone === 'good' ? 'text-emerald-700' : ''}`}>{value}</div>
    </div>
  );
}
