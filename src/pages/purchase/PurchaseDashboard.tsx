import React from 'react';

export const PurchaseDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🛒 Purchase Dashboard</h1>
      <p>Welcome back, {user.fullName || 'User'}!</p>
      <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <h2>Purchase Overview</h2>
        <p>Open Purchase Orders: 23</p>
        <p>Overdue POs: 4</p>
        <p>Pending Approvals: 7</p>
      </div>
    </div>
  );
};
