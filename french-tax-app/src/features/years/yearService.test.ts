
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { YearService } from './yearService';
import { StorageService } from '../../core/storage';
import { HouseholdService } from '../household/householdService';
import { EntryService } from '../entries/entryService';
import { YearStatus, MemberRole, TaxCategory, DocumentStatus } from '../../core/types';
import 'fake-indexeddb/auto';

const DB_NAME = 'year-test-db';

describe('Year Service', () => {
  let storage: StorageService;
  let householdService: HouseholdService;
  let entryService: EntryService;
  let yearService: YearService;
  const TEST_PASSWORD = 'secure-password-123';

  beforeEach(async () => {
    const uniqueDbName = `${DB_NAME}-${Math.random().toString(36).substring(7)}`;
    storage = new StorageService(uniqueDbName);
    await storage.initializeEncryption(TEST_PASSWORD);
    
    householdService = new HouseholdService(storage);
    entryService = new EntryService(storage);
    yearService = new YearService(storage, householdService, entryService);
  });

  afterEach(async () => {
    await storage.close();
  });

  it('should initialize a new year', async () => {
    const year = await yearService.initializeYear(2023);
    expect(year.year).toBe(2023);
    expect(year.status).toBe(YearStatus.ACTIVE);
    
    const stored = await yearService.getYear('2023');
    expect(stored).toEqual(year);
  });

  it('should prevent duplicate years', async () => {
    await yearService.initializeYear(2023);
    await expect(yearService.initializeYear(2023))
      .rejects.toThrow("L'année fiscale 2023 existe déjà.");
  });

  it('should close a year', async () => {
    // Setup: Create year, member, entry
    await yearService.initializeYear(2023);
    await householdService.createMember({
        firstName: 'Jean',
        lastName: 'Dupont',
        role: MemberRole.DECLARANT_1,
        birthDate: '1980-01-01',
        disabilityCard: false,
        warVeteran: false,
        attachedToHousehold: true
    });
    await entryService.createEntry({
        date: '2023-01-01',
        amount: 100,
        category: TaxCategory.DONATIONS,
        type: 'EXPENSE',
        documentStatus: DocumentStatus.COMPLETE
    });

    // Close
    await yearService.closeYear('2023');
    
    const closed = await yearService.getYear('2023');
    expect(closed?.status).toBe(YearStatus.CLOSED);
    expect(closed?.closedAt).toBeDefined();
    // Verify snapshot
    expect(closed?.entries).toHaveLength(1);
    expect(closed?.members).toHaveLength(1);
  });

  it('should archive a closed year', async () => {
    await yearService.initializeYear(2023);
    await yearService.closeYear('2023');
    
    await yearService.archiveYear('2023');
    
    const archived = await yearService.getYear('2023');
    expect(archived?.status).toBe(YearStatus.ARCHIVED);
  });

  it('should not archive active year', async () => {
      await yearService.initializeYear(2023);
      await expect(yearService.archiveYear('2023'))
        .rejects.toThrow("Il faut clôturer l'année avant de l'archiver.");
  });
});
