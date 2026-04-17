import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Clock, 
  Factory, 
  CheckCircle, 
  Package,
  AlertTriangle,
  Play,
  Pause,
  Eye,
  FileText
} from "lucide-react";

interface ProductionStats {
  pendingOrders: number;
  inProgress: number;
  completedOrders: number;
  materialShortages: number;
  totalProduction: number;
  efficiency: number;
  onTimeDelivery: number;
}

interface ProductionOrder {
  id: string;
  productName: string;
  quantity: number;
  deadline: string;
  status: string;
  progress: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const ProductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [stats] = useState<ProductionStats>({
    pendingOrders: 12,
    inProgress: 8,
    completedOrders: 45,
    materialShortages: 3,
    totalProduction: 65,
    efficiency: 87,
    onTimeDelivery: 92
  });

  const [recentOrders] = useState<ProductionOrder[]>([
    { id: 'PO-001', productName: 'Steel Bolts', quantity: 5000, deadline: '2024-05-20', status: 'In Progress', progress: 65, priority: 'HIGH' },
    { id: 'PO-002', productName: 'Aluminum Frames', quantity: 250, deadline: '2024-05-18', status: 'Pending', progress: 0, priority: 'HIGH' },
    { id: 'PO-003', productName: 'Plastic Molds', quantity: 1000, deadline: '2024-05-22', status: 'Material Shortage', progress: 0, priority: 'MEDIUM' },
    { id: 'PO-004', productName: 'Rubber Gaskets', quantity: 3000, deadline: '2024-05-19', status: 'In Progress', progress: 45, priority: 'HIGH' },
    { id: 'PO-005', productName: 'Steel Plates', quantity: 1500, deadline: '2024-05-21', status: 'Completed', progress: 100, priority: 'LOW' },
  ]);

  const [materialAlerts] = useState([
    { material: 'Steel Grade A', required: 5000, available: 3200, shortage: 1800 },
    { material: 'Aluminum Sheet', required: 1000, available: 1000, shortage: 0 },
    { material: 'Plastic Resin', required: 2500, available: 500, shortage: 2000 },
  ]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Progress': return 'bg-orange-100 text-orange-700';
      case 'Pending': return 'bg-blue-100 text-blue-700';
      case 'Material Shortage': return 'bg-red-100 text-red-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/production/orders/view/${orderId}`);
  };

  const handleCreateProduction = () => {
    navigate('/production/planning');
  };

  return (
    <div className="min-h-screen bg-[#FEF9E8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Production Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage production activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Pending Orders</p>
              <Clock size={20} className="text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</h3>
            <p className="text-xs text-gray-500 mt-1">Awaiting production</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase">In Progress</p>
              <Factory size={20} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.inProgress}</h3>
            <p className="text-xs text-gray-500 mt-1">Currently manufacturing</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Completed</p>
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.completedOrders}</h3>
            <p className="text-xs text-gray-500 mt-1">Finished products</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase">Material Shortages</p>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.materialShortages}</h3>
            <p className="text-xs text-gray-500 mt-1">Need immediate attention</p>
          </div>
        </div>

        {/* Additional Metrics */}
       

        {/* Material Shortages Alert */}
        {materialAlerts.filter(m => m.shortage > 0).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={22} />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-2">Material Shortages Alert</h4>
                <div className="space-y-3">
                  {materialAlerts.filter(m => m.shortage > 0).map((alert, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl">
                      <span className="font-medium text-gray-800">{alert.material}</span>
                      <div className="flex gap-4 text-sm">
                        <span>Required: <strong>{alert.required}</strong></span>
                        <span>Available: <strong>{alert.available}</strong></span>
                        <span className="text-red-600">Shortage: <strong>{alert.shortage}</strong></span>
                      </div>
                      <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition">
                        Create Purchase Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Production Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Recent Production Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Latest production activities</p>
            </div>
            <button 
              onClick={() => navigate('/production/orders')}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2"
            >
              <Package size={16} />
              View All Orders
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.deadline}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${order.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{order.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="p-1.5 text-gray-400 hover:text-orange-500 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleCreateProduction}
            className="flex items-center justify-center gap-2 p-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition"
          >
            <Play size={18} /> Start New Production
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
            <Pause size={18} /> Hold Production
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
            <AlertTriangle size={18} /> Report Issue
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
            <FileText size={18} /> Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;