import { describe, it, expect } from 'vitest';
import type { Ingredient, Menu, Period, Product } from '../../core/types';
import {
  computeMargin, computeProfitAndLoss, ingredientUnitCost, menuALaCartePrice, menuCost,
  menuEngineering, productCost, suggestPriceTTC, toMap,
} from './costing';

const ing = (id: string, packPrice: number, packQuantity: number, wastePct = 0): Ingredient =>
  ({ id, name: id, category: 'food', unit: 'kg', packPrice, packQuantity, wastePct, updatedAt: 0 });

const ingredients = toMap([ing('bun', 10, 50), ing('steak', 12, 1, 4), ing('box', 20, 500)]);
const burger: Product = {
  id: 'burger', name: 'Burger', category: '', priceTTC: 6.6, tvaRate: 10, targetFoodCostPct: 30, updatedAt: 0,
  lines: [{ ingredientId: 'bun', quantity: 1 }, { ingredientId: 'steak', quantity: 0.12 }, { ingredientId: 'box', quantity: 1 }],
};
const fries: Product = {
  id: 'fries', name: 'Fries', category: '', priceTTC: 3.3, tvaRate: 10, targetFoodCostPct: 25, updatedAt: 0,
  lines: [{ ingredientId: 'box', quantity: 1 }],
};
const products = toMap([burger, fries]);

describe('ingredientUnitCost', () => {
  it('divides pack price by quantity and inflates by waste', () => {
    expect(ingredientUnitCost(ing('x', 10, 2))).toBe(5);
    expect(ingredientUnitCost(ing('x', 12, 1, 4))).toBeCloseTo(12.5);
  });
  it('returns 0 for an empty pack', () => {
    expect(ingredientUnitCost(ing('x', 10, 0))).toBe(0);
  });
});

describe('product costing & pricing', () => {
  it('sums recipe lines and ignores deleted ingredients', () => {
    // 0.20 + 0.12 * 12.5 + 0.04 = 1.74
    expect(productCost(burger, ingredients)).toBeCloseTo(1.74);
    const withMissing = { ...burger, lines: [...burger.lines, { ingredientId: 'gone', quantity: 3 }] };
    expect(productCost(withMissing, ingredients)).toBeCloseTo(1.74);
  });

  it('computes HT margin, food cost % and coefficient', () => {
    const m = computeMargin(1.5, 6.6, 10);
    expect(m.priceHT).toBeCloseTo(6);
    expect(m.marginHT).toBeCloseTo(4.5);
    expect(m.foodCostPct).toBeCloseTo(25);
    expect(m.marginPct).toBeCloseTo(75);
    expect(m.coefficient).toBeCloseTo(4.4);
  });

  it('suggests a TTC price rounded up to 10 cents', () => {
    // 1.74 / 0.30 = 5.80 HT -> 6.38 TTC -> 6.40
    expect(suggestPriceTTC(1.74, 30, 10)).toBe(6.4);
    // exact values are not bumped up: 1.5/0.25 = 6 HT -> 6.60 TTC
    expect(suggestPriceTTC(1.5, 25, 10)).toBe(6.6);
    expect(suggestPriceTTC(0, 30, 10)).toBe(0);
  });
});

describe('menus', () => {
  const menu: Menu = { id: 'm', name: 'Menu', priceTTC: 8.8, tvaRate: 10, updatedAt: 0,
    items: [{ productId: 'burger', quantity: 1 }, { productId: 'fries', quantity: 2 }] };
  it('costs a menu from its products', () => {
    expect(menuCost(menu, products, ingredients)).toBeCloseTo(1.74 + 0.08);
    expect(menuALaCartePrice(menu, products)).toBeCloseTo(13.2);
  });
});

describe('profit & loss', () => {
  const period: Period = {
    id: 'p', month: '2026-01', updatedAt: 0, deliverySharePct: 50, deliveryCommissionPct: 20,
    sales: [{ itemType: 'product', itemId: 'burger', quantity: 1000 }, { itemType: 'product', itemId: 'ghost', quantity: 5 }],
    fixedCosts: [{ id: 'rent', name: 'Rent', amount: 2000 }],
  };
  const pnl = computeProfitAndLoss(period, products, new Map(), ingredients);

  it('computes revenue, VAT and margins', () => {
    expect(pnl.items).toHaveLength(1);
    expect(pnl.revenueTTC).toBeCloseTo(6600);
    expect(pnl.revenueHT).toBeCloseTo(6000);
    expect(pnl.tva).toBeCloseTo(600);
    expect(pnl.materialCost).toBeCloseTo(1740);
    expect(pnl.grossMargin).toBeCloseTo(4260);
  });

  it('deducts delivery commissions and fixed costs', () => {
    // 6600 * 50% * 20% = 660
    expect(pnl.deliveryCommissions).toBeCloseTo(660);
    expect(pnl.netResult).toBeCloseTo(4260 - 660 - 2000);
  });

  it('computes break-even revenue', () => {
    // contribution = 1 - (1740 + 660) / 6000 = 0.6
    expect(pnl.breakEvenRevenueHT).toBeCloseTo(2000 / 0.6);
  });

  it('has no break-even with no sales', () => {
    expect(computeProfitAndLoss({ ...period, sales: [] }, products, new Map(), ingredients).breakEvenRevenueHT).toBeNull();
  });
});

describe('menuEngineering', () => {
  const item = (name: string, quantity: number, unitMarginHT: number) => ({
    itemType: 'product' as const, itemId: name, name, quantity, unitMarginHT, totalMarginHT: quantity * unitMarginHT,
    revenueHT: 0, revenueTTC: 0, cost: 0,
  });

  it('classifies items into the four quadrants', () => {
    const rows = menuEngineering([item('star', 400, 5), item('horse', 400, 2), item('puzzle', 50, 6), item('dog', 50, 1)]);
    const byName = Object.fromEntries(rows.map(r => [r.name, r.classification]));
    expect(byName).toEqual({ star: 'star', horse: 'plowhorse', puzzle: 'puzzle', dog: 'dog' });
  });

  it('returns nothing without sales', () => {
    expect(menuEngineering([])).toEqual([]);
  });
});
