import React, { useState } from 'react';
import type { Transaction } from '../types';
import { ProductCategory } from '../types';
import { calculateTransactionCarbonFootprint, calculateEcoPoints } from '../utils/carbonCalculations';

interface TransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
}

type FilterType = 'all' | ProductCategory;
type SortType = 'date' | 'carbon' | 'amount';

export const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.products.some(product => product.category === filter);
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'carbon':
        return calculateTransactionCarbonFootprint(b) - calculateTransactionCarbonFootprint(a);
      case 'amount':
        return (b.total_amount || 0) - (a.total_amount || 0);
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const toggleExpanded = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: ProductCategory): string => {
    const colors: Record<ProductCategory, string> = {
      [ProductCategory.ELECTRONICS]: '#FF6B6B',
      [ProductCategory.CLOTHING]: '#4ECDC4',
      [ProductCategory.FOOD]: '#45B7D1',
      [ProductCategory.GROCERIES]: '#96CEB4',
      [ProductCategory.OTHER]: '#FFEAA7'
    };
    return colors[category];
  };

  return (
    <div style={transactionStyles.container}>
      <h1 style={transactionStyles.title}>Transaction History</h1>
      
      <div style={transactionStyles.controls}>
        <div style={transactionStyles.filterGroup}>
          <label style={transactionStyles.label}>Filter by Category:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as FilterType)}
            style={transactionStyles.select}
          >
            <option value="all">All Categories</option>
            <option value={ProductCategory.ELECTRONICS}>Electronics</option>
            <option value={ProductCategory.CLOTHING}>Clothing</option>
            <option value={ProductCategory.FOOD}>Food</option>
            <option value={ProductCategory.GROCERIES}>Groceries</option>
            <option value={ProductCategory.OTHER}>Other</option>
          </select>
        </div>
        
        <div style={transactionStyles.filterGroup}>
          <label style={transactionStyles.label}>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortType)}
            style={transactionStyles.select}
          >
            <option value="date">Date</option>
            <option value="carbon">Carbon Impact</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      <div style={transactionStyles.transactionsContainer}>
        {sortedTransactions.length === 0 ? (
          <div style={transactionStyles.emptyState}>
            <p>No transactions found. Connect your merchant accounts to start tracking!</p>
          </div>
        ) : (
          <div style={transactionStyles.transactionsGrid}>
            {sortedTransactions.map((transaction) => {
              const carbonFootprint = calculateTransactionCarbonFootprint(transaction);
              const ecoPoints = calculateEcoPoints(transaction);
              const isExpanded = expandedTransactions.has(transaction.id);
              const hasMoreProducts = (transaction.products?.length || 0) > 3;
              
              return (
                <div key={transaction.id} style={transactionStyles.transactionCard}>
                  <div style={transactionStyles.transactionHeader}>
                    <div style={transactionStyles.headerLeft}>
                      <div style={transactionStyles.date}>{formatDate(transaction.date)}</div>
                    </div>
                    <div style={transactionStyles.amount}>
                      ${(transaction.total_amount || 0).toFixed(2)}
                    </div>
                  </div>
                  
                  <div style={transactionStyles.transactionMetrics}>
                    <div style={transactionStyles.metric}>
                      <span style={transactionStyles.label}>Carbon Impact:</span>
                      <span style={{...transactionStyles.value, color: '#FF6B6B'}}>
                        {carbonFootprint.toFixed(2)} kg CO₂e
                      </span>
                    </div>
                    <div style={transactionStyles.metric}>
                      <span style={transactionStyles.label}>EcoPoints:</span>
                      <span style={{...transactionStyles.value, color: '#4ECDC4'}}>+{ecoPoints}</span>
                    </div>
                  </div>
                  
                  <div style={transactionStyles.products}>
                    <div style={transactionStyles.productsHeader}>
                      <h4 style={transactionStyles.productsTitle}>
                        Products ({transaction.products?.length || 0})
                      </h4>
                      {hasMoreProducts && (
                        <button
                          onClick={() => toggleExpanded(transaction.id)}
                          style={transactionStyles.expandButton}
                        >
                          {isExpanded ? '▼ Show Less' : '▶ Show All'}
                        </button>
                      )}
                    </div>
                    
                    <div style={transactionStyles.productsList}>
                      {(transaction.products || [])
                        .slice(0, isExpanded ? undefined : 3)
                        .map((product, index) => (
                        <div key={product.id || index} style={transactionStyles.productItem}>
                          <div style={transactionStyles.productLeft}>
                            <div style={transactionStyles.productName}>
                              {product.name || 'Unknown Product'}
                            </div>
                            <div style={transactionStyles.productDetails}>
                              <span 
                                style={{
                                  ...transactionStyles.categoryTag,
                                  backgroundColor: getCategoryColor(product.category || ProductCategory.OTHER)
                                }}
                              >
                                {product.category || 'other'}
                              </span>
                              {product.is_sustainable && (
                                <span style={transactionStyles.sustainableBadge}>🌱 Sustainable</span>
                              )}
                            </div>
                          </div>
                          <div style={transactionStyles.productRight}>
                            <div style={transactionStyles.price}>
                              ${(product.price || 0).toFixed(2)}
                            </div>
                            {(product.quantity || 1) > 1 && (
                              <div style={transactionStyles.quantity}>
                                Qty: {product.quantity}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {!isExpanded && hasMoreProducts && (
                        <div style={transactionStyles.moreProducts}>
                          +{(transaction.products?.length || 0) - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const transactionStyles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '2rem',
  },
  controls: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontWeight: 600,
    color: '#333',
    fontSize: '0.8rem',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    background: 'white',
    fontSize: '0.9rem',
  },
  transactionsContainer: {
    minHeight: '400px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#666',
  },
  transactionsGrid: {
    display: 'grid',
    gap: '1.5rem',
  },
  transactionCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid #4ECDC4',
  },
  transactionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    flex: 1,
  },
  date: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
  },
  mainProduct: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left' as const,
  },
  amount: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
  },
  transactionMetrics: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  value: {
    fontWeight: 'bold',
  },
  products: {},
  productsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  productsTitle: {
    margin: '0',
    color: '#333',
    fontSize: '1rem',
  },
  expandButton: {
    background: 'none',
    border: '1px solid #4ECDC4',
    color: '#4ECDC4',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '0.75rem',
    background: '#f8f9fa',
    borderRadius: '6px',
  },
  productLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    flex: 1,
  },
  productName: {
    fontWeight: 500,
    color: '#333',
    textAlign: 'left' as const,
    marginBottom: '0.5rem',
  },
  productDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  productRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  categoryTag: {
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    color: 'white',
    fontWeight: 500,
  },
  price: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '1rem',
  },
  quantity: {
    fontSize: '0.8rem',
    color: '#666',
  },
  sustainableBadge: {
    fontSize: '0.8rem',
    color: '#4CAF50',
    fontWeight: 500,
  },
  moreProducts: {
    textAlign: 'center' as const,
    color: '#666',
    fontStyle: 'italic',
    padding: '0.5rem',
    background: '#f0f0f0',
    borderRadius: '6px',
  },
};