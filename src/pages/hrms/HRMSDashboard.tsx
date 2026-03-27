import React from 'react';

export const HRMSDashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>👥 HRMS Dashboard</h1>
      <p>Welcome back, {user.fullName || 'User'}!</p>
      <div style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <h2>HR Overview</h2>
        <p>Total Employees: 450</p>
        <p>Present Today: 412</p>
        <p>On Leave: 23</p>
      </div>
    </div>
  );
};
