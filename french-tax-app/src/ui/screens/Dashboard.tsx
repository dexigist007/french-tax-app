
import React, { useState, useEffect } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { EntryList } from '../features/EntryList';
import { EntryForm } from '../features/EntryForm';
import type { TaxEntry } from '../../core/types';
import { Button } from '../components/Button';

export const Dashboard: React.FC = () => {
  const { entryService, taxService, yearService, householdService } = useServices();
  const [entries, setEntries] = useState<TaxEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TaxEntry | undefined>(undefined);
  
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [householdParts, setHouseholdParts] = useState(0);

  const loadData = async () => {
    // Get active year (usually current year)
    const year = await yearService.getActiveYear();
    const currentYearNum = new Date().getFullYear();
    
    // Fallback if no active year returned (should be init by context but just in case)
    const targetYear = year?.year || currentYearNum;
    
    const yearEntries = await entryService.getEntriesByYear(targetYear);
    setEntries(yearEntries);
    
    setTotalIncome(taxService.calculateTotalIncome(yearEntries));
    setTotalExpenses(taxService.calculateTotalExpenses(yearEntries));
    
    // Calculate parts using fresh member data
    if (year && year.household) {
        // Fetch fresh members from storage to ensure we have latest updates (e.g. new child)
        const members = await householdService.getMembers();
        setHouseholdParts(taxService.calculateQuotientFamilial(year.household, members));
    }
  };

  useEffect(() => {
    loadData();
  }, [entryService, taxService, yearService, householdService]);

  const handleSubmit = async (entryData: Omit<TaxEntry, 'id' | 'updatedAt'>) => {
    if (editingEntry) {
        await entryService.updateEntry({ ...editingEntry, ...entryData, updatedAt: Date.now() });
    } else {
        await entryService.createEntry(entryData);
    }
    await loadData();
    setShowForm(false);
    setEditingEntry(undefined);
  };

  const handleEdit = (entry: TaxEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
        await entryService.deleteEntry(id);
        await loadData();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Préparation Fiscale</h1>
            <p className="text-gray-600 mt-1">Gérez vos revenus et charges pour l'année en cours</p>
        </div>
        <Button onClick={() => { setEditingEntry(undefined); setShowForm(!showForm); }}>
            {showForm ? 'Annuler' : 'Nouvelle Entrée'}
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-green-50 border-green-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-green-800">Revenus Imposables</h3>
            <p className="text-3xl font-bold text-green-900 mt-2">
                {totalIncome.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
        </div>
        
        <div className="card bg-orange-50 border-orange-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-orange-800">Dépenses / Charges</h3>
            <p className="text-3xl font-bold text-orange-900 mt-2">
                {totalExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
        </div>

        <div className="card bg-blue-50 border-blue-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-blue-800">Quotient Familial</h3>
            <p className="text-3xl font-bold text-blue-900 mt-2">
                {householdParts} <span className="text-base font-normal text-blue-700">parts</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">Calculé selon la composition du foyer</p>
        </div>
      </div>

      {showForm ? (
        <div className="mb-8">
            <EntryForm 
                onSubmit={handleSubmit} 
                initialData={editingEntry}
            />
        </div>
      ) : null}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Journal des Entrées</h2>
        <EntryList 
            entries={entries} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
