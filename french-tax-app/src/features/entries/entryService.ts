
import { TaxCategory } from '../../core/types';
import type { TaxEntry } from '../../core/types';
import { StorageService } from '../../core/storage';
import { validateEntry } from '../../core/validation';

export class EntryService {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async createEntry(entry: Omit<TaxEntry, 'id' | 'updatedAt'>): Promise<TaxEntry> {
    const validation = validateEntry(entry);
    if (!validation.isValid) {
      throw new Error(validation.errors.map(e => e.message).join(', '));
    }

    const newEntry: TaxEntry = {
      ...entry,
      id: crypto.randomUUID(),
      updatedAt: Date.now(),
    };

    await this.storage.saveEntry(newEntry);
    return newEntry;
  }

  async updateEntry(entry: TaxEntry): Promise<void> {
    const validation = validateEntry(entry);
    if (!validation.isValid) {
      throw new Error(validation.errors.map(e => e.message).join(', '));
    }
    
    // Ensure entry exists? StorageService.put overwrites.
    // Ideally we check existence first if we want strict update semantics.
    // For now, put is fine.
    
    const updatedEntry = {
        ...entry,
        updatedAt: Date.now()
    };
    await this.storage.saveEntry(updatedEntry);
  }

  async deleteEntry(id: string): Promise<void> {
    await this.storage.deleteEntry(id);
  }

  async getEntry(id: string): Promise<TaxEntry | undefined> {
    return this.storage.getEntry(id);
  }

  async getAllEntries(): Promise<TaxEntry[]> {
    return this.storage.getAllEntries();
  }

  async getEntriesByYear(year: number): Promise<TaxEntry[]> {
    const all = await this.getAllEntries();
    return all.filter(e => {
        const entryYear = new Date(e.date).getFullYear();
        return entryYear === year;
    });
  }

  async getEntriesByCategory(category: TaxCategory): Promise<TaxEntry[]> {
    const all = await this.getAllEntries();
    return all.filter(e => e.category === category);
  }
}
