
import { TaxCategory, IncomeCategory, DocumentStatus } from './types';
import type { TaxEntry } from './types';

export interface ValidationError {
  field: keyof TaxEntry | 'general';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

const MAX_AMOUNT = 999999.99;

export function validateEntry(entry: Partial<TaxEntry>, taxYear?: number): ValidationResult {
  const errors: ValidationError[] = [];

  // Amount validation
  if (entry.amount === undefined || entry.amount === null) {
    errors.push({ field: 'amount', message: 'Le montant est obligatoire.' });
  } else if (isNaN(entry.amount)) {
    errors.push({ field: 'amount', message: 'Le montant doit être un nombre valide.' });
  } else if (entry.amount <= 0) {
    errors.push({ field: 'amount', message: 'Le montant doit être supérieur à 0.' });
  } else if (entry.amount > MAX_AMOUNT) {
    errors.push({ field: 'amount', message: `Le montant ne peut pas dépasser ${MAX_AMOUNT.toLocaleString('fr-FR')} €.` });
  }

  // Date validation
  if (!entry.date) {
    errors.push({ field: 'date', message: 'La date est obligatoire.' });
  } else {
    const dateObj = new Date(entry.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'La date est invalide.' });
    } else {
      // Check for date rollover (e.g. Feb 30 -> Mar 2)
      // entry.date is expected to be YYYY-MM-DD
      const isoDate = dateObj.toISOString().split('T')[0];
      if (isoDate !== entry.date) {
        errors.push({ field: 'date', message: 'La date n\'existe pas.' });
      } else if (taxYear) {
        const year = dateObj.getFullYear();
        if (year !== taxYear) {
          errors.push({ field: 'date', message: `La date doit être dans l'année fiscale ${taxYear}.` });
        }
      }
    }
  }

  // Category validation
  if (!entry.category) {
    errors.push({ field: 'category', message: 'La catégorie est obligatoire.' });
  } else {
      const isValidExpense = Object.values(TaxCategory).includes(entry.category as any);
      const isValidIncome = Object.values(IncomeCategory).includes(entry.category as any);
      
      if (!isValidExpense && !isValidIncome) {
          errors.push({ field: 'category', message: 'La catégorie sélectionnée est invalide.' });
      }
  }

  // Document status validation
  if (!entry.documentStatus) {
    errors.push({ field: 'documentStatus', message: 'Le statut du justificatif est obligatoire.' });
  } else if (!Object.values(DocumentStatus).includes(entry.documentStatus)) {
    errors.push({ field: 'documentStatus', message: 'Le statut du justificatif est invalide.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
