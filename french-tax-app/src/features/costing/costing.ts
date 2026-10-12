import type { Ingredient, Menu, Period, Product, RecipeLine } from '../../core/types';

const round2 = (n: number) => Math.round(n * 100) / 100;

export const htFromTtc = (ttc: number, tvaRate: number) => ttc / (1 + tvaRate / 100);
export const ttcFromHt = (ht: number, tvaRate: number) => ht * (1 + tvaRate / 100);

/** Real cost of one unit of ingredient, including waste. */
export function ingredientUnitCost(ing: Ingredient): number {
  if (ing.packQuantity <= 0) return 0;
  const waste = Math.min(Math.max(ing.wastePct, 0), 99) / 100;
  return ing.packPrice / ing.packQuantity / (1 - waste);
}

export interface LineCost {
  line: RecipeLine;
  ingredient?: Ingredient;
  cost: number;
}

export function recipeLineCosts(lines: RecipeLine[], ingredients: Map<string, Ingredient>): LineCost[] {
  return lines.map(line => {
    const ingredient = ingredients.get(line.ingredientId);
    const cost = ingredient ? ingredientUnitCost(ingredient) * line.quantity : 0;
    return { line, ingredient, cost };
  });
}

/** Material cost (food + packaging) of one product, HT. */
export function productCost(product: Product, ingredients: Map<string, Ingredient>): number {
  return recipeLineCosts(product.lines, ingredients).reduce((s, l) => s + l.cost, 0);
}

export interface Margin {
  cost: number;
  priceHT: number;
  priceTTC: number;
  /** Gross margin per unit, HT (a.k.a. contribution margin). */
  marginHT: number;
  /** Margin as % of HT price. */
  marginPct: number;
  /** Food cost as % of HT price. */
  foodCostPct: number;
  /** Price TTC / cost — common restaurant "coefficient multiplicateur". */
  coefficient: number;
}

export function computeMargin(cost: number, priceTTC: number, tvaRate: number): Margin {
  const priceHT = htFromTtc(priceTTC, tvaRate);
  const marginHT = priceHT - cost;
  return {
    cost,
    priceHT,
    priceTTC,
    marginHT,
    marginPct: priceHT > 0 ? (marginHT / priceHT) * 100 : 0,
    foodCostPct: priceHT > 0 ? (cost / priceHT) * 100 : 0,
    coefficient: cost > 0 ? priceTTC / cost : 0,
  };
}

/**
 * Suggested TTC price so that the material cost equals `targetFoodCostPct` of
 * the HT price. Rounded up to the next ending in `.x0` (e.g. 7.43 -> 7.50)
 * so prices stay readable on a menu board.
 */
export function suggestPriceTTC(cost: number, targetFoodCostPct: number, tvaRate: number): number {
  if (cost <= 0 || targetFoodCostPct <= 0) return 0;
  const ht = cost / (targetFoodCostPct / 100);
  const ttc = ttcFromHt(ht, tvaRate);
  return Math.ceil(round2(ttc) * 10 - 1e-9) / 10;
}

export function productMargin(product: Product, ingredients: Map<string, Ingredient>): Margin {
  return computeMargin(productCost(product, ingredients), product.priceTTC, product.tvaRate);
}

export function menuCost(menu: Menu, products: Map<string, Product>, ingredients: Map<string, Ingredient>): number {
  return menu.items.reduce((s, item) => {
    const p = products.get(item.productId);
    return s + (p ? productCost(p, ingredients) * item.quantity : 0);
  }, 0);
}

/** Sum of the TTC prices of the menu's items if bought separately. */
export function menuALaCartePrice(menu: Menu, products: Map<string, Product>): number {
  return menu.items.reduce((s, item) => s + (products.get(item.productId)?.priceTTC ?? 0) * item.quantity, 0);
}

export function menuMargin(menu: Menu, products: Map<string, Product>, ingredients: Map<string, Ingredient>): Margin {
  return computeMargin(menuCost(menu, products, ingredients), menu.priceTTC, menu.tvaRate);
}

// --- Profit & loss ---------------------------------------------------------

export interface SoldItemStats {
  itemType: 'product' | 'menu';
  itemId: string;
  name: string;
  quantity: number;
  revenueHT: number;
  revenueTTC: number;
  cost: number;
  unitMarginHT: number;
  totalMarginHT: number;
}

