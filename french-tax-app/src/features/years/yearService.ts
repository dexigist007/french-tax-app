
import { YearStatus, MaritalStatus } from '../../core/types';
import type { TaxYear, TaxHousehold } from '../../core/types';
import { StorageService } from '../../core/storage';
import { HouseholdService } from '../household/householdService';
import { EntryService } from '../entries/entryService';

export class YearService {
  private storage: StorageService;
  private householdService: HouseholdService;
  private entryService: EntryService;

  constructor(
    storage: StorageService,
    householdService: HouseholdService,
    entryService: EntryService
  ) {
    this.storage = storage;
    this.householdService = householdService;
    this.entryService = entryService;
  }

  async getActiveYear(): Promise<TaxYear | undefined> {
    const currentYearId = new Date().getFullYear().toString();
    const year = await this.storage.getYear(currentYearId);
    if (year && year.status === YearStatus.ACTIVE) {
        return year;
    }
    return undefined;
  }
  
  async getYear(yearId: string): Promise<TaxYear | undefined> {
      return this.storage.getYear(yearId);
  }

  async initializeYear(year: number): Promise<TaxYear> {
    const yearId = year.toString();
    const existing = await this.storage.getYear(yearId);
    if (existing) {
      throw new Error(`L'année fiscale ${year} existe déjà.`);
    }

    // Snapshot members
    const members = await this.householdService.getMembers();

    // Create default household
    const household: TaxHousehold = {
        id: crypto.randomUUID(),
        year: year,
        maritalStatus: MaritalStatus.SINGLE, // Default
        declarants: [],
        dependents: [],
        events: [],
        quotientFamilial: 1,
    };

    // Auto-fill declarants/dependents based on members roles
    members.forEach(m => {
        if (m.role === 'DECLARANT_1' || m.role === 'DECLARANT_2') {
            household.declarants.push(m.id);
        } else {
            household.dependents.push(m.id);
        }
    });

    const newYear: TaxYear = {
      id: yearId,
      year: year,
      status: YearStatus.ACTIVE,
      entries: [],
      members: members,
      household: household,
    };

    await this.storage.saveYear(newYear);
    return newYear;
  }

  async closeYear(yearId: string): Promise<void> {
    const year = await this.storage.getYear(yearId);
    if (!year) {
      throw new Error("Année non trouvée.");
    }
    if (year.status !== YearStatus.ACTIVE) {
      throw new Error("L'année n'est pas active.");
    }

    // 1. Fetch all entries for this year
    const entries = await this.entryService.getEntriesByYear(year.year);

    // 2. Snapshot everything into the year object
    const closedYear: TaxYear = {
      ...year,
      status: YearStatus.CLOSED,
      closedAt: Date.now(),
      entries: entries,
      members: await this.householdService.getMembers(), 
      // household should also be updated to latest state if managed separately?
      // Assuming 'year' object was kept up to date or we fetch it?
      // Since household is part of TaxYear, we assume 'year.household' is current.
      // But if we have a separate updateTaxHousehold method, we might need to fetch it.
      // For now, assuming year.household is the source of truth.
    };

    await this.storage.saveYear(closedYear);

    // 3. Initialize next year automatically?
    try {
        await this.initializeYear(year.year + 1);
    } catch (e) {
        // Next year might already exist
    }
  }

  async archiveYear(yearId: string): Promise<void> {
      const year = await this.storage.getYear(yearId);
      if (!year) throw new Error("Année non trouvée.");
      
      if (year.status !== YearStatus.CLOSED) {
          throw new Error("Il faut clôturer l'année avant de l'archiver.");
      }

      const archivedYear: TaxYear = {
          ...year,
          status: YearStatus.ARCHIVED
      };
      await this.storage.saveYear(archivedYear);
  }
  
  async updateHousehold(yearId: string, household: TaxHousehold): Promise<void> {
      const year = await this.storage.getYear(yearId);
      if (!year) throw new Error("Année non trouvée.");
      
      year.household = household;
      await this.storage.saveYear(year);
  }
}
