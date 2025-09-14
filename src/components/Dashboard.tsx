import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { CarbonFootprint, EcoPoints, Transaction } from '../types';

interface DashboardProps {
  carbonFootprint: CarbonFootprint | null;
  ecoPoints: EcoPoints | null;
  transactions: Transaction[];
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const Dashboard: React.FC<DashboardProps> = ({ 
  carbonFootprint, 
  ecoPoints, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div style={dashboardStyles.container}>
        <div style={dashboardStyles.loadingContainer}>
          <div style={dashboardStyles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!carbonFootprint || !ecoPoints) {
    return (
      <div className="dashboard" style={dashboardStyles.container}>
        <h1 style={dashboardStyles.title}>🌱 EcoTrack Dashboard</h1>
        <div style={dashboardStyles.noData}>
          <p>No data available yet. Start by connecting your accounts or adding transactions!</p>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(carbonFootprint.byCategory).map(([category, value]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: Number(value.toFixed(2))
  }));

  // Calculate weekly data based on February 10th, 2024
  const weeklyData = [
    { name: 'This Week (Feb 4-10)', carbon: carbonFootprint.weekly, target: 15 },
    { name: 'Last Week (Jan 28-Feb 3)', carbon: carbonFootprint.weekly * 1.2, target: 15 },
    { name: '2 Weeks Ago (Jan 21-27)', carbon: carbonFootprint.weekly * 0.8, target: 15 },
    { name: '3 Weeks Ago (Jan 14-20)', carbon: carbonFootprint.weekly * 1.1, target: 15 },
  ];

  return (
    <div className="dashboard" style={dashboardStyles.container}>
      <h1 style={dashboardStyles.title}>🌱 EcoTrack Dashboard</h1>
      
      {/* Summary Cards */}
      <div style={dashboardStyles.summaryCards}>
        <div style={dashboardStyles.card}>
          <h3 style={dashboardStyles.cardTitle}>Total Carbon Footprint</h3>
          <div style={dashboardStyles.metric}>{carbonFootprint.total.toFixed(2)} kg CO₂e</div>
          <div style={dashboardStyles.subMetric}>This month: {carbonFootprint.monthly.toFixed(2)} kg</div>
        </div>
        
        <div style={dashboardStyles.card}>
          <h3 style={dashboardStyles.cardTitle}>EcoPoints Earned</h3>
          <div style={dashboardStyles.metric}>{ecoPoints.total}</div>
          <div style={dashboardStyles.subMetric}>This week: +{ecoPoints.earned_this_week}</div>
        </div>
        
        <div style={dashboardStyles.card}>
          <h3 style={dashboardStyles.cardTitle}>Plants Unlocked</h3>
          <div style={dashboardStyles.metric}>{ecoPoints.plants_unlocked}</div>
          <div style={dashboardStyles.subMetric}>Next at {((ecoPoints.plants_unlocked + 1) * 50)} points</div>
        </div>
        
        <div style={dashboardStyles.card}>
          <h3 style={dashboardStyles.cardTitle}>Weekly Progress</h3>
          <div style={dashboardStyles.metric}>{carbonFootprint.weekly.toFixed(1)} kg CO₂e</div>
          <div style={dashboardStyles.subMetric}>Target: 15 kg/week</div>
        </div>
      </div>

      {/* Charts */}
      <div style={dashboardStyles.chartsGrid}>
        <div style={dashboardStyles.chartContainer}>
          <h3 style={dashboardStyles.chartTitle}>Weekly Carbon Footprint Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="carbon" fill="#FF6B6B" name="Carbon Footprint (kg CO₂e)" />
              <Bar dataKey="target" fill="#4ECDC4" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={dashboardStyles.chartContainer}>
          <h3 style={dashboardStyles.chartTitle}>Carbon Footprint by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const dashboardStyles = {
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
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  noData: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#666',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
  },
  cardTitle: {
    margin: '0 0 1rem 0',
    color: '#333',
    fontSize: '1rem',
    fontWeight: 600,
  },
  metric: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: '0.5rem',
  },
  subMetric: {
    color: '#666',
    fontSize: '0.9rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  chartContainer: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  chartTitle: {
    margin: '0 0 1rem 0',
    color: '#333',
    textAlign: 'center' as const,
  },
  recentTransactions: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    margin: '0 0 1rem 0',
    color: '#333',
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    color: '#000',
  },
  transactionDate: {
    fontSize: '0.8rem',
    color: '#000',
  },
  transactionAmount: {
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #4ECDC4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};