
import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { encryptData, decryptData, deriveKey, generateSalt, bufferToBase64, base64ToBuffer } from './encryption';
import type { TaxEntry, HouseholdMember, TaxYear } from './types';

interface EncryptedData {
  iv: string; // Base64
  data: string; // Base64 encrypted string
}

interface FrenchTaxDB extends DBSchema {
  tax_entries: {
    key: string;
    value: EncryptedData;
  };
  household_members: {
    key: string;
    value: EncryptedData;
  };
  tax_years: {
    key: string;
    value: EncryptedData;
  };
  app_metadata: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'french-tax-db';
const DB_VERSION = 1;

export class StorageService {
  private dbPromise: Promise<IDBPDatabase<FrenchTaxDB>>;
  private encryptionKey: CryptoKey | null = null;

  constructor(dbName: string = DB_NAME) {
    this.dbPromise = openDB<FrenchTaxDB>(dbName, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('tax_entries');
        db.createObjectStore('household_members');
        db.createObjectStore('tax_years');
        db.createObjectStore('app_metadata');
      },
    });
  }

  /**
   * Initialize encryption with a password.
   * In a real app, this would be asked on startup.
   * For MVP, we might auto-generate one or ask user.
   */
  async initializeEncryption(password: string): Promise<void> {
    // Check if we have a salt stored
    const db = await this.dbPromise;
    let salt = await db.get('app_metadata', 'encryption_salt');

    if (!salt) {
      const newSalt = generateSalt();
      salt = bufferToBase64(newSalt);
      await db.put('app_metadata', salt, 'encryption_salt');
    }

    const saltBuffer = base64ToBuffer(salt as string);
    this.encryptionKey = await deriveKey(password, saltBuffer);
  }

  private async encryptAndFormat(data: any): Promise<EncryptedData> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');
    const jsonStr = JSON.stringify(data);
    const { cipherText, iv } = await encryptData(jsonStr, this.encryptionKey);
    return {
      iv: bufferToBase64(iv),
      data: bufferToBase64(cipherText),
    };
  }

  private async decryptAndParse<T>(encrypted: EncryptedData): Promise<T> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');
    const iv = base64ToBuffer(encrypted.iv);
    const cipherText = base64ToBuffer(encrypted.data);
    
    // Cast to BufferSource to satisfy TypeScript if needed, though base64ToBuffer returns Uint8Array
    const decryptedJson = await decryptData(cipherText as any, iv as any, this.encryptionKey);
    return JSON.parse(decryptedJson) as T;
  }

  // --- Tax Entries ---

  async saveEntry(entry: TaxEntry): Promise<void> {
    const db = await this.dbPromise;
    const encrypted = await this.encryptAndFormat(entry);
    await db.put('tax_entries', encrypted, entry.id);
  }

  async getEntry(id: string): Promise<TaxEntry | undefined> {
    const db = await this.dbPromise;
    const encrypted = await db.get('tax_entries', id);
    if (!encrypted) return undefined;
    return this.decryptAndParse<TaxEntry>(encrypted);
  }

  async getAllEntries(): Promise<TaxEntry[]> {
    const db = await this.dbPromise;
    const allEncrypted = await db.getAll('tax_entries');
    return Promise.all(allEncrypted.map(enc => this.decryptAndParse<TaxEntry>(enc)));
  }

  async deleteEntry(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('tax_entries', id);
  }

  // --- Household Members ---

  async saveMember(member: HouseholdMember): Promise<void> {
    const db = await this.dbPromise;
    const encrypted = await this.encryptAndFormat(member);
    await db.put('household_members', encrypted, member.id);
  }

  async getMember(id: string): Promise<HouseholdMember | undefined> {
    const db = await this.dbPromise;
    const encrypted = await db.get('household_members', id);
    if (!encrypted) return undefined;
    return this.decryptAndParse<HouseholdMember>(encrypted);
  }

  async getAllMembers(): Promise<HouseholdMember[]> {
    const db = await this.dbPromise;
    const allEncrypted = await db.getAll('household_members');
    return Promise.all(allEncrypted.map(enc => this.decryptAndParse<HouseholdMember>(enc)));
  }

  async deleteMember(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('household_members', id);
  }

  // --- Tax Years ---

  async saveYear(year: TaxYear): Promise<void> {
    const db = await this.dbPromise;
    const encrypted = await this.encryptAndFormat(year);
    await db.put('tax_years', encrypted, year.id);
  }

  async getYear(id: string): Promise<TaxYear | undefined> {
    const db = await this.dbPromise;
    const encrypted = await db.get('tax_years', id);
    if (!encrypted) return undefined;
    return this.decryptAndParse<TaxYear>(encrypted);
  }

  async close(): Promise<void> {
    const db = await this.dbPromise;
    db.close();
  }
}
