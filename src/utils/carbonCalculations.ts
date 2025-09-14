import type { Transaction, Product, CarbonFootprint, EcoPoints } from '../types';
import { ProductCategory } from '../types';

// Carbon intensity rates (kg CO₂e per $ spent)
// Can be expanded or overridden without changing core logic
const CARBON_RATES: Partial<Record<ProductCategory, number>> = {
  [ProductCategory.ELECTRONICS]: 1.5,
  [ProductCategory.CLOTHING]: 0.8,
  [ProductCategory.FOOD]: 0.4,
  [ProductCategory.GROCERIES]: 0.4,
  [ProductCategory.OTHER]: 0.6,
};

// Default fallback rate if category not found
const DEFAULT_CARBON_RATE = 0.7;

export const getCarbonRate = (category: ProductCategory): number => {
  return CARBON_RATES[category] ?? DEFAULT_CARBON_RATE;
};

// Calculate footprint for a single product
export const calculateProductCarbonFootprint = (product: Product): number => {
  const rate = getCarbonRate(product.category);
  return product.price * product.quantity * rate;
};

// Calculate footprint for a transaction (sum of all products)
export const calculateTransactionCarbonFootprint = (transaction: Transaction): number => {
  return transaction.products.reduce((total, product) => {
    return total + calculateProductCarbonFootprint(product);
  }, 0);
};

// Calculate eco points for a transaction
export const calculateEcoPoints = (transaction: Transaction, carbonFootprint?: number): number => {
  // Sustainable product bonus (scaled by price, min 5 points)
  const sustainablePoints = transaction.products.reduce((points, product) => {
    if (product.is_sustainable) {
      return points + Math.max(5, Math.round(product.price * 0.1));
    }
    return points;
  }, 0);

  // Carbon savings bonus
  const footprint = carbonFootprint ?? calculateTransactionCarbonFootprint(transaction);
  const averageFootprint = transaction.total_amount * 0.8; // baseline
  const carbonSaved = Math.max(0, averageFootprint - footprint);
  const carbonPoints = Math.floor(carbonSaved / 5) * 10;

  return sustainablePoints + carbonPoints;
};

// Enrich transaction with precomputed footprint + points
export const enrichTransaction = (transaction: Transaction) => {
  const carbonFootprint = calculateTransactionCarbonFootprint(transaction);
  const ecoPoints = calculateEcoPoints(transaction, carbonFootprint);
  return { ...transaction, carbonFootprint, ecoPoints };
};

// Aggregate carbon footprint across transactions
export const aggregateCarbonFootprint = (transactions: Transaction[]): CarbonFootprint => {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  let total = 0;
  let weekly = 0;
  let monthly = 0;
  const byCategory: Record<ProductCategory, number> = {} as Record<ProductCategory, number>;

  for (const t of transactions) {
    const ts = new Date(t.date).getTime();
    const footprint = calculateTransactionCarbonFootprint(t);
    total += footprint;

    if (ts >= oneWeekAgo) weekly += footprint;
    if (ts >= oneMonthAgo) monthly += footprint;

    for (const p of t.products) {
      const pf = calculateProductCarbonFootprint(p);
      byCategory[p.category] = (byCategory[p.category] || 0) + pf;
    }
  }

  return { total, weekly, monthly, byCategory };
};

// Aggregate eco points across transactions
export const aggregateEcoPoints = (transactions: Transaction[]): EcoPoints => {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  let total = 0;
  let earned_this_week = 0;
  let earned_this_month = 0;

  for (const t of transactions) {
    const ts = new Date(t.date).getTime();
    const points = calculateEcoPoints(t);
    total += points;

    if (ts >= oneWeekAgo) earned_this_week += points;
    if (ts >= oneMonthAgo) earned_this_month += points;
  }

  const plants_unlocked = Math.floor(total / 50); // Each plant = 50 points

  return { total, earned_this_week, earned_this_month, plants_unlocked };
};
