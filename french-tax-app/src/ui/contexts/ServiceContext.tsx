
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService } from '../../core/storage';
import { TaxService } from '../../features/tax/taxService';
import { EntryService } from '../../features/entries/entryService';
import { HouseholdService } from '../../features/household/householdService';
import { YearService } from '../../features/years/yearService';
import { DeclarationService } from '../../features/declaration/declarationService';
import { ExportService } from '../../features/export/exportService';

interface Services {
  storage: StorageService;
  taxService: TaxService;
  entryService: EntryService;
  householdService: HouseholdService;
  yearService: YearService;
  declarationService: DeclarationService;
  exportService: ExportService;
}

const ServiceContext = createContext<Services | null>(null);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Services | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initServices = async () => {
      // In a real app, we would prompt for password here or use a secure vault
      // For MVP, we use a fixed key or auto-generated one stored in secure storage if platform allows
      // For now, let's use a hardcoded dev key for prototype
      const DEV_KEY = 'dev-secure-key-123'; 

      const storage = new StorageService();
      await storage.initializeEncryption(DEV_KEY);

      const householdService = new HouseholdService(storage);
      const entryService = new EntryService(storage);
      const taxService = new TaxService();
      const yearService = new YearService(storage, householdService, entryService);
      const declarationService = new DeclarationService(taxService, entryService);
      const exportService = new ExportService(taxService);

      // Initialize default year if needed
      const currentYear = new Date().getFullYear();
      try {
        const activeYear = await yearService.getActiveYear();
        if (!activeYear) {
            // Check if year exists but closed? 
            // Simplified: try init current year
            await yearService.initializeYear(currentYear);
        }
      } catch (e) {
        // Year might exist
      }

      setServices({
        storage,
        taxService,
        entryService,
        householdService,
        yearService,
        declarationService,
        exportService
      });
      setIsInitialized(true);
    };

    initServices();
  }, []);

  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center">Chargement sécurisé...</div>;
  }

  return (
    <ServiceContext.Provider value={services!}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
