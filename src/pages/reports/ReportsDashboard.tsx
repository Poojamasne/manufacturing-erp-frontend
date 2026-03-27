// src/pages/reports/ReportsDashboard.tsx

import React from 'react';

export const ReportsDashboard: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  const reports = [
    { name: 'Production Report', icon: '🏭', description: 'Daily/Weekly/Monthly production summary' },
    { name: 'Sales Report', icon: '💰', description: 'Order status and revenue analysis' },
    { name: 'Inventory Report', icon: '📦', description: 'Stock levels and movement' },
    { name: 'Quality Report', icon: '✅', description: 'Rejection rates and defect analysis' },
    { name: 'HR Report', icon: '👥', description: 'Attendance and leave summary' },
    { name: 'Financial Report', icon: '💵', description: 'P&L, Balance Sheet, Cash Flow' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>📊 Reports Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Welcome back, {user.fullName}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {reports.map((report, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{report.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{report.name}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>{report.description}</p>
            <button style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Generate Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};