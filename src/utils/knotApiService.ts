import type { Transaction, Connection, CarbonFootprint, EcoPoints } from '../types';
import { ProductCategory } from '../types';

// Knot API integration utilities
export class KnotApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, environment: 'development' | 'production' = 'development') {
    this.apiKey = apiKey;
    this.baseUrl = environment === 'production' 
      ? 'https://api.knotapi.com' 
      : 'https://api-dev.knotapi.com';
  }

  // Create a session for the Knot SDK
  async createSession(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          product: 'transaction_link',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error('Error creating Knot session:', error);
      throw error;
    }
  }

  // Sync transactions from Knot API
  async syncTransactions(merchantId: number, externalUserId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          merchant_id: merchantId,
          external_user_id: externalUserId,
          limit: limit,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync transactions: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform Knot transaction data to our Transaction interface
      return this.transformKnotTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  // Transform Knot API transaction format to our internal format
  private transformKnotTransactions(knotTransactions: any[]): Transaction[] {
    return knotTransactions.map((knotTx: any) => {
      const transaction: Transaction = {
        id: knotTx.id || `tx_${Date.now()}_${Math.random()}`,
        merchant_id: knotTx.merchant_id,
        external_user_id: knotTx.external_user_id,
        date: knotTx.date || new Date().toISOString().split('T')[0],
        total_amount: knotTx.total_amount || 0,
        currency: knotTx.currency || 'USD',
        products: this.transformKnotProducts(knotTx.products || []),
      };

      return transaction;
    });
  }

  // Transform Knot product data to our Product interface
  private transformKnotProducts(knotProducts: any[]) {
    return knotProducts.map((knotProduct: any) => ({
      id: knotProduct.id || `p_${Date.now()}_${Math.random()}`,
      name: knotProduct.name || 'Unknown Product',
      category: this.categorizeProduct(knotProduct.name, knotProduct.category),
      price: knotProduct.price || 0,
      quantity: knotProduct.quantity || 1,
      is_sustainable: this.detectSustainableProduct(knotProduct.name, knotProduct.description),
    }));
  }

  // Categorize products based on name and category
  private categorizeProduct(productName: string, category?: string): ProductCategory {
    const name = productName.toLowerCase();
    const cat = category?.toLowerCase() || '';

    // Electronics keywords
    if (name.includes('phone') || name.includes('laptop') || name.includes('headphone') || 
        name.includes('tablet') || name.includes('computer') || name.includes('tv') ||
        cat.includes('electronics') || cat.includes('tech')) {
      return ProductCategory.ELECTRONICS;
    }

    // Clothing keywords
    if (name.includes('shirt') || name.includes('pants') || name.includes('dress') || 
        name.includes('shoes') || name.includes('jacket') || name.includes('jeans') ||
        cat.includes('clothing') || cat.includes('apparel') || cat.includes('fashion')) {
      return ProductCategory.CLOTHING;
    }

    // Food keywords
    if (name.includes('meal') || name.includes('restaurant') || name.includes('pizza') || 
        name.includes('burger') || name.includes('coffee') || name.includes('snack') ||
        cat.includes('food') || cat.includes('restaurant') || cat.includes('dining')) {
      return ProductCategory.FOOD;
    }

    // Groceries keywords
    if (name.includes('grocery') || name.includes('supermarket') || name.includes('milk') || 
        name.includes('bread') || name.includes('fruit') || name.includes('vegetable') ||
        cat.includes('grocery') || cat.includes('market')) {
      return ProductCategory.GROCERIES;
    }

    return ProductCategory.OTHER;
  }

  // Detect if a product is sustainable based on keywords
  private detectSustainableProduct(productName: string, description?: string): boolean {
    const text = `${productName} ${description || ''}`.toLowerCase();
    
    const sustainableKeywords = [
      'organic', 'eco', 'sustainable', 'green', 'renewable', 'recycled',
      'bamboo', 'hemp', 'local', 'fair trade', 'carbon neutral',
      'biodegradable', 'compostable', 'reusable', 'solar', 'plant-based'
    ];

    return sustainableKeywords.some(keyword => text.includes(keyword));
  }

  // List available merchants
  async listMerchants(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/merchants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list merchants: ${response.statusText}`);
      }

      const data = await response.json();
      return data.merchants || [];
    } catch (error) {
      console.error('Error listing merchants:', error);
      throw error;
    }
  }
}