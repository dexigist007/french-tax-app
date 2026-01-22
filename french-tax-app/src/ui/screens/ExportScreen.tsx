
import React, { useState, useEffect } from 'react';
import { useServices } from '../contexts/ServiceContext';
import type { TaxYear } from '../../core/types';
import { Button } from '../components/Button';
import { PlatformFactory } from '../../core/platform/factory';

export const ExportScreen: React.FC = () => {
  const { yearService, entryService, exportService } = useServices();
  const [activeYear, setActiveYear] = useState<TaxYear | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadYear();
  }, [yearService]);

  const loadYear = async () => {
    const year = await yearService.getActiveYear();
    setActiveYear(year);
  };

  const handleExportCSV = async () => {
    if (!activeYear) return;
    setIsLoading(true);
    try {
        const entries = await entryService.getEntriesByYear(activeYear.year);
        const csv = exportService.generateCSV(entries);
        const adapter = PlatformFactory.getAdapter();
        await adapter.saveFile(`impots-${activeYear.year}.csv`, csv, 'text/csv');
        setMessage("Export CSV réussi !");
    } catch (e: any) {
        setMessage("Erreur lors de l'export CSV: " + e.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!activeYear) return;
    setIsLoading(true);
    try {
        const entries = await entryService.getEntriesByYear(activeYear.year);
        const doc = exportService.generatePDF(activeYear.year, entries);
        const blob = doc.output('blob');
        const adapter = PlatformFactory.getAdapter();
        await adapter.saveFile(`impots-${activeYear.year}.pdf`, blob, 'application/pdf');
        setMessage("Export PDF réussi !");
    } catch (e: any) {
        setMessage("Erreur lors de l'export PDF: " + e.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseYear = async () => {
      if (!activeYear) return;
      if (!confirm(`Êtes-vous sûr de vouloir clôturer l'année fiscale ${activeYear.year} ? Cette action est irréversible et créera automatiquement l'année ${activeYear.year + 1}.`)) {
          return;
      }
      
      setIsLoading(true);
      try {
          await yearService.closeYear(activeYear.id);
          await loadYear();
          setMessage(`Année ${activeYear.year} clôturée avec succès.`);
      } catch (e: any) {
          setMessage("Erreur lors de la clôture: " + e.message);
      } finally {
          setIsLoading(false);
      }
  };

  if (!activeYear) {
      return (
          <div className="text-center py-10">
              Chargement de l'année fiscale...
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion de l'année fiscale {activeYear.year}</h1>

      {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
            <h2 className="text-lg font-semibold mb-4">Exports</h2>
            <p className="text-sm text-gray-600 mb-4">
                Téléchargez vos données pour vos archives ou pour les transmettre.
            </p>
            <div className="space-y-3">
                <Button onClick={handleExportCSV} variant="secondary" className="w-full" isLoading={isLoading}>
                    Exporter en CSV (Excel)
                </Button>
                <Button onClick={handleExportPDF} variant="secondary" className="w-full" isLoading={isLoading}>
                    Exporter le Récapitulatif PDF
                </Button>
            </div>
        </div>

        <div className="card border-l-4 border-yellow-400">
            <h2 className="text-lg font-semibold mb-4">Clôture Annuelle</h2>
            <p className="text-sm text-gray-600 mb-4">
                Une fois l'année terminée, clôturez-la pour figer les données et passer à l'année suivante.
            </p>
            <Button onClick={handleCloseYear} variant="danger" className="w-full" isLoading={isLoading}>
                Clôturer l'année {activeYear.year}
            </Button>
        </div>
      </div>
    </div>
  );
};
