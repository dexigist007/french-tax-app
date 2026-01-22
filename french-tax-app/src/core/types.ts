
// Enums replaced with const objects for erasableSyntaxOnly compatibility

export const MaritalStatus = {
  SINGLE: 'SINGLE', // Célibataire
  MARRIED: 'MARRIED', // Marié
  CIVIL_UNION: 'CIVIL_UNION', // Pacsé
  DIVORCED: 'DIVORCED', // Divorcé
  WIDOWED: 'WIDOWED', // Veuf/Veuve
  SEPARATED: 'SEPARATED', // Séparé
} as const;

export type MaritalStatus = typeof MaritalStatus[keyof typeof MaritalStatus];

export const IncomeCategory = {
  SALARY: 'SALARY', // Traitements et salaires
  PENSION: 'PENSION', // Pensions, retraites, rentes
  INVESTMENT: 'INVESTMENT', // Revenus de capitaux mobiliers
  PROPERTY: 'PROPERTY', // Revenus fonciers
  BIC: 'BIC', // Bénéfices industriels et commerciaux
  BNC: 'BNC', // Bénéfices non commerciaux
  BA: 'BA', // Bénéfices agricoles
  OTHER: 'OTHER',
} as const;

export type IncomeCategory = typeof IncomeCategory[keyof typeof IncomeCategory];

export const TaxCategory = { // Renamed conceptually to Expense/Deduction but keeping name for now to minimize breakage or I will rename it to ExpenseCategory
  CHILDCARE: 'CHILDCARE', // Frais de garde d’enfants
  HOME_SERVICES: 'HOME_SERVICES', // Services à la personne
  DONATIONS: 'DONATIONS', // Dons
  EDUCATION: 'EDUCATION', // Dépenses liées à l’éducation
  RENTAL_EXPENSES: 'RENTAL_EXPENSES', // Dépenses liées à la location immobilière
  PROFESSIONAL_EXPENSES: 'PROFESSIONAL_EXPENSES', // Frais professionnels
  UNION_DUES: 'UNION_DUES', // Cotisations syndicales
  SUPPORT_PAYMENTS: 'SUPPORT_PAYMENTS', // Pensions alimentaires versées
  ELDERLY_CARE: 'ELDERLY_CARE', // Accueil personnes âgées
  ENERGY_WORK: 'ENERGY_WORK', // Travaux économie d'énergie
  RETIREMENT_SAVINGS: 'RETIREMENT_SAVINGS', // Épargne retraite (PER, PERP)
  DISABILITY_WORKS: 'DISABILITY_WORKS', // Aménagement habitat (handicap/âge)
  INVESTMENT_SME: 'INVESTMENT_SME', // Investissement PME / FCPI
  MAINTENANCE_ALLOWANCE: 'MAINTENANCE_ALLOWANCE', // Prestation compensatoire
} as const;

export type TaxCategory = typeof TaxCategory[keyof typeof TaxCategory];
// Alias for clarity in new code
export type ExpenseCategory = TaxCategory;
export const ExpenseCategory = TaxCategory;

export const DocumentStatus = {
  COMPLETE: 'COMPLETE', // Complet
  MISSING: 'MISSING', // Manquant
  RISK: 'RISK', // À risque / conditionnel
} as const;

export type DocumentStatus = typeof DocumentStatus[keyof typeof DocumentStatus];

export const MemberRole = {
  DECLARANT_1: 'DECLARANT_1',
  DECLARANT_2: 'DECLARANT_2',
  CHILD: 'CHILD',
  DEPENDENT: 'DEPENDENT',
} as const;

export type MemberRole = typeof MemberRole[keyof typeof MemberRole];

export const CustodyType = {
  EXCLUSIVE: 'EXCLUSIVE', // Garde exclusive
  ALTERNATE: 'ALTERNATE', // Garde alternée
  NONE: 'NONE', // Pas de garde
} as const;

export type CustodyType = typeof CustodyType[keyof typeof CustodyType];

export const YearStatus = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type YearStatus = typeof YearStatus[keyof typeof YearStatus];

export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

export const EventType = {
  MARRIAGE: 'MARRIAGE',
  PAC: 'PAC',
  DIVORCE: 'DIVORCE',
  SEPARATION: 'SEPARATION',
  DEATH: 'DEATH',
  BIRTH: 'BIRTH',
  ADOPTION: 'ADOPTION',
} as const;

export type EventType = typeof EventType[keyof typeof EventType];

// Interfaces

export interface HouseholdMember {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  role: MemberRole;
  disabilityCard: boolean; // Carte d'invalidité >= 80%
  warVeteran: boolean; // Carte du combattant
  custody?: CustodyType; // For children
  attachedToHousehold: boolean; // Rattachement for adult children
  birthYear?: number; // Legacy/Derived support
}

export interface HouseholdEvent {
  id: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  memberIds: string[]; // Who is involved
}

export interface TaxEntry { // Generic entry interface
  id: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  amount: number;
  category: TaxCategory | IncomeCategory;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  personId?: string; // Optional, links to HouseholdMember
  documentStatus: DocumentStatus;
  updatedAt: number; // Timestamp
}

export interface IncomeEntry extends TaxEntry {
    category: IncomeCategory;
    type: 'INCOME';
}

export interface ExpenseEntry extends TaxEntry {
    category: ExpenseCategory;
    type: 'EXPENSE';
}

export interface TaxHousehold {
  id: string; // usually linked to year
  year: number;
  maritalStatus: MaritalStatus;
  declarants: string[]; // IDs of HouseholdMembers
  dependents: string[]; // IDs of HouseholdMembers
  events: HouseholdEvent[];
  quotientFamilial: number; // Calculated parts
}

export interface TaxYear {
  id: string; // e.g., "2023"
  year: number;
  status: YearStatus;
  entries: TaxEntry[];
  household: TaxHousehold;
  members: HouseholdMember[]; // Snapshot of members for that year
  closedAt?: number;
}

export interface CategoryMetadata {
  id: TaxCategory | IncomeCategory;
  label: string; // French label
  description: string;
  examples: string[];
  riskLevel: RiskLevel;
  type: 'INCOME' | 'EXPENSE';
}

export interface TaxPreview {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  householdParts: number; // Quotient familial
  categoryTotals: Record<string, number>;
  riskAssessment: RiskLevel;
  estimatedImpact: string; // Text description
}

export interface DeclarationChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  step: number;
}

export interface DeclarationChecklist {
  year: number;
  items: DeclarationChecklistItem[];
  progress: number; // 0-100
}
