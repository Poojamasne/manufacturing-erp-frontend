// src/pages/operator/OperatorDashboard.tsx

import React from 'react';

export const OperatorDashboard: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>👷 Operator Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Welcome back, {user.fullName}</p>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Today's Tasks</h3>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600' }}>Work Order: WO-2026-001</span>
            <span style={{ color: '#f59e0b' }}>In Progress</span>
          </div>
          <p>Product: Refrigerator X-100</p>
          <p>Step: Cabinet Formation</p>
          <p>Target: 50 units</p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
            <button style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Start Production
            </button>
            <button style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Report Downtime
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};