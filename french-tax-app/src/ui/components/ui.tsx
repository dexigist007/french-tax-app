import React from 'react';

export const Card: React.FC<{ title?: string; help?: string; actions?: React.ReactNode; children: React.ReactNode }> = ({ title, help, actions, children }) => (
  <section className="card mb-6">
    {(title || actions) && (
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}
    {help && <p className="text-sm text-gray-500 mb-4">{help}</p>}
    {children}
  </section>
);

export const Kpi: React.FC<{ label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }> = ({ label, value, tone = 'neutral' }) => (
  <div className="card !p-4">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className={`text-2xl font-bold mt-1 ${tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
  </div>
);

interface FieldProps { label: string; children: React.ReactNode; className?: string }
export const Field: React.FC<FieldProps> = ({ label, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="label">{label}</span>
    {children}
  </label>
);

/** Numeric input that accepts both "3,5" and "3.5". */
export const Num: React.FC<{ value: number; onChange: (n: number) => void; step?: number; min?: number; className?: string }> = ({ value, onChange, step = 0.01, min = 0, className = '' }) => (
  <input
    type="number"
    inputMode="decimal"
    className={`input-field ${className}`}
    value={Number.isFinite(value) ? value : 0}
    step={step}
    min={min}
    onChange={e => {
      const n = parseFloat(e.target.value.replace(',', '.'));
      onChange(Number.isFinite(n) ? n : 0);
    }}
  />
);

export const Badge: React.FC<{ tone: 'good' | 'bad' | 'warn' | 'neutral'; children: React.ReactNode }> = ({ tone, children }) => {
  const cls = { good: 'bg-emerald-100 text-emerald-800', bad: 'bg-red-100 text-red-800', warn: 'bg-amber-100 text-amber-800', neutral: 'bg-gray-100 text-gray-700' }[tone];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
};

export const Table: React.FC<{ head: React.ReactNode[]; children: React.ReactNode }> = ({ head, children }) => (
  <div className="overflow-x-auto -mx-2">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b border-gray-200">
          {head.map((h, i) => <th key={i} className="px-2 py-2 font-medium whitespace-nowrap">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">{children}</tbody>
    </table>
  </div>
);

export const newId = () => crypto.randomUUID();
