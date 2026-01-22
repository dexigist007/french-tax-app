
import { describe, it, expect } from 'vitest';
import { TaxService } from './taxService';
import { TaxCategory, DocumentStatus, RiskLevel } from '../../core/types';
import type { TaxEntry } from '../../core/types';

describe('Tax Service', () => {
  const service = new TaxService();

  const mockEntries: TaxEntry[] = [
    {
      id: '1',
      date: '2023-01-01',
      amount: 100,
      category: TaxCategory.DONATIONS,
      type: 'EXPENSE',
      documentStatus: DocumentStatus.COMPLETE,
      updatedAt: Date.now(),
    },
    {
      id: '2',
      date: '2023-01-02',
      amount: 200,
      category: TaxCategory.CHILDCARE,
      type: 'EXPENSE',
      documentStatus: DocumentStatus.COMPLETE,
      updatedAt: Date.now(),
    },
    {
      id: '3',
      date: '2023-01-03',
      amount: 50,
      category: TaxCategory.DONATIONS,
      type: 'EXPENSE',
      documentStatus: DocumentStatus.COMPLETE,
      updatedAt: Date.now(),
    },
  ];

  it('should calculate category totals', () => {
    const totals = service.calculateCategoryTotals(mockEntries);
    expect(totals[TaxCategory.DONATIONS]).toBe(150);
    expect(totals[TaxCategory.CHILDCARE]).toBe(200);
    expect(totals[TaxCategory.HOME_SERVICES]).toBe(undefined);
  });

  it('should calculate total amount', () => {
    const total = service.calculateTotalExpenses(mockEntries);
    expect(total).toBe(350);
  });

  it('should assess risk level correctly', () => {
    // Low risk entries
    expect(service.assessRiskLevel(mockEntries)).toBe(RiskLevel.LOW);

    // Add high risk entry
    const highRiskEntries = [
      ...mockEntries,
      {
        id: '4',
        date: '2023-01-04',
        amount: 500,
        category: TaxCategory.PROFESSIONAL_EXPENSES,
        type: 'EXPENSE',
        documentStatus: DocumentStatus.COMPLETE,
        updatedAt: Date.now(),
      } as TaxEntry
    ];
    expect(service.assessRiskLevel(highRiskEntries)).toBe(RiskLevel.HIGH);

    // Medium risk via missing document
    const missingDocEntries = [
        {
            id: '5',
            date: '2023-01-05',
            amount: 100,
            category: TaxCategory.DONATIONS,
            type: 'EXPENSE',
            documentStatus: DocumentStatus.MISSING,
            updatedAt: Date.now(),
        } as TaxEntry
    ];
    expect(service.assessRiskLevel(missingDocEntries)).toBe(RiskLevel.MEDIUM);
  });

  it('should calculate completeness score', () => {
    expect(service.calculateCompletenessScore(mockEntries)).toBe(100);

    const mixedEntries = [
        ...mockEntries,
        {
            id: '6',
            date: '2023-01-06',
            amount: 100,
            category: TaxCategory.DONATIONS,
            type: 'EXPENSE',
            documentStatus: DocumentStatus.MISSING,
            updatedAt: Date.now(),
        } as TaxEntry
    ];
    // 3 complete out of 4 -> 75%
    expect(service.calculateCompletenessScore(mixedEntries)).toBe(75);
  });
});
