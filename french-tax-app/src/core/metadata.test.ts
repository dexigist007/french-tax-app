
import { describe, it, expect } from 'vitest';
import { TaxCategory, RiskLevel } from './types';
import { getCategoryMetadata, getAllCategories } from './metadata';

describe('Category Metadata', () => {
  it('should have metadata for all defined categories', () => {
    Object.values(TaxCategory).forEach(category => {
      const metadata = getCategoryMetadata(category);
      expect(metadata).toBeDefined();
      expect(metadata.id).toBe(category);
      expect(metadata.label).toBeTruthy();
      expect(metadata.description).toBeTruthy();
      expect(metadata.examples.length).toBeGreaterThan(0);
      expect(Object.values(RiskLevel)).toContain(metadata.riskLevel);
    });
  });

  it('should return all categories', () => {
    const categories = getAllCategories();
    expect(categories.length).toBe(Object.keys(TaxCategory).length);
  });

  it('should have correct metadata for DONATIONS', () => {
    const metadata = getCategoryMetadata(TaxCategory.DONATIONS);
    expect(metadata.label).toBe('Dons');
    expect(metadata.riskLevel).toBe(RiskLevel.LOW);
  });
  
  it('should have correct metadata for PROFESSIONAL_EXPENSES', () => {
    const metadata = getCategoryMetadata(TaxCategory.PROFESSIONAL_EXPENSES);
    expect(metadata.riskLevel).toBe(RiskLevel.HIGH);
  });
});