export interface ProfitAndLoss {
  items: SoldItemStats[];
  revenueTTC: number;
  revenueHT: number;
  tva: number;
  materialCost: number;
  grossMargin: number;
  grossMarginPct: number;
  foodCostPct: number;
  deliveryCommissions: number;
  fixedCosts: number;
  netResult: number;
  netResultPct: number;
  /** HT revenue needed to cover fixed costs, at the current margin structure. */
  breakEvenRevenueHT: number | null;
}

export function computeProfitAndLoss(
  period: Period,
  products: Map<string, Product>,
  menus: Map<string, Menu>,
  ingredients: Map<string, Ingredient>,
): ProfitAndLoss {
  const items: SoldItemStats[] = [];
  for (const sale of period.sales) {
    if (sale.quantity <= 0) continue;
    let margin: Margin | null = null;
    let name = '';
    if (sale.itemType === 'product') {
      const p = products.get(sale.itemId);
      if (p) { margin = productMargin(p, ingredients); name = p.name; }
    } else {
      const m = menus.get(sale.itemId);
      if (m) { margin = menuMargin(m, products, ingredients); name = m.name; }
    }
    if (!margin) continue;
    items.push({
      itemType: sale.itemType,
      itemId: sale.itemId,
      name,
      quantity: sale.quantity,
      revenueHT: margin.priceHT * sale.quantity,
      revenueTTC: margin.priceTTC * sale.quantity,
      cost: margin.cost * sale.quantity,
      unitMarginHT: margin.marginHT,
      totalMarginHT: margin.marginHT * sale.quantity,
    });
  }

  const revenueTTC = items.reduce((s, i) => s + i.revenueTTC, 0);
  const revenueHT = items.reduce((s, i) => s + i.revenueHT, 0);
  const materialCost = items.reduce((s, i) => s + i.cost, 0);
  const grossMargin = revenueHT - materialCost;
  // Platforms take their commission on the TTC basket; the commission itself is a cost HT for the restaurant.
  const deliveryCommissions = revenueTTC * (period.deliverySharePct / 100) * (period.deliveryCommissionPct / 100);
  const fixedCosts = period.fixedCosts.reduce((s, c) => s + c.amount, 0);
  const netResult = grossMargin - deliveryCommissions - fixedCosts;

  // Contribution ratio: what is left of each euro HT after variable costs.
  const variableRatio = revenueHT > 0 ? (materialCost + deliveryCommissions) / revenueHT : 0;
  const contribution = 1 - variableRatio;
  const breakEvenRevenueHT = revenueHT > 0 && contribution > 0 ? fixedCosts / contribution : null;

  return {
    items,
    revenueTTC,
    revenueHT,
    tva: revenueTTC - revenueHT,
    materialCost,
    grossMargin,
    grossMarginPct: revenueHT > 0 ? (grossMargin / revenueHT) * 100 : 0,
    foodCostPct: revenueHT > 0 ? (materialCost / revenueHT) * 100 : 0,
    deliveryCommissions,
    fixedCosts,
    netResult,
    netResultPct: revenueHT > 0 ? (netResult / revenueHT) * 100 : 0,
    breakEvenRevenueHT,
  };
}

// --- Menu engineering (Kasavana & Smith matrix) -----------------------------

export type EngineeringClass = 'star' | 'plowhorse' | 'puzzle' | 'dog';

export interface EngineeringRow extends SoldItemStats {
  mixPct: number;
  highPopularity: boolean;
  highMargin: boolean;
  classification: EngineeringClass;
}

/**
 * Popularity is "high" when the item's share of units sold reaches 70% of a fair
 * share (1/n). Margin is "high" when the unit margin is at least the weighted
 * average unit margin.
 */
export function menuEngineering(items: SoldItemStats[]): EngineeringRow[] {
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  if (items.length === 0 || totalQty === 0) return [];
  const popularityThreshold = (1 / items.length) * 0.7 * 100;
  const avgMargin = items.reduce((s, i) => s + i.totalMarginHT, 0) / totalQty;

  return items.map(i => {
    const mixPct = (i.quantity / totalQty) * 100;
    const highPopularity = mixPct >= popularityThreshold;
    const highMargin = i.unitMarginHT >= avgMargin - 1e-9;
    const classification: EngineeringClass = highPopularity
      ? (highMargin ? 'star' : 'plowhorse')
      : (highMargin ? 'puzzle' : 'dog');
    return { ...i, mixPct, highPopularity, highMargin, classification };
  });
}

export const toMap = <T extends { id: string }>(list: T[]) => new Map(list.map(x => [x.id, x]));
