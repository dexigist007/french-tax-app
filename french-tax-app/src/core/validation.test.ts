
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateEntry } from './validation';
import { TaxCategory, DocumentStatus } from './types';

describe('Validation Logic', () => {
  // Property Tests
  it('should reject entries with missing required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          amount: fc.option(fc.double({ min: 1, max: 999999 })),
          date: fc.option(fc.date({min: new Date('2000-01-01T00:00:00.000Z'), max: new Date('2030-12-31T00:00:00.000Z')}).map(d => {
            try {
                return d.toISOString().split('T')[0];
            } catch (e) {
                return '2023-01-01'; // Fallback for invalid dates if any
            }
          })),
          category: fc.option(fc.constantFrom(...Object.values(TaxCategory))),
          documentStatus: fc.option(fc.constantFrom(...Object.values(DocumentStatus))),
        }, { requiredKeys: [] }),
        (entry) => {
            const isMissingRequired = 
                entry.amount === undefined || 
                entry.amount === null ||
                entry.date === undefined || 
                entry.category === undefined || 
                entry.documentStatus === undefined;
            
            if (isMissingRequired) {
                const result = validateEntry(entry as any);
                return !result.isValid;
            }
            return true;
        }
      )
    );
  });

  // Unit Tests
  describe('Amount Validation', () => {
    it('should reject 0', () => {
      expect(validateEntry({ amount: 0, date: '2023-01-01', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }).isValid).toBe(false);
    });
    it('should accept 0.01', () => {
      expect(validateEntry({ amount: 0.01, date: '2023-01-01', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }).isValid).toBe(true);
    });
    it('should accept 999999.99', () => {
      expect(validateEntry({ amount: 999999.99, date: '2023-01-01', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }).isValid).toBe(true);
    });
    it('should reject 1000000', () => {
      expect(validateEntry({ amount: 1000000, date: '2023-01-01', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }).isValid).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('should accept valid leap year date', () => {
      expect(validateEntry({ amount: 100, date: '2024-02-29', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }, 2024).isValid).toBe(true);
    });
    it('should reject invalid leap year date', () => {
       // 2023 is not leap year, so Feb 29 doesn't exist
       expect(validateEntry({ amount: 100, date: '2023-02-29', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }, 2023).isValid).toBe(false);
    });
    
    it('should reject date outside tax year', () => {
        expect(validateEntry({ amount: 100, date: '2022-12-31', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }, 2023).isValid).toBe(false);
    });

    it('should reject invalid format', () => {
        expect(validateEntry({ amount: 100, date: 'invalid-date', category: TaxCategory.DONATIONS, documentStatus: DocumentStatus.COMPLETE }).isValid).toBe(false);
    });
  });
});
