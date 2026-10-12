import type { AppData, Ingredient, Menu, Period, Product } from '../../core/types';

// Demo data loaded on first launch so owners can see how the tool works.
// Prices are realistic French wholesale (Metro / Promocash type) prices HT.

const now = Date.now();
const ing = (id: string, name: string, category: Ingredient['category'], unit: Ingredient['unit'], packPrice: number, packQuantity: number, wastePct: number): Ingredient =>
  ({ id, name, category, unit, packPrice, packQuantity, wastePct, updatedAt: now });

const ingredients: Ingredient[] = [
  ing('i-bun', 'Pain burger brioché', 'food', 'piece', 9.6, 48, 2),
  ing('i-steak', 'Steak haché 15% MG', 'food', 'kg', 11.9, 1, 3),
  ing('i-cheddar', 'Cheddar tranches', 'food', 'piece', 7.2, 84, 0),
  ing('i-salad', 'Salade iceberg', 'food', 'kg', 2.8, 1, 25),
  ing('i-tomato', 'Tomate', 'food', 'kg', 3.2, 1, 15),
  ing('i-sauce', 'Sauce burger', 'food', 'kg', 8.5, 2, 5),
  ing('i-fries', 'Frites surgelées 9mm', 'food', 'kg', 13.5, 10, 8),
  ing('i-oil', 'Huile de friture', 'food', 'l', 39, 25, 0),
  ing('i-chicken', 'Filet de poulet pané', 'food', 'kg', 9.8, 1, 4),
  ing('i-tortilla', 'Galette tortilla 30cm', 'food', 'piece', 6.5, 18, 2),
  ing('i-soda', 'Soda canette 33cl', 'drink', 'piece', 9.6, 24, 0),
  ing('i-box', 'Boîte burger carton', 'packaging', 'piece', 32, 500, 1),
  ing('i-friesbag', 'Cornet à frites', 'packaging', 'piece', 18, 1000, 1),
  ing('i-bag', 'Sac kraft', 'packaging', 'piece', 45, 500, 0),
  ing('i-napkin', 'Serviettes', 'packaging', 'piece', 12, 2000, 0),
];

const prod = (id: string, name: string, category: string, priceTTC: number, lines: [string, number][], target = 30): Product =>
  ({ id, name, category, priceTTC, tvaRate: 10, targetFoodCostPct: target, updatedAt: now,
     lines: lines.map(([ingredientId, quantity]) => ({ ingredientId, quantity })) });

const products: Product[] = [
  prod('p-cheese', 'Cheeseburger', 'Burgers', 6.5, [['i-bun', 1], ['i-steak', 0.12], ['i-cheddar', 2], ['i-salad', 0.015], ['i-tomato', 0.02], ['i-sauce', 0.02], ['i-box', 1], ['i-napkin', 2]]),
  prod('p-double', 'Double Cheese', 'Burgers', 8.9, [['i-bun', 1], ['i-steak', 0.24], ['i-cheddar', 3], ['i-salad', 0.015], ['i-sauce', 0.025], ['i-box', 1], ['i-napkin', 2]]),
  prod('p-wrap', 'Wrap poulet', 'Wraps', 7.5, [['i-tortilla', 1], ['i-chicken', 0.13], ['i-salad', 0.02], ['i-tomato', 0.03], ['i-sauce', 0.025], ['i-napkin', 2]]),
  prod('p-fries', 'Frites moyennes', 'Accompagnements', 3.2, [['i-fries', 0.15], ['i-oil', 0.015], ['i-friesbag', 1]], 25),
  prod('p-soda', 'Soda 33cl', 'Boissons', 2.5, [['i-soda', 1]], 30),
];

const menus: Menu[] = [
  { id: 'm-cheese', name: 'Menu Cheeseburger', priceTTC: 10.9, tvaRate: 10, updatedAt: now,
    items: [{ productId: 'p-cheese', quantity: 1 }, { productId: 'p-fries', quantity: 1 }, { productId: 'p-soda', quantity: 1 }] },
  { id: 'm-wrap', name: 'Menu Wrap', priceTTC: 11.5, tvaRate: 10, updatedAt: now,
    items: [{ productId: 'p-wrap', quantity: 1 }, { productId: 'p-fries', quantity: 1 }, { productId: 'p-soda', quantity: 1 }] },
];

const month = new Date().toISOString().slice(0, 7);
const periods: Period[] = [{
  id: 'per-demo', month, deliverySharePct: 30, deliveryCommissionPct: 30, updatedAt: now,
  sales: [
    { itemType: 'menu', itemId: 'm-cheese', quantity: 1450 },
    { itemType: 'menu', itemId: 'm-wrap', quantity: 620 },
    { itemType: 'product', itemId: 'p-double', quantity: 540 },
    { itemType: 'product', itemId: 'p-cheese', quantity: 380 },
    { itemType: 'product', itemId: 'p-wrap', quantity: 160 },
    { itemType: 'product', itemId: 'p-fries', quantity: 900 },
    { itemType: 'product', itemId: 'p-soda', quantity: 700 },
  ],
  fixedCosts: [
    { id: 'fc-rent', name: 'Loyer', amount: 3200 },
    { id: 'fc-staff', name: 'Salaires + charges', amount: 14500 },
    { id: 'fc-energy', name: 'Électricité / gaz', amount: 1100 },
    { id: 'fc-other', name: 'Assurance, comptable, logiciels', amount: 650 },
  ],
}];

export const SAMPLE_DATA: AppData = { ingredients, products, menus, periods };
