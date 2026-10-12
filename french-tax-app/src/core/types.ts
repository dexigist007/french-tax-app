// Domain model for fast-food cost control.
// All monetary amounts are in euros. Purchase prices are HT (hors taxes).
// Selling prices are TTC (toutes taxes comprises), as displayed to customers.

export type Unit = 'kg' | 'l' | 'piece';

export type IngredientCategory = 'food' | 'drink' | 'packaging' | 'other';

/** French VAT rates relevant to fast food (in %). */
export const TVA_RATES = [5.5, 10, 20] as const;
export type TvaRate = (typeof TVA_RATES)[number];

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: Unit;
  /** Price paid for one purchase pack, HT. */
  packPrice: number;
  /** Quantity contained in one pack, expressed in `unit`. */
  packQuantity: number;
  /** Waste / loss percentage (trimming, spoilage, overportioning), 0-99. */
  wastePct: number;
  updatedAt: number;
}

export interface RecipeLine {
  ingredientId: string;
  /** Quantity used, expressed in the ingredient's `unit` (e.g. 0.15 kg). */
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  lines: RecipeLine[];
  /** Current selling price TTC. */
  priceTTC: number;
  /** TVA rate applied (10% for food consumed on site or for immediate consumption). */
  tvaRate: TvaRate;
  /** Target food cost as % of HT price (typical fast food: 25-32%). */
  targetFoodCostPct: number;
  updatedAt: number;
}

export interface MenuItem {
  productId: string;
  quantity: number;
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
  priceTTC: number;
  tvaRate: TvaRate;
  updatedAt: number;
}

export interface FixedCost {
  id: string;
  name: string;
  /** Monthly amount HT. */
  amount: number;
}

export type SaleItemType = 'product' | 'menu';

export interface SaleLine {
  itemType: SaleItemType;
  itemId: string;
  quantity: number;
}

/** One accounting period (usually a month) with sales volumes and overheads. */
export interface Period {
  id: string;
  /** Format YYYY-MM */
  month: string;
  sales: SaleLine[];
  fixedCosts: FixedCost[];
  /** Share of revenue sold through delivery platforms (0-100). */
  deliverySharePct: number;
  /** Commission taken by delivery platforms on TTC price (0-100). */
  deliveryCommissionPct: number;
  updatedAt: number;
}

export interface AppData {
  ingredients: Ingredient[];
  products: Product[];
  menus: Menu[];
  periods: Period[];
}
