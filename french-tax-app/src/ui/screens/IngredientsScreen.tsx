import { useState } from 'react';
import type { Ingredient, IngredientCategory, Unit } from '../../core/types';
import { ingredientUnitCost } from '../../features/costing/costing';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { Card, Field, Num, Table, newId } from '../components/ui';

const CATEGORIES: IngredientCategory[] = ['food', 'drink', 'packaging', 'other'];
const UNITS: Unit[] = ['kg', 'l', 'piece'];

const blank = (): Ingredient => ({ id: newId(), name: '', category: 'food', unit: 'kg', packPrice: 0, packQuantity: 1, wastePct: 0, updatedAt: 0 });

export function IngredientsScreen() {
  const { data, save, remove } = useData();
  const { t, eur, num } = useI18n();
  const [draft, setDraft] = useState<Ingredient | null>(null);

  const sorted = [...data.ingredients].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const set = <K extends keyof Ingredient>(k: K, v: Ingredient[K]) => setDraft(d => (d ? { ...d, [k]: v } : d));

  return (
    <>
      <Card title={t('ingredientsTitle')} help={t('ingredientsHelp')} actions={<Button onClick={() => setDraft(blank())}>+ {t('newIngredient')}</Button>}>
        {draft && (
          <form
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-blue-50 rounded-lg"
            onSubmit={async e => { e.preventDefault(); if (!draft.name.trim()) return; await save('ingredients', draft); setDraft(null); }}
          >
            <Field label={t('name')} className="col-span-2">
              <input className="input-field" value={draft.name} onChange={e => set('name', e.target.value)} required autoFocus />
            </Field>
            <Field label={t('category')}>
              <select className="input-field" value={draft.category} onChange={e => set('category', e.target.value as IngredientCategory)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{t(`cat_${c}`)}</option>)}
              </select>
            </Field>
            <Field label={t('unit')}>
              <select className="input-field" value={draft.unit} onChange={e => set('unit', e.target.value as Unit)}>
                {UNITS.map(u => <option key={u} value={u}>{t(`unit_${u}`)}</option>)}
              </select>
            </Field>
            <Field label={`${t('packPrice')} (€)`}><Num value={draft.packPrice} onChange={v => set('packPrice', v)} /></Field>
            <Field label={`${t('packQuantity')} (${t(`unit_${draft.unit}`)})`}><Num value={draft.packQuantity} onChange={v => set('packQuantity', v)} step={0.001} /></Field>
            <Field label={t('wastePct')}><Num value={draft.wastePct} onChange={v => set('wastePct', Math.min(v, 95))} step={1} /></Field>
            <Field label={t('unitCost')}>
              <div className="input-field bg-white font-semibold">{eur(ingredientUnitCost(draft))} / {t(`unit_${draft.unit}`)}</div>
            </Field>
            <div className="col-span-2 md:col-span-4 flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setDraft(null)}>{t('cancel')}</Button>
              <Button type="submit">{t('save')}</Button>
            </div>
          </form>
        )}

        {sorted.length === 0 ? <p className="text-gray-500">{t('none')}</p> : (
          <Table head={[t('name'), t('category'), t('packPrice'), t('packQuantity'), t('wastePct'), t('unitCost'), '']}>
            {sorted.map(i => (
              <tr key={i.id}>
                <td className="px-2 py-2 font-medium">{i.name}</td>
                <td className="px-2 py-2 text-gray-600">{t(`cat_${i.category}`)}</td>
                <td className="px-2 py-2">{eur(i.packPrice)}</td>
                <td className="px-2 py-2">{num(i.packQuantity, 3)} {t(`unit_${i.unit}`)}</td>
                <td className="px-2 py-2">{num(i.wastePct, 1)} %</td>
                <td className="px-2 py-2 font-semibold">{eur(ingredientUnitCost(i))} / {t(`unit_${i.unit}`)}</td>
                <td className="px-2 py-2 whitespace-nowrap text-right">
                  <button className="text-blue-600 hover:underline mr-3" onClick={() => setDraft({ ...i })}>{t('edit')}</button>
                  <button className="text-red-600 hover:underline" onClick={() => confirm(t('confirmDelete', { name: i.name })) && remove('ingredients', i.id)}>{t('delete')}</button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
