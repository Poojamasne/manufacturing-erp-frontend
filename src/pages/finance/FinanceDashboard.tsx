import React from 'react';

export const FinanceDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>💵 Finance Dashboard</h1>
      <p>Welcome back, {user.fullName || 'User'}!</p>
      <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <h2>Financial Overview</h2>
        <p>Total Revenue: ₹45.2L</p>
        <p>Accounts Receivable: ₹12.5L</p>
        <p>Monthly Payroll: ₹18.5L</p>
      </div>
    </div>
  );
};
