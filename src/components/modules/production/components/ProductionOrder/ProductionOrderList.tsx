import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Edit, 
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Filter,
  Factory,
  Clock
} from "lucide-react";

interface ProductionOrder {
  id: string;
  productionOrderId: string;
  salesOrderId: string;
  productName: string;
  quantity: number;
  deadline: string;
  startDate?: string;
  endDate?: string;
  status: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  progress: number;
  assignedMachine?: string;
  assignedOperator?: string;
}

const ProductionOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [orders, setOrders] = useState<ProductionOrder[]>([
    {
      id: '1',
      productionOrderId: 'PO-001',
      salesOrderId: 'SO-001',
      productName: 'Steel Bolts',
      quantity: 5000,
      deadline: '2024-05-20',
      startDate: '2024-05-15',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 65,
      assignedMachine: 'Machine A',
      assignedOperator: 'John Doe'
    },
    {
      id: '2',
      productionOrderId: 'PO-002',
      salesOrderId: 'SO-002',
      productName: 'Aluminum Frames',
      quantity: 250,
      deadline: '2024-05-18',
      status: 'PLANNED',
      priority: 'HIGH',
      progress: 0
    },
    {
      id: '3',
      productionOrderId: 'PO-003',
      salesOrderId: 'SO-003',
      productName: 'Plastic Molds',
      quantity: 1000,
      deadline: '2024-05-22',
      status: 'ON_HOLD',
      priority: 'MEDIUM',
      progress: 30,
      assignedMachine: 'Machine B',
      assignedOperator: 'Jane Smith'
    },
    {
      id: '4',
      productionOrderId: 'PO-004',
      salesOrderId: 'SO-004',
      productName: 'Rubber Gaskets',
      quantity: 3000,
      deadline: '2024-05-19',
      endDate: '2024-05-18',
      status: 'COMPLETED',
      priority: 'HIGH',
      progress: 100,
      assignedMachine: 'Machine C',
      assignedOperator: 'Mike Johnson'
    },
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNED: 'bg-blue-100 text-blue-700',
      APPROVED: 'bg-purple-100 text-purple-700',
      IN_PROGRESS: 'bg-orange-100 text-orange-700',
      ON_HOLD: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-orange-600 bg-orange-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'IN_PROGRESS': return <Play size={14} />;
      case 'ON_HOLD': return <Pause size={14} />;
      case 'COMPLETED': return <CheckCircle size={14} />;
      case 'CANCELLED': return <AlertTriangle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.productionOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: ProductionOrder) => {
    navigate(`/production/orders/view/${order.id}`);
  };

  const handleEditOrder = (order: ProductionOrder) => {
    navigate(`/production/orders/edit/${order.id}`);
  };

  const handleStartProduction = (order: ProductionOrder) => {
    alert(`Starting production for ${order.productionOrderId}`);
    // Update order status
    const updatedOrders = orders.map(o => 
      o.id === order.id ? { ...o, status: 'IN_PROGRESS' as const, startDate: new Date().toISOString().split('T')[0] } : o
    );
    setOrders(updatedOrders);
  };

  const stats = {
    total: orders.length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    planned: orders.filter(o => o.status === 'PLANNED').length,
  };

  return (
    <div className="min-h-screen bg-[#FEF9E8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Production Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all production orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border-l-4 border-orange-500">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-blue-500">
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-green-500">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-l-4 border-purple-500">
            <p className="text-xs text-gray-500">Planned</p>
            <p className="text-2xl font-bold text-gray-800">{stats.planned}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order ID or product..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PLANNED">Planned</option>
              <option value="APPROVED">Approved</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition flex items-center gap-2">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Production Orders List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">PO ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.productionOrderId}</td>
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
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-orange-500 transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {order.status === 'PLANNED' && (
                          <button
                            onClick={() => handleStartProduction(order)}
                            className="p-1.5 text-gray-400 hover:text-green-500 transition"
                            title="Start Production"
                          >
                            <Play size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create New Order Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate('/production/planning')}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Factory size={18} />
            Create New Production Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionOrderList;