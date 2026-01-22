
import React, { useState, useEffect } from 'react';
import { DocumentStatus } from '../../core/types';
import type { TaxEntry, HouseholdMember } from '../../core/types';
import { getIncomeCategories, getExpenseCategories } from '../../core/metadata';
import { TextInput } from '../components/TextInput';
import { NumberInput } from '../components/NumberInput';
import { SelectInput } from '../components/SelectInput';
import { Button } from '../components/Button';
import { validateEntry } from '../../core/validation';
import { useServices } from '../contexts/ServiceContext';

interface EntryFormProps {
  onSubmit: (entry: Omit<TaxEntry, 'id' | 'updatedAt'>) => Promise<void>;
  initialData?: Partial<TaxEntry>;
  isLoading?: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, initialData, isLoading }) => {
  const { householdService } = useServices();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  
  // Determine initial type based on initialData category or default to EXPENSE
  const [entryType, setEntryType] = useState<'INCOME' | 'EXPENSE'>(
      initialData?.type || 'EXPENSE'
  );

  const [formData, setFormData] = useState<Partial<TaxEntry>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: undefined,
    documentStatus: DocumentStatus.MISSING,
    description: '',
    personId: '',
    type: 'EXPENSE',
    ...initialData,
  });

  useEffect(() => {
    const loadMembers = async () => {
        const list = await householdService.getMembers();
        setMembers(list);
    };
    loadMembers();
  }, [householdService]);

  // Update categories when type changes
  const currentCategories = entryType === 'INCOME' ? getIncomeCategories() : getExpenseCategories();
  
  const categoryOptions = currentCategories.map(cat => ({
    value: cat.id,
    label: cat.label
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof TaxEntry, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTypeChange = (type: 'INCOME' | 'EXPENSE') => {
      setEntryType(type);
      setFormData(prev => ({ 
          ...prev, 
          type: type,
          category: undefined // Reset category when type changes
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    // We need to ensure type is passed correctly
    const dataToSubmit = { ...formData, type: entryType };
    
    const validation = validateEntry(dataToSubmit);
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(err => {
        if (err.field !== 'general') {
            newErrors[err.field] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(dataToSubmit as Omit<TaxEntry, 'id' | 'updatedAt'>);
      if (!initialData) {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            category: undefined,
            documentStatus: DocumentStatus.MISSING,
            description: '',
            personId: '',
            type: entryType, // Keep current type selection
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusOptions = [
    { value: DocumentStatus.COMPLETE, label: 'Complet' },
    { value: DocumentStatus.MISSING, label: 'Manquant' },
    { value: DocumentStatus.RISK, label: 'À risque / Conditionnel' },
  ];
  
  const memberOptions = [
      { value: '', label: 'Aucun (Général)' },
      ...members.map(m => ({
          value: m.id,
          label: `${m.firstName} ${m.lastName}`
      }))
  ];

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        {initialData ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
      </h2>
      
      {/* Type Toggle */}
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${entryType === 'INCOME' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTypeChange('INCOME')}
          >
            Revenus
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${entryType === 'EXPENSE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTypeChange('EXPENSE')}
          >
            Dépenses / Charges
          </button>
      </div>

      <TextInput
        id="date"
        label="Date"
        type="date"
        value={formData.date || ''}
        onChange={(e) => handleChange('date', e.target.value)}
        error={errors.date}
        required
      />

      <SelectInput
        id="category"
        label="Catégorie"
        options={categoryOptions}
        value={formData.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
        error={errors.category}
        required
      />

      <SelectInput
        id="personId"
        label="Membre concerné (Optionnel)"
        options={memberOptions}
        value={formData.personId || ''}
        onChange={(e) => handleChange('personId', e.target.value)}
      />

      <NumberInput
        id="amount"
        label="Montant (€)"
        value={formData.amount}
        onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
        error={errors.amount}
        required
        min="0"
      />

      <TextInput
        id="description"
        label="Description (Optionnel)"
        value={formData.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Ex: Facture garderie janvier"
      />

      <SelectInput
        id="documentStatus"
        label="État du justificatif"
        options={statusOptions}
        value={formData.documentStatus || ''}
        onChange={(e) => handleChange('documentStatus', e.target.value as DocumentStatus)}
        error={errors.documentStatus}
        required
      />

      <div className="mt-6">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          {initialData ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </div>
      
      <p className="mt-4 text-xs text-gray-500 text-center">
        Ces informations sont stockées localement et chiffrées.
      </p>
    </form>
  );
};
