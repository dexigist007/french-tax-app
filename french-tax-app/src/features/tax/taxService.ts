
import { 
  RiskLevel, 
  DocumentStatus,
  MaritalStatus,
  CustodyType,
} from '../../core/types';
import type { 
  TaxEntry, 
  TaxPreview, 
  TaxHousehold, 
  HouseholdMember 
} from '../../core/types';
import { getCategoryMetadata } from '../../core/metadata';

export class TaxService {
  
  calculateCategoryTotals(entries: TaxEntry[]): Record<string, number> {
    const totals: Record<string, number> = {};
    
    entries.forEach(entry => {
      totals[entry.category] = (totals[entry.category] || 0) + entry.amount;
    });

    return totals;
  }

  calculateTotalIncome(entries: TaxEntry[]): number {
    return entries
      .filter(e => e.type === 'INCOME')
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  calculateTotalExpenses(entries: TaxEntry[]): number {
    return entries
      .filter(e => e.type === 'EXPENSE')
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  calculatePersonTotals(entries: TaxEntry[]): Record<string, number> {
    const totals: Record<string, number> = {};

    entries.forEach(entry => {
      if (entry.personId) {
        totals[entry.personId] = (totals[entry.personId] || 0) + entry.amount;
      } else {
        totals['unknown'] = (totals['unknown'] || 0) + entry.amount;
      }
    });

    return totals;
  }

  assessRiskLevel(entries: TaxEntry[]): RiskLevel {
    if (entries.length === 0) return RiskLevel.LOW;

    let maxRisk: RiskLevel = RiskLevel.LOW;

    // Check each entry's category risk
    for (const entry of entries) {
      const metadata = getCategoryMetadata(entry.category);
      if (metadata.riskLevel === RiskLevel.HIGH) {
        return RiskLevel.HIGH; // High risk category present -> Global High Risk
      }
      if (metadata.riskLevel === RiskLevel.MEDIUM) {
        maxRisk = RiskLevel.MEDIUM;
      }
    }
    
    // Check for missing documents
    const hasMissingDocs = entries.some(e => e.documentStatus === DocumentStatus.MISSING);
    if (hasMissingDocs && maxRisk === RiskLevel.LOW) {
        maxRisk = RiskLevel.MEDIUM;
    }

    return maxRisk;
  }

  calculateCompletenessScore(entries: TaxEntry[]): number {
    if (entries.length === 0) return 100;

    const completeCount = entries.filter(e => e.documentStatus === DocumentStatus.COMPLETE).length;
    return Math.round((completeCount / entries.length) * 100);
  }

  calculateQuotientFamilial(household: TaxHousehold, members: HouseholdMember[]): number {
    let parts = 0;

    // 1. Base parts for adults
    if (household.maritalStatus === MaritalStatus.MARRIED || household.maritalStatus === MaritalStatus.CIVIL_UNION) {
      parts += 2;
    } else if (household.maritalStatus === MaritalStatus.WIDOWED) {
       // Check if there are dependent children to maintain 2 parts
       // For MVP we assume simple case: Widow = 1 unless children. 
       // Actually French rule: Veuf/Veuve avec enfants à charge = 2 parts like married.
       const hasDependents = household.dependents.length > 0;
       parts += hasDependents ? 2 : 1;
    } else {
      parts += 1; // Single, Divorced, Separated
    }

    // 2. Children Calculation
    // We need to iterate through dependents and apply the 0.5, 0.5, 1 rule.
    // BUT we must handle Alternate Custody (divide by 2) and Disability (+0.5).
    
    // Filter for actual children (dependents)
    // Note: members list might contain all history, so ensure we look at current dependents
    const dependentMembers = members.filter(m => household.dependents.includes(m.id));
    
    // Sort by birthdate? Usually order doesn't matter for the count unless disability logic is complex, 
    // but the 0.5/0.5/1 rule applies to count.
    
    let childIndex = 0;
    
    dependentMembers.forEach(child => {
        childIndex++;
        let partToAdd = 0;
        
        const isAlternate = child.custody === CustodyType.ALTERNATE;
        
        // Rule: 1st and 2nd child = 0.5. 3rd+ = 1.0.
        // Alternate custody halves these values.
        if (childIndex <= 2) {
            partToAdd = isAlternate ? 0.25 : 0.5;
        } else {
            partToAdd = isAlternate ? 0.5 : 1.0;
        }
        
        parts += partToAdd;

        // Disability bonus for child
        if (child.disabilityCard) {
            parts += 0.5;
        }
    });

    // Disability bonus for adults
    const adultMembers = members.filter(m => household.declarants.includes(m.id));
    adultMembers.forEach(adult => {
        if (adult.disabilityCard || adult.warVeteran) {
             parts += 0.5;
        }
    });

    // Parent Isolé (Single Parent) Logic
    // If Single/Divorced/Separated AND Living Alone with Dependents
    const isSingleStatus = ([MaritalStatus.SINGLE, MaritalStatus.DIVORCED, MaritalStatus.SEPARATED] as MaritalStatus[]).includes(household.maritalStatus);
    // "Living alone" is hard to check perfectly without more data, but we assume if only 1 declarant.
    const isSingleDeclarant = household.declarants.length === 1;

    if (isSingleStatus && isSingleDeclarant && dependentMembers.length > 0) {
        // The first child counts as 1 full part instead of 0.5.
        // So we add +0.5 bonus.
        // Unless it's alternate custody?
        // Rule: "Si vous vivez seul avec vos enfants : +0.5 part pour le 1er enfant".
        // In case of alternate custody, the bonus is shared (+0.25).
        
        const firstChild = dependentMembers[0];
        const isAlternate = firstChild.custody === CustodyType.ALTERNATE;
        parts += isAlternate ? 0.25 : 0.5;
    }

    return parts;
  }

  generatePreview(year: number, entries: TaxEntry[], household: TaxHousehold, members: HouseholdMember[]): TaxPreview {
    const categoryTotals = this.calculateCategoryTotals(entries);
    const totalIncome = this.calculateTotalIncome(entries);
    const totalExpenses = this.calculateTotalExpenses(entries);
    const riskAssessment = this.assessRiskLevel(entries);
    
    let householdParts = 0;
    // Safety check if household data is partial
    if (household && members) {
        householdParts = this.calculateQuotientFamilial(household, members);
    }
    
    let estimatedImpact = `Votre foyer fiscal dispose de ${householdParts} parts. `;
    if (totalExpenses > 0) {
        estimatedImpact += "Les dépenses saisies pourraient réduire votre impôt.";
    }

    return {
      year,
      totalIncome,
      totalExpenses,
      householdParts,
      categoryTotals,
      riskAssessment,
      estimatedImpact,
    };
  }
}
