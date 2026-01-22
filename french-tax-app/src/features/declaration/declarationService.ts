
import type { DeclarationChecklist, DeclarationChecklistItem } from '../../core/types';
import { TaxService } from '../tax/taxService';
import { EntryService } from '../entries/entryService';
import { IncomeCategory, TaxCategory } from '../../core/types';

export class DeclarationService {
  private taxService: TaxService;
  private entryService: EntryService;

  constructor(
    taxService: TaxService,
    entryService: EntryService
  ) {
    this.taxService = taxService;
    this.entryService = entryService;
  }

  async generateChecklist(year: number): Promise<DeclarationChecklist> {
    const entries = await this.entryService.getEntriesByYear(year);
    const totals = this.taxService.calculateCategoryTotals(entries);
    
    // Helper to check if any category in a list has amount > 0
    const hasAmount = (categories: string[]) => {
        return categories.some(cat => (totals[cat] || 0) > 0);
    };

    const hasIncome = hasAmount(Object.values(IncomeCategory));
    const hasExpenses = hasAmount(Object.values(TaxCategory));

    // This checklist mirrors the typical flow on impots.gouv.fr
    const items: DeclarationChecklistItem[] = [
      {
        id: 'step-1-identity',
        label: 'Vérifier les informations d\'état civil (Adresse, Situation familiale)',
        completed: false, // User must manually confirm
        step: 1
      },
      {
        id: 'step-2-salary',
        label: hasIncome 
            ? 'Vérifier les revenus pré-remplis (Salaires, Retraites, etc.)' 
            : 'Aucun revenu saisi : Vérifiez si vous avez des revenus à déclarer.',
        completed: false,
        step: 2
      },
      {
        id: 'step-3-expenses',
        label: hasExpenses
            ? 'Reporter les réductions et crédits d\'impôt (Rubrique 7)'
            : 'Aucune dépense saisie : Vérifiez vos réductions potentielles.',
        completed: false,
        step: 3
      },
      {
        id: 'step-4-validation',
        label: 'Signer et valider la déclaration sur impots.gouv.fr',
        completed: false,
        step: 4
      }
    ];

    return {
      year,
      items,
      progress: 0
    };
  }

  getFormattedTotal(amount: number): string {
    // French format: space as thousands separator, comma as decimal
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  calculateProgress(checklist: DeclarationChecklist): number {
    const completed = checklist.items.filter(i => i.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  }
}
