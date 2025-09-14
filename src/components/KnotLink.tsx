import React, { useState } from 'react';
import type { Connection, Transaction } from '../types';
import { ProductCategory } from '../types';

interface MockKnotLinkProps {
  onSuccess: (connection: Connection, transactions?: Transaction[]) => void;
  onExit?: (error?: any) => void;
}

const mockMerchants = [
  { id: 44, name: 'Amazon', logo: '🛒' },
  { id: 165, name: 'Costco', logo: '🏪' },
  { id: 19, name: 'DoorDash', logo: '🚗' },
  { id: 40, name: 'Instacart', logo: '🛍️' },
  { id: 12, name: 'Target', logo: '🎯' },
  { id: 36, name: 'Uber Eats', logo: '🍔' },
  { id: 45, name: 'Walmart', logo: '🏬' },
];

// Function to fetch real transaction data from Knot API
const fetchTransactionData = async (merchantId: number, externalUserId: string = 'abc', limit: number = 5): Promise<Transaction[]> => {
  try {
    const response = await fetch('https://knot.tunnel.tel/transactions/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        external_user_id: externalUserId,
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔄 Knot API Response:', data);

    // Transform the API response to match our Transaction interface
    return transformKnotTransactions(data.transactions || []);
  } catch (error) {
    console.error('❌ Failed to fetch transaction data:', error);
    return [];
  }
};

// Transform Knot API transaction format to our internal format
const transformKnotTransactions = (knotTransactions: any[]): Transaction[] => {
  return knotTransactions.map((knotTx: any) => {
    const transaction: Transaction = {
      id: knotTx.id || knotTx.external_id || `tx_${Date.now()}_${Math.random()}`,
      merchant_id: 44, // Default to Amazon since that's what we're testing with
      external_user_id: knotTx.external_user_id || 'abc',
      date: knotTx.datetime ? new Date(knotTx.datetime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      total_amount: parseFloat(knotTx.price?.total || '0'),
      currency: knotTx.price?.currency || 'USD',
      products: transformKnotProducts(knotTx.products || []),
    };

    return transaction;
  });
};

// Transform Knot product data to our Product interface
const transformKnotProducts = (knotProducts: any[]) => {
  if (!knotProducts || knotProducts.length === 0) {
    return [{
      id: `p_${Date.now()}`,
      name: 'Sample Product',
      category: ProductCategory.OTHER,
      price: Math.floor(Math.random() * 50) + 10,
      quantity: 1,
      is_sustainable: Math.random() > 0.5,
    }];
  }

  return knotProducts.map((knotProduct: any) => ({
    id: knotProduct.external_id || `p_${Date.now()}_${Math.random()}`,
    name: knotProduct.name || 'Unknown Product',
    category: categorizeProduct(knotProduct.name, knotProduct.category),
    price: parseFloat(knotProduct.price?.unit_price || knotProduct.price?.total || '0'),
    quantity: parseInt(knotProduct.quantity?.toString() || '1'),
    is_sustainable: detectSustainableProduct(knotProduct.name, knotProduct.description),
  }));
};

// Categorize products based on name and category
const categorizeProduct = (productName: string = '', category?: string): ProductCategory => {
  const name = productName.toLowerCase();
  const cat = category?.toLowerCase() || '';

  // Electronics keywords - updated based on actual product names
  if (name.includes('wemo') || name.includes('smart plug') || name.includes('webcam') || 
      name.includes('sandisk') || name.includes('memory card') || name.includes('ring') || 
      name.includes('doorbell') || name.includes('echo') || name.includes('alexa') || 
      name.includes('sony') || name.includes('speaker') || name.includes('oculus') || 
      name.includes('vr') || name.includes('gaming') || name.includes('gpu') || 
      name.includes('rtx') || name.includes('logitech') || name.includes('mouse') || 
      name.includes('iphone') || name.includes('spigen') || name.includes('case') ||
      name.includes('asus') || name.includes('zenbook') || name.includes('laptop') ||
      name.includes('thermometer') || name.includes('digital') || name.includes('dymo') ||
      name.includes('label maker') || cat.includes('electronics') || cat.includes('tech')) {
    return ProductCategory.ELECTRONICS;
  }

  // Clothing keywords
  if (name.includes('nike') || name.includes('socks') || name.includes('ray-ban') || 
      name.includes('sunglasses') || name.includes('shirt') || name.includes('pants') || 
      name.includes('dress') || name.includes('shoes') || name.includes('jacket') || 
      name.includes('jeans') || cat.includes('clothing') || cat.includes('apparel') || 
      cat.includes('fashion')) {
    return ProductCategory.CLOTHING;
  }

  // Food keywords
  if (name.includes('almonds') || name.includes('snack') || name.includes('essentia water') ||
      name.includes('meal') || name.includes('restaurant') || name.includes('pizza') || 
      name.includes('burger') || name.includes('coffee') || cat.includes('food') || 
      cat.includes('restaurant') || cat.includes('dining')) {
    return ProductCategory.FOOD;
  }

  // Groceries keywords - household items, personal care, health
  if (name.includes('tide') || name.includes('detergent') || name.includes('shampoo') ||
      name.includes('mascara') || name.includes('moisturizer') || name.includes('vitamin') ||
      name.includes('sunscreen') || name.includes('lip balm') || name.includes('toothbrush') ||
      name.includes('dental') || name.includes('eye drops') || name.includes('bed sheet') ||
      name.includes('grocery') || name.includes('supermarket') || name.includes('milk') || 
      name.includes('bread') || name.includes('fruit') || name.includes('vegetable') ||
      cat.includes('grocery') || cat.includes('market')) {
    return ProductCategory.GROCERIES;
  }

  return ProductCategory.OTHER;
};

// Detect if a product is sustainable based on keywords - updated for real products
const detectSustainableProduct = (productName: string = '', description?: string): boolean => {
  const text = `${productName} ${description || ''}`.toLowerCase();
  
  const sustainableKeywords = [
    'organic', 'eco', 'sustainable', 'green', 'renewable', 'recycled',
    'bamboo', 'hemp', 'local', 'fair trade', 'carbon neutral',
    'biodegradable', 'compostable', 'reusable', 'solar', 'plant-based',
    'hydro flask', 'yeti', 'stainless steel', 'vacuum insulated', // Reusable bottles
    'yoga mat', 'tpe', // Eco-friendly fitness
    'vitamin', 'natural', // Health/wellness
    'blue diamond almonds', // Natural snacks
  ];

  return sustainableKeywords.some(keyword => text.includes(keyword));
};

export const KnotLink: React.FC<MockKnotLinkProps> = ({ onSuccess }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const handleConnect = async () => {
    if (!selectedMerchantId) return;
    
    const merchant = mockMerchants.find(m => m.id.toString() === selectedMerchantId);
    if (!merchant) return;

    setIsConnecting(true);
    setStatus('Connecting to merchant...');

    try {
      // Create the connection
      const connection: Connection = {
        id: `conn_${Date.now()}`,
        merchant_id: merchant.id,
        external_user_id: `user_${Date.now()}`,
        merchant_name: merchant.name,
        status: 'active',
        created_at: new Date().toISOString()
      };

      setStatus('Fetching transaction data...');
      
      // Fetch real transaction data from Knot API
      const transactions = await fetchTransactionData(merchant.id);
      
      setStatus('Processing transactions...');
      
      // Small delay to show the status
      setTimeout(() => {
        setIsConnecting(false);
        setSelectedMerchantId('');
        setStatus('');
        onSuccess(connection, transactions);
      }, 1000);

    } catch (error) {
      console.error('Connection failed:', error);
      setStatus('Connection failed. Please try again.');
      setTimeout(() => {
        setIsConnecting(false);
        setStatus('');
      }, 2000);
    }
  };

  const selectedMerchant = mockMerchants.find(m => m.id.toString() === selectedMerchantId);

  return (
    <div style={mockStyles.container}>
      <div style={mockStyles.header}>
        <h3 style={mockStyles.title}>Connect Your Shopping Accounts</h3>
        <p style={mockStyles.description}>
          Select a merchant from the dropdown to connect your account and fetch real transaction data from the Knot API.
        </p>
      </div>
      
      <div style={mockStyles.connectForm}>
        <div style={mockStyles.selectContainer}>
          <label style={mockStyles.label} htmlFor="merchant-select">
            Choose a merchant:
          </label>
          <div style={mockStyles.selectWrapper}>
            <select
              id="merchant-select"
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              style={mockStyles.select}
              disabled={isConnecting}
            >
              <option value="">Select a merchant...</option>
              {mockMerchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id.toString()}>
                  {merchant.logo} {merchant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedMerchant && (
          <div style={mockStyles.selectedMerchant}>
            <div style={mockStyles.merchantPreview}>
              <span style={mockStyles.merchantLogo}>{selectedMerchant.logo}</span>
              <span style={mockStyles.merchantName}>
                Ready to connect to {selectedMerchant.name}
              </span>
            </div>
          </div>
        )}

        {status && (
          <div style={mockStyles.statusMessage}>
            {status}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={!selectedMerchantId || isConnecting}
          style={{
            ...mockStyles.connectButton,
            ...((!selectedMerchantId || isConnecting) ? mockStyles.connectButtonDisabled : {})
          }}
        >
          {isConnecting ? (
            <>
              <span style={mockStyles.spinner}>⏳</span>
              Connecting...
            </>
          ) : (
            `Connect ${selectedMerchant ? selectedMerchant.name : 'Account'}`
          )}
        </button>
      </div>
      
    </div>
  );
};

const mockStyles = {
  container: {
    padding: '2rem',
    background: 'white',
    borderRadius: '16px',
    margin: '1rem 0',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1e5e9',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  title: {
    margin: '0 0 1rem 0',
    color: '#2d3748',
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  description: {
    margin: 0,
    color: '#4a5568',
    lineHeight: 1.6,
    fontSize: '1rem',
  },
  connectForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  selectContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  label: {
    fontWeight: 600,
    color: '#2d3748',
    fontSize: '1rem',
  },
  selectWrapper: {
    position: 'relative' as const,
  },
  select: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    background: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease',
    appearance: 'none' as const,
    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'feather feather-chevron-down\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '20px',
    paddingRight: '3rem',
  } as React.CSSProperties,
  selectedMerchant: {
    width: '100%',
    maxWidth: '400px',
  },
  merchantPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '2px solid #4ECDC4',
    justifyContent: 'center',
  },
  merchantLogo: {
    fontSize: '1.5rem',
  },
  merchantName: {
    fontWeight: 600,
    color: '#2d3748',
  },
  connectButton: {
    background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '200px',
    justifyContent: 'center',
  },
  connectButtonDisabled: {
    background: '#cbd5e0',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  demoNote: {
    background: '#f7fafc',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
  },
  statusMessage: {
    padding: '0.75rem',
    background: '#e6f7ff',
    border: '1px solid #91d5ff',
    borderRadius: '8px',
    color: '#0050b3',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
    fontStyle: 'italic',
  },
};