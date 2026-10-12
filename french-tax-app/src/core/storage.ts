import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { encryptData, decryptData, deriveKey, generateSalt, bufferToBase64, base64ToBuffer } from './encryption';

interface EncryptedData {
  iv: string; // Base64
  data: string; // Base64 encrypted string
}

export type Collection = 'ingredients' | 'products' | 'menus' | 'periods';
const COLLECTIONS: Collection[] = ['ingredients', 'products', 'menus', 'periods'];

interface FastFoodDB extends DBSchema {
  ingredients: { key: string; value: EncryptedData };
  products: { key: string; value: EncryptedData };
  menus: { key: string; value: EncryptedData };
  periods: { key: string; value: EncryptedData };
  app_metadata: { key: string; value: unknown };
}

const DB_NAME = 'fastfood-cost-db';
const DB_VERSION = 1;

/** Local, encrypted (AES-GCM) persistence on top of IndexedDB. */
export class StorageService {
  private dbPromise: Promise<IDBPDatabase<FastFoodDB>>;
  private encryptionKey: CryptoKey | null = null;

  constructor(dbName: string = DB_NAME) {
    this.dbPromise = openDB<FastFoodDB>(dbName, DB_VERSION, {
      upgrade(db) {
        for (const c of COLLECTIONS) db.createObjectStore(c);
        db.createObjectStore('app_metadata');
      },
    });
  }

  async initializeEncryption(password: string): Promise<void> {
    const db = await this.dbPromise;
    let salt = (await db.get('app_metadata', 'encryption_salt')) as string | undefined;
    if (!salt) {
      salt = bufferToBase64(generateSalt());
      await db.put('app_metadata', salt, 'encryption_salt');
    }
    this.encryptionKey = await deriveKey(password, base64ToBuffer(salt));
  }

  private async encrypt(data: unknown): Promise<EncryptedData> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');
    const { cipherText, iv } = await encryptData(JSON.stringify(data), this.encryptionKey);
    return { iv: bufferToBase64(iv), data: bufferToBase64(cipherText) };
  }

  private async decrypt<T>(encrypted: EncryptedData): Promise<T> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');
    const json = await decryptData(base64ToBuffer(encrypted.data), base64ToBuffer(encrypted.iv), this.encryptionKey);
    return JSON.parse(json) as T;
  }

  async save<T extends { id: string }>(collection: Collection, item: T): Promise<void> {
    const db = await this.dbPromise;
    await db.put(collection, await this.encrypt(item), item.id);
  }

  async getAll<T>(collection: Collection): Promise<T[]> {
    const db = await this.dbPromise;
    const all = await db.getAll(collection);
    return Promise.all(all.map(e => this.decrypt<T>(e)));
  }

  async delete(collection: Collection, id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(collection, id);
  }

  async getMeta<T>(key: string): Promise<T | undefined> {
    const db = await this.dbPromise;
    return (await db.get('app_metadata', key)) as T | undefined;
  }

  async setMeta(key: string, value: unknown): Promise<void> {
    const db = await this.dbPromise;
    await db.put('app_metadata', value, key);
  }

  async close(): Promise<void> {
    (await this.dbPromise).close();
  }
}
