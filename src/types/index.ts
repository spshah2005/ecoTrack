export interface Transaction {
  id: string;
  merchant_id: number;
  external_user_id: string;
  date: string;
  total_amount: number;
  currency: string;
  products: Product[];
  carbon_footprint?: number;
  eco_points?: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  quantity: number;
  is_sustainable?: boolean;
}

export const enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FOOD = 'food',
  GROCERIES = 'groceries',
  OTHER = 'other'
}

export interface Connection {
  id: string;
  merchant_id: number;
  merchant_name: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  external_user_id: string;
}

export interface CarbonFootprint {
  total: number;
  weekly: number;
  monthly: number;
  byCategory: Record<ProductCategory, number>;
}

export interface EcoPoints {
  total: number;
  earned_this_week: number;
  earned_this_month: number;
  plants_unlocked: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  connections: Connection[];
  carbon_footprint: CarbonFootprint;
  eco_points: EcoPoints;
}

export interface KnotLinkProps {
  apiKey: string;
  onSuccess: (connection: Connection) => void;
  onExit: (error?: any) => void;
}