import React from 'react';

export const ProductionDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🏭 Production Dashboard</h1>
      <p>Welcome back, {user.fullName || 'User'}!</p>
      <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <h2>Production Overview</h2>
        <p>Today's Target: 100 units</p>
        <p>Today's Output: 85 units</p>
        <p>Efficiency: 85%</p>
      </div>
    </div>
  );
};
