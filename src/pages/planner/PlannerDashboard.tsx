// src/pages/planner/PlannerDashboard.tsx

import React from 'react';

export const PlannerDashboard: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>📅 Production Planner</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Welcome back, {user.fullName}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#6b7280' }}>Work Orders Planned</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold' }}>8</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#6b7280' }}>Released WOs</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold' }}>12</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#6b7280' }}>Capacity Utilized</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold' }}>78%</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px' }}>
          <p style={{ color: '#6b7280' }}>Material Shortages</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>3</p>
        </div>
      </div>
    </div>
  );
};