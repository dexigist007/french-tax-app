import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { StorageService } from './storage';
import type { Ingredient } from './types';

describe('StorageService', () => {
  let storage: StorageService;
  let dbName: string;

  beforeEach(async () => {
    dbName = `test-db-${Math.random().toString(36).slice(2)}`;
    storage = new StorageService(dbName);
    await storage.initializeEncryption('secret');
  });

  afterEach(async () => {
    await storage.close();
  });

  const item: Ingredient = { id: 'a', name: 'Steak', category: 'food', unit: 'kg', packPrice: 12, packQuantity: 1, wastePct: 3, updatedAt: 1 };

  it('saves, lists and deletes items', async () => {
    await storage.save('ingredients', item);
    expect(await storage.getAll('ingredients')).toEqual([item]);
    await storage.delete('ingredients', 'a');
    expect(await storage.getAll('ingredients')).toEqual([]);
  });

  it('cannot read data with the wrong password', async () => {
    await storage.save('ingredients', item);
    await storage.close();
    storage = new StorageService(dbName);
    await storage.initializeEncryption('wrong');
    await expect(storage.getAll('ingredients')).rejects.toThrow();
  });
});
