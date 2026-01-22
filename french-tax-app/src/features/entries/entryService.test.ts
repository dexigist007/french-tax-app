
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EntryService } from './entryService';
import { StorageService } from '../../core/storage';
import { TaxCategory, DocumentStatus } from '../../core/types';
import type { TaxEntry } from '../../core/types';
import 'fake-indexeddb/auto';

const DB_NAME = 'entry-test-db';

describe('Entry Service', () => {
  let storage: StorageService;
  let service: EntryService;
  const TEST_PASSWORD = 'secure-password-123';

  beforeEach(async () => {
    const uniqueDbName = `${DB_NAME}-${Math.random().toString(36).substring(7)}`;
    storage = new StorageService(uniqueDbName);
    await storage.initializeEncryption(TEST_PASSWORD);
    service = new EntryService(storage);
  });

  afterEach(async () => {
    await storage.close();
  });

  const validEntryData: Omit<TaxEntry, 'id' | 'updatedAt'> = {
    date: '2023-01-15',
    amount: 50.0,
    category: TaxCategory.DONATIONS,
    documentStatus: DocumentStatus.COMPLETE,
    type: 'EXPENSE',
  };

  it('should create a new entry', async () => {
    const entry = await service.createEntry(validEntryData);
    expect(entry.id).toBeDefined();
    expect(entry.amount).toBe(50.0);
    
    const stored = await service.getEntry(entry.id);
    expect(stored).toEqual(entry);
  });

  it('should validate entry on creation', async () => {
    const invalidData = { ...validEntryData, amount: -10 };
    await expect(service.createEntry(invalidData))
      .rejects.toThrow('Le montant doit être supérieur à 0.');
  });

  it('should filter entries by year', async () => {
    await service.createEntry({ ...validEntryData, date: '2022-12-31' });
    await service.createEntry({ ...validEntryData, date: '2023-01-01' });
    await service.createEntry({ ...validEntryData, date: '2023-06-15' });
    await service.createEntry({ ...validEntryData, date: '2024-01-01' });

    const entries2023 = await service.getEntriesByYear(2023);
    expect(entries2023).toHaveLength(2);
    expect(entries2023.every(e => e.date.startsWith('2023'))).toBe(true);
  });

  it('should filter entries by category', async () => {
    await service.createEntry({ ...validEntryData, category: TaxCategory.DONATIONS });
    await service.createEntry({ ...validEntryData, category: TaxCategory.CHILDCARE });
    await service.createEntry({ ...validEntryData, category: TaxCategory.DONATIONS });

    const donations = await service.getEntriesByCategory(TaxCategory.DONATIONS);
    expect(donations).toHaveLength(2);
    expect(donations.every(e => e.category === TaxCategory.DONATIONS)).toBe(true);
  });
});
