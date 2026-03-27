import React from 'react';

export const InventoryDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>📦 Inventory Dashboard</h1>
      <p>Welcome back, {user.fullName || 'User'}!</p>
      <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <h2>Stock Overview</h2>
        <p>Raw Material: ₹28,00,000</p>
        <p>Finished Goods: ₹9,00,000</p>
        <p>Low Stock Items: 8</p>
      </div>
    </div>
  );
};
