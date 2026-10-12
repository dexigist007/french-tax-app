import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { StorageService } from '../../core/storage';
import type { Collection } from '../../core/storage';
import type { AppData } from '../../core/types';
import { SAMPLE_DATA } from '../../features/costing/sampleData';

interface DataContextValue {
  data: AppData;
  save: <K extends Collection>(collection: K, item: AppData[K][number]) => Promise<void>;
  remove: (collection: Collection, id: string) => Promise<void>;
  loadSampleData: () => Promise<void>;
  clearAll: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);
const COLLECTIONS: Collection[] = ['ingredients', 'products', 'menus', 'periods'];
const EMPTY: AppData = { ingredients: [], products: [], menus: [], periods: [] };

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storage, setStorage] = useState<StorageService | null>(null);
  const [data, setData] = useState<AppData>(EMPTY);

  useEffect(() => {
    const init = async () => {
      // Prototype: fixed local key. A user-chosen password would be prompted here.
      const s = new StorageService();
      await s.initializeEncryption('dev-secure-key-123');

      const loaded = { ...EMPTY };
      for (const c of COLLECTIONS) (loaded as Record<Collection, unknown[]>)[c] = await s.getAll(c);

      if (!(await s.getMeta<boolean>('seeded'))) {
        for (const c of COLLECTIONS) for (const item of SAMPLE_DATA[c]) await s.save(c, item);
        await s.setMeta('seeded', true);
        Object.assign(loaded, structuredClone(SAMPLE_DATA));
      }
      setData(loaded);
      setStorage(s);
    };
    init();
  }, []);

  const save = useCallback<DataContextValue['save']>(async (collection, item) => {
    if (!storage) return;
    const stamped = { ...item, updatedAt: Date.now() };
    await storage.save(collection, stamped);
    setData(prev => {
      const list = prev[collection] as { id: string }[];
      const exists = list.some(x => x.id === stamped.id);
      return { ...prev, [collection]: exists ? list.map(x => (x.id === stamped.id ? stamped : x)) : [...list, stamped] };
    });
  }, [storage]);

  const remove = useCallback(async (collection: Collection, id: string) => {
    if (!storage) return;
    await storage.delete(collection, id);
    setData(prev => ({ ...prev, [collection]: (prev[collection] as { id: string }[]).filter(x => x.id !== id) }));
  }, [storage]);

  const clearAll = useCallback(async () => {
    if (!storage) return;
    for (const c of COLLECTIONS) for (const item of data[c]) await storage.delete(c, item.id);
    setData(EMPTY);
  }, [storage, data]);

  const loadSampleData = useCallback(async () => {
    if (!storage) return;
    for (const c of COLLECTIONS) for (const item of SAMPLE_DATA[c]) await storage.save(c, item);
    const merged = { ...EMPTY };
    for (const c of COLLECTIONS) (merged as Record<Collection, unknown[]>)[c] = await storage.getAll(c);
    setData(merged);
  }, [storage]);

  if (!storage) {
    return <div className="flex h-screen items-center justify-center text-gray-500">…</div>;
  }

  return (
    <DataContext.Provider value={{ data, save, remove, loadSampleData, clearAll }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};
