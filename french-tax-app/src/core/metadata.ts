
import { TaxCategory, IncomeCategory, RiskLevel } from './types';
import type { CategoryMetadata } from './types';

export const EXPENSE_METADATA: Record<TaxCategory, CategoryMetadata> = {
  [TaxCategory.CHILDCARE]: {
    id: TaxCategory.CHILDCARE,
    label: 'Frais de garde d’enfants',
    description: 'Frais de garde pour les enfants de moins de 6 ans à l\'extérieur du domicile (crèche, assistante maternelle).',
    examples: ['Crèche', 'Assistante maternelle agréée', 'Garderie périscolaire'],
    riskLevel: RiskLevel.LOW,
    type: 'EXPENSE',
  },
  [TaxCategory.HOME_SERVICES]: {
    id: TaxCategory.HOME_SERVICES,
    label: 'Services à la personne',
    description: 'Dépenses pour l\'emploi d\'un salarié à domicile.',
    examples: ['Ménage', 'Jardinage', 'Soutien scolaire', 'Garde d\'enfants à domicile'],
    riskLevel: RiskLevel.LOW,
    type: 'EXPENSE',
  },
  [TaxCategory.DONATIONS]: {
    id: TaxCategory.DONATIONS,
    label: 'Dons',
    description: 'Dons versés à des associations d\'intérêt général ou d\'aide aux personnes en difficulté.',
    examples: ['Croix-Rouge', 'Restos du Cœur', 'Fondation de France'],
    riskLevel: RiskLevel.LOW,
    type: 'EXPENSE',
  },
  [TaxCategory.EDUCATION]: {
    id: TaxCategory.EDUCATION,
    label: 'Frais de scolarité',
    description: 'Réduction d\'impôt pour les enfants scolarisés au collège, lycée ou enseignement supérieur.',
    examples: ['Collège', 'Lycée', 'Université'],
    riskLevel: RiskLevel.LOW,
    type: 'EXPENSE',
  },
  [TaxCategory.RENTAL_EXPENSES]: {
    id: TaxCategory.RENTAL_EXPENSES,
    label: 'Dépenses liées à la location',
    description: 'Charges déductibles pour les revenus fonciers (location nue).',
    examples: ['Travaux de réparation', 'Taxe foncière', 'Assurance PNO', 'Frais de gestion'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'EXPENSE',
  },
  [TaxCategory.PROFESSIONAL_EXPENSES]: {
    id: TaxCategory.PROFESSIONAL_EXPENSES,
    label: 'Frais professionnels (Frais réels)',
    description: 'Dépenses nécessaires à l\'activité professionnelle salariée (déplacement, repas, etc.), si vous optez pour les frais réels.',
    examples: ['Frais kilométriques (Carburant, assurance)', 'Repas', 'Matériel informatique'],
    riskLevel: RiskLevel.HIGH,
    type: 'EXPENSE',
  },
  [TaxCategory.UNION_DUES]: {
    id: TaxCategory.UNION_DUES,
    label: 'Cotisations syndicales',
    description: 'Cotisations versées à un syndicat représentatif.',
    examples: ['Cotisation annuelle'],
    riskLevel: RiskLevel.LOW,
    type: 'EXPENSE',
  },
  [TaxCategory.SUPPORT_PAYMENTS]: {
    id: TaxCategory.SUPPORT_PAYMENTS,
    label: 'Pensions alimentaires versées',
    description: 'Pensions versées à des enfants majeurs, mineurs (en cas de divorce), ou ascendants.',
    examples: ['Pension enfant majeur étudiant', 'Pension ex-conjoint'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'EXPENSE',
  },
  [TaxCategory.ELDERLY_CARE]: {
    id: TaxCategory.ELDERLY_CARE,
    label: 'Accueil personnes âgées',
    description: 'Frais d\'accueil d\'une personne âgée de plus de 75 ans.',
    examples: ['Frais d\'hébergement'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'EXPENSE',
  },
  [TaxCategory.ENERGY_WORK]: {
    id: TaxCategory.ENERGY_WORK,
    label: 'Travaux économie d\'énergie',
    description: 'Dépenses éligibles à MaPrimeRénov\' ou autres dispositifs (selon année).',
    examples: ['Isolation', 'Chauffage'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'EXPENSE',
  },
  [TaxCategory.RETIREMENT_SAVINGS]: {
    id: TaxCategory.RETIREMENT_SAVINGS,
    label: 'Épargne Retraite (PER/PERP)',
    description: 'Cotisations versées sur un Plan d\'Épargne Retraite (PER, PERP, Préfon) déductibles du revenu global.',
    examples: ['Versement PER individuel', 'Cotisations Préfon', 'PERP'],
    riskLevel: RiskLevel.LOW,
    type: 'EXPENSE',
  },
  [TaxCategory.DISABILITY_WORKS]: {
    id: TaxCategory.DISABILITY_WORKS,
    label: 'Aménagement Habitat (Handicap/Âge)',
    description: 'Dépenses d\'installation ou remplacement d\'équipements pour personnes âgées ou handicapées.',
    examples: ['Douche senior', 'Monte-escalier', 'Rampes d\'accès'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'EXPENSE',
  },
  [TaxCategory.INVESTMENT_SME]: {
    id: TaxCategory.INVESTMENT_SME,
    label: 'Investissement PME / FCPI',
    description: 'Souscription au capital de PME ou parts de fonds (FCPI, FIP) ouvrant droit à réduction d\'impôt (IR-PME).',
    examples: ['Souscription directe PME', 'Parts de FCPI', 'Parts de FIP'],
    riskLevel: RiskLevel.HIGH,
    type: 'EXPENSE',
  },
  [TaxCategory.MAINTENANCE_ALLOWANCE]: {
    id: TaxCategory.MAINTENANCE_ALLOWANCE,
    label: 'Prestation Compensatoire (Divorce)',
    description: 'Sommes versées sous forme de capital suite à un jugement de divorce (sur une période < 12 mois).',
    examples: ['Versement en capital unique', 'Versements échelonnés < 12 mois'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'EXPENSE',
  },
};

export const INCOME_METADATA: Record<IncomeCategory, CategoryMetadata> = {
  [IncomeCategory.SALARY]: {
    id: IncomeCategory.SALARY,
    label: 'Traitements et salaires',
    description: 'Revenus d\'activité salariée.',
    examples: ['Salaire net imposable', 'Primes', 'Heures supplémentaires'],
    riskLevel: RiskLevel.LOW,
    type: 'INCOME',
  },
  [IncomeCategory.PENSION]: {
    id: IncomeCategory.PENSION,
    label: 'Pensions, retraites, rentes',
    description: 'Revenus de retraite et pensions d\'invalidité.',
    examples: ['Retraite de base', 'Retraite complémentaire'],
    riskLevel: RiskLevel.LOW,
    type: 'INCOME',
  },
  [IncomeCategory.INVESTMENT]: {
    id: IncomeCategory.INVESTMENT,
    label: 'Revenus de capitaux mobiliers',
    description: 'Intérêts, dividendes, produits de placement.',
    examples: ['Dividendes actions', 'Intérêts livrets fiscalisés'],
    riskLevel: RiskLevel.LOW,
    type: 'INCOME',
  },
  [IncomeCategory.PROPERTY]: {
    id: IncomeCategory.PROPERTY,
    label: 'Revenus fonciers',
    description: 'Loyers perçus (location nue).',
    examples: ['Loyers bruts encaissés'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'INCOME',
  },
  [IncomeCategory.BIC]: {
    id: IncomeCategory.BIC,
    label: 'Bénéfices Industriels et Commerciaux (BIC)',
    description: 'Revenus d\'activité commerciale, artisanale ou location meublée (LMNP).',
    examples: ['Vente de marchandises', 'Prestations de services commerciales', 'LMNP'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'INCOME',
  },
  [IncomeCategory.BNC]: {
    id: IncomeCategory.BNC,
    label: 'Bénéfices Non Commerciaux (BNC)',
    description: 'Revenus des professions libérales.',
    examples: ['Honoraires médecins', 'Avocats', 'Consultants', 'Droits d\'auteur'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'INCOME',
  },
  [IncomeCategory.BA]: {
    id: IncomeCategory.BA,
    label: 'Bénéfices Agricoles (BA)',
    description: 'Revenus de l\'activité agricole.',
    examples: ['Vente de production agricole'],
    riskLevel: RiskLevel.MEDIUM,
    type: 'INCOME',
  },
  [IncomeCategory.OTHER]: {
    id: IncomeCategory.OTHER,
    label: 'Autres revenus',
    description: 'Autres revenus imposables non classés ailleurs.',
    examples: [],
    riskLevel: RiskLevel.HIGH,
    type: 'INCOME',
  },
};

export const ALL_CATEGORIES_METADATA: Record<string, CategoryMetadata> = { ...EXPENSE_METADATA, ...INCOME_METADATA };

export function getCategoryMetadata(category: TaxCategory | IncomeCategory): CategoryMetadata {
  return ALL_CATEGORIES_METADATA[category as string] || {
    id: category,
    label: category,
    description: '',
    examples: [],
    riskLevel: RiskLevel.LOW,
    type: 'EXPENSE' // Default fallback
  };
}

export function getAllCategories(): CategoryMetadata[] {
  return Object.values(ALL_CATEGORIES_METADATA);
}

export function getIncomeCategories(): CategoryMetadata[] {
  return Object.values(INCOME_METADATA);
}

export function getExpenseCategories(): CategoryMetadata[] {
  return Object.values(EXPENSE_METADATA);
}
