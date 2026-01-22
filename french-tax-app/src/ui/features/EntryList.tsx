
import React from 'react';
import { DocumentStatus } from '../../core/types';
import type { TaxEntry } from '../../core/types';
import { getCategoryMetadata } from '../../core/metadata';

interface EntryListProps {
  entries: TaxEntry[];
  onEdit: (entry: TaxEntry) => void;
  onDelete: (id: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({ entries, onEdit, onDelete }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Aucune dépense enregistrée pour le moment.
      </div>
    );
  }

  // Sort by date desc
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {sortedEntries.map((entry) => {
            const metadata = getCategoryMetadata(entry.category);
            const statusColor = {
                [DocumentStatus.COMPLETE]: 'bg-green-100 text-green-800',
                [DocumentStatus.MISSING]: 'bg-red-100 text-red-800',
                [DocumentStatus.RISK]: 'bg-yellow-100 text-yellow-800',
            }[entry.documentStatus];

            return (
            <li key={entry.id}>
              <div className="block hover:bg-gray-50">
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 flex-1 items-center">
                    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                      <div>
                        <p className="truncate text-sm font-medium text-indigo-600">{metadata.label}</p>
                        <p className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="truncate">{entry.description || 'Sans description'}</span>
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <div className="text-sm text-gray-900 font-semibold">
                          {entry.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </div>
                        <p className="mt-2 flex items-center text-sm text-gray-500">
                          {entry.date.split('-').reverse().join('/')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                      {entry.documentStatus === DocumentStatus.COMPLETE ? 'Justificatif OK' : 
                       entry.documentStatus === DocumentStatus.MISSING ? 'Justificatif Manquant' : 'À Vérifier'}
                    </span>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => onEdit(entry)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Modifier
                        </button>
                        <button 
                            onClick={() => onDelete(entry.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                            Supprimer
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
