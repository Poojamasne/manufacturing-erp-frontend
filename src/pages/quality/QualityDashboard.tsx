import React from 'react';

export const QualityDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>✅ Quality Dashboard</h1>
      <p>Welcome back, {user.fullName || 'User'}!</p>
      <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <h2>Quality Overview</h2>
        <p>Rejection Rate: 4.5%</p>
        <p>Pass Rate: 95.5%</p>
        <p>Open NCRs: 12</p>
      </div>
    </div>
  );
};
