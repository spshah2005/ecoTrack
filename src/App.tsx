import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Rewards } from './components/Rewards';
import { KnotLink } from './components/KnotLink';
import type { Transaction, Connection, CarbonFootprint, EcoPoints } from './types';
import { ProductCategory } from './types';
import { aggregateCarbonFootprint, aggregateEcoPoints } from './utils/carbonCalculations';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint | null>(null);
  const [ecoPoints, setEcoPoints] = useState<EcoPoints | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Calculate carbon footprint and eco points from transactions
    if (transactions.length > 0) {
      const footprint = aggregateCarbonFootprint(transactions);
      const points = aggregateEcoPoints(transactions);
      setCarbonFootprint(footprint);
      setEcoPoints(points);
    } else {
      // Reset to null when no transactions
      setCarbonFootprint(null);
      setEcoPoints(null);
    }
  }, [transactions]);

  const handleConnectionSuccess = (connectionData: Connection, apiTransactions?: Transaction[]) => {
    // Add the new connection
    setConnections(prev => [...prev, connectionData]);
    
    // If we have API transactions, add them to our transaction list
    if (apiTransactions && apiTransactions.length > 0) {
      console.log(`✅ Adding ${apiTransactions.length} transactions from Knot API`);
      setTransactions(prev => [...prev, ...apiTransactions]);
    }
  };

  return (
    <Router>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">
            <h1>🌱 EcoTrack</h1>
          </div>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
              Transactions
            </NavLink>
            <NavLink to="/rewards" className={({ isActive }) => isActive ? 'active' : ''}>
              Rewards
            </NavLink>
            <NavLink to="/connect" className={({ isActive }) => isActive ? 'active' : ''}>
              Connect Accounts
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  carbonFootprint={carbonFootprint}
                  ecoPoints={ecoPoints}
                  transactions={transactions}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/transactions" 
              element={<Transactions transactions={transactions} loading={loading} />} 
            />
            <Route 
              path="/rewards" 
              element={<Rewards ecoPoints={ecoPoints || { total: 0, earned_this_week: 0, earned_this_month: 0, plants_unlocked: 0 }} />}
            />
            <Route 
              path="/connect" 
              element={
                <div className="connect-accounts">                  
                  <KnotLink onSuccess={handleConnectionSuccess} />

                  <div className="connections-list">
                    <h3>Connected Accounts ({connections.length})</h3>
                    {connections.length === 0 ? (
                      <p>No accounts connected yet. Connect a merchant above to get started!</p>
                    ) : (
                      <div className="connections-grid">
                        {connections.map((connection) => (
                          <div key={connection.id} className="connection-card">
                            <h4>{connection.merchant_name}</h4>
                            <p>Status: <span className={`status ${connection.status}`}>{connection.status}</span></p>
                            <p>Connected: {new Date(connection.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
