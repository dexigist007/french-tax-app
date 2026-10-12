import { useMemo } from 'react';
import { computeProfitAndLoss, menuEngineering, toMap } from '../../features/costing/costing';
import type { EngineeringClass } from '../../features/costing/costing';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { Badge, Card, Table } from '../components/ui';
import { PeriodPicker } from './PnlScreen';

const TONE: Record<EngineeringClass, 'good' | 'warn' | 'neutral' | 'bad'> = { star: 'good', plowhorse: 'warn', puzzle: 'neutral', dog: 'bad' };
const ORDER: EngineeringClass[] = ['star', 'plowhorse', 'puzzle', 'dog'];

export function AnalysisScreen({ periodId, onSelect }: { periodId: string | null; onSelect: (id: string) => void }) {
  const { data } = useData();
  const { t, eur, pct, num } = useI18n();
  const ingredients = useMemo(() => toMap(data.ingredients), [data.ingredients]);
  const products = useMemo(() => toMap(data.products), [data.products]);
  const menus = useMemo(() => toMap(data.menus), [data.menus]);
  const period = data.periods.find(p => p.id === periodId);

  const rows = period ? menuEngineering(computeProfitAndLoss(period, products, menus, ingredients).items) : [];
  rows.sort((a, b) => ORDER.indexOf(a.classification) - ORDER.indexOf(b.classification) || b.totalMarginHT - a.totalMarginHT);

  return (
    <>
      <Card title={t('analysisTitle')} help={t('analysisHelp')}>
        <PeriodPicker periodId={periodId} onSelect={onSelect} />
        {rows.length === 0 ? <p className="text-gray-500">{t('none')}</p> : (
          <Table head={[t('name'), t('unitsSold'), t('popularity'), t('unitMargin'), t('totalMargin'), t('class')]}>
            {rows.map(r => (
              <tr key={r.itemType + r.itemId}>
                <td className="px-2 py-2 font-medium">{r.itemType === 'menu' ? '🍱 ' : ''}{r.name}</td>
                <td className="px-2 py-2">{num(r.quantity, 0)}</td>
                <td className="px-2 py-2">{pct(r.mixPct)}</td>
                <td className="px-2 py-2">{eur(r.unitMarginHT)}</td>
                <td className="px-2 py-2">{eur(r.totalMarginHT)}</td>
                <td className="px-2 py-2"><Badge tone={TONE[r.classification]}>{t(`class_${r.classification}`)}</Badge></td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {ORDER.map(c => (
          <div key={c} className="card !p-4">
            <div className="font-semibold mb-1">{t(`class_${c}`)}</div>
            <p className="text-sm text-gray-600">{t(`advice_${c}`)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
