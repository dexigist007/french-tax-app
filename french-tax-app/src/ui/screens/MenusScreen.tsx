import { useMemo, useState } from 'react';
import { TVA_RATES } from '../../core/types';
import type { Menu, TvaRate } from '../../core/types';
import { computeMargin, menuALaCartePrice, menuCost, toMap } from '../../features/costing/costing';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { Badge, Card, Field, Num, Table, newId } from '../components/ui';

const blank = (): Menu => ({ id: newId(), name: '', items: [], priceTTC: 0, tvaRate: 10, updatedAt: 0 });

export function MenusScreen() {
  const { data, save, remove } = useData();
  const { t, eur, pct, num } = useI18n();
  const [draft, setDraft] = useState<Menu | null>(null);
  const ingredients = useMemo(() => toMap(data.ingredients), [data.ingredients]);
  const products = useMemo(() => toMap(data.products), [data.products]);
  const set = <K extends keyof Menu>(k: K, v: Menu[K]) => setDraft(d => (d ? { ...d, [k]: v } : d));

  const stats = (menu: Menu) => {
    const cost = menuCost(menu, products, ingredients);
    const aLaCarte = menuALaCartePrice(menu, products);
    return { m: computeMargin(cost, menu.priceTTC, menu.tvaRate), aLaCarte, discount: aLaCarte - menu.priceTTC };
  };

  return (
    <Card title={t('menusTitle')} help={t('menusHelp')} actions={<Button onClick={() => setDraft(blank())}>+ {t('newMenu')}</Button>}>
      {draft && (() => {
        const s = stats(draft);
        return (
          <form
            className="mb-6 p-4 bg-blue-50 rounded-lg"
            onSubmit={async e => { e.preventDefault(); if (!draft.name.trim()) return; await save('menus', { ...draft, items: draft.items.filter(i => i.productId) }); setDraft(null); }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label={t('name')} className="col-span-2">
                <input className="input-field" value={draft.name} onChange={e => set('name', e.target.value)} required autoFocus />
              </Field>
              <Field label={`${t('priceTTC')} (€)`}><Num value={draft.priceTTC} onChange={v => set('priceTTC', v)} step={0.1} /></Field>
              <Field label={t('tvaRate')}>
                <select className="input-field" value={draft.tvaRate} onChange={e => set('tvaRate', Number(e.target.value) as TvaRate)}>
                  {TVA_RATES.map(r => <option key={r} value={r}>{num(r, 1)} %</option>)}
                </select>
              </Field>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('menuTvaNote')}</p>

            <h3 className="font-semibold mt-4 mb-2">{t('menuItems')}</h3>
            {draft.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <select className="input-field !mt-0 flex-1" value={item.productId}
                  onChange={e => set('items', draft.items.map((it, i) => (i === idx ? { ...it, productId: e.target.value } : it)))}>
                  <option value="">—</option>
                  {data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Num className="!mt-0 !w-20 shrink-0" step={1} value={item.quantity}
                  onChange={v => set('items', draft.items.map((it, i) => (i === idx ? { ...it, quantity: v } : it)))} />
                <button type="button" className="text-red-600" onClick={() => set('items', draft.items.filter((_, i) => i !== idx))}>✕</button>
              </div>
            ))}
            <button type="button" className="text-blue-600 hover:underline text-sm" onClick={() => set('items', [...draft.items, { productId: '', quantity: 1 }])}>
              + {t('addItem')}
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
              <div><span className="label">{t('cost')}</span><div className="font-semibold">{eur(s.m.cost)}</div></div>
              <div><span className="label">{t('margin')}</span><div className={`font-semibold ${s.m.marginHT < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{eur(s.m.marginHT)}</div></div>
              <div><span className="label">{t('foodCost')}</span><div className="font-semibold">{pct(s.m.foodCostPct)}</div></div>
              <div><span className="label">{t('aLaCarte')} / {t('discount')}</span><div className="font-semibold">{eur(s.aLaCarte)} / {eur(s.discount)}</div></div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={() => setDraft(null)}>{t('cancel')}</Button>
              <Button type="submit">{t('save')}</Button>
            </div>
          </form>
        );
      })()}

      {data.menus.length === 0 ? <p className="text-gray-500">{t('none')}</p> : (
        <Table head={[t('name'), t('menuItems'), t('cost'), t('priceTTC'), t('aLaCarte'), t('discount'), t('margin'), t('foodCost'), '']}>
          {data.menus.map(menu => {
            const s = stats(menu);
            return (
              <tr key={menu.id}>
                <td className="px-2 py-2 font-medium">{menu.name}</td>
                <td className="px-2 py-2 text-gray-600">
                  {menu.items.map(i => `${i.quantity > 1 ? `${i.quantity}× ` : ''}${products.get(i.productId)?.name ?? '?'}`).join(' + ')}
                </td>
                <td className="px-2 py-2">{eur(s.m.cost)}</td>
                <td className="px-2 py-2">{eur(menu.priceTTC)}</td>
                <td className="px-2 py-2 text-gray-600">{eur(s.aLaCarte)}</td>
                <td className="px-2 py-2">{eur(s.discount)} ({s.aLaCarte > 0 ? pct((s.discount / s.aLaCarte) * 100) : '—'})</td>
                <td className={`px-2 py-2 font-semibold ${s.m.marginHT < 0 ? 'text-red-600' : ''}`}>{eur(s.m.marginHT)}</td>
                <td className="px-2 py-2"><Badge tone={s.m.marginHT < 0 ? 'bad' : s.m.foodCostPct > 35 ? 'warn' : 'good'}>{pct(s.m.foodCostPct)}</Badge></td>
                <td className="px-2 py-2 whitespace-nowrap text-right">
                  <button className="text-blue-600 hover:underline mr-3" onClick={() => setDraft(structuredClone(menu))}>{t('edit')}</button>
                  <button className="text-red-600 hover:underline" onClick={() => confirm(t('confirmDelete', { name: menu.name })) && remove('menus', menu.id)}>{t('delete')}</button>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </Card>
  );
}
