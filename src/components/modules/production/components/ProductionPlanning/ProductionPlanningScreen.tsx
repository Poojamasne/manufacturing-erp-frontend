import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Package,  
  Factory,
  AlertTriangle,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

interface SalesOrder {
  id: string;
  productName: string;
  quantity: number;
  deliveryDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface BOMItem {
  materialId: string;
  materialName: string;
  quantityPerUnit: number;
  unit: string;
  totalRequired: number;
}

interface InventoryItem {
  materialId: string;
  materialName: string;
  availableQuantity: number;
  requiredQuantity: number;
  unit: string;
  shortage: number;
}

const ProductionPlanningScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showPurchaseRequest, setShowPurchaseRequest] = useState(false);

  // Mock Sales Orders from Sales Module
  const salesOrders: SalesOrder[] = [
    { 
      id: 'SO-001', 
      productName: 'Industrial Bolt M12', 
      quantity: 5000, 
      deliveryDate: '2024-05-20',
      customerName: 'ABC Industries',
      customerEmail: 'contact@abc.com',
      customerPhone: '+91 98765 43210',
      priority: 'HIGH'
    },
    { 
      id: 'SO-002', 
      productName: 'Aluminum Frame 4x4', 
      quantity: 250, 
      deliveryDate: '2024-05-18',
      customerName: 'XYZ Corp',
      customerEmail: 'sales@xyz.com',
      customerPhone: '+91 87654 32109',
      priority: 'HIGH'
    },
    { 
      id: 'SO-003', 
      productName: 'Plastic Container L', 
      quantity: 1000, 
      deliveryDate: '2024-05-22',
      customerName: 'PQR Ltd',
      customerEmail: 'info@pqr.com',
      customerPhone: '+91 76543 21098',
      priority: 'MEDIUM'
    },
  ];

  // BOM Data
  const bomDatabase: { [key: string]: BOMItem[] } = {
    'Industrial Bolt M12': [
      { materialId: 'RM001', materialName: 'Steel Rod 12mm', quantityPerUnit: 1.2, unit: 'kg', totalRequired: 0 },
      { materialId: 'RM002', materialName: 'Zinc Coating', quantityPerUnit: 0.05, unit: 'kg', totalRequired: 0 },
      { materialId: 'RM003', materialName: 'Thread Oil', quantityPerUnit: 0.01, unit: 'liter', totalRequired: 0 },
    ],
    'Aluminum Frame 4x4': [
      { materialId: 'RM004', materialName: 'Aluminum Sheet', quantityPerUnit: 2.5, unit: 'kg', totalRequired: 0 },
      { materialId: 'RM005', materialName: 'Screws Set', quantityPerUnit: 8, unit: 'pcs', totalRequired: 0 },
      { materialId: 'RM006', materialName: 'Corner Brackets', quantityPerUnit: 4, unit: 'pcs', totalRequired: 0 },
    ],
    'Plastic Container L': [
      { materialId: 'RM007', materialName: 'Plastic Resin', quantityPerUnit: 1.8, unit: 'kg', totalRequired: 0 },
      { materialId: 'RM008', materialName: 'Color Masterbatch', quantityPerUnit: 0.1, unit: 'kg', totalRequired: 0 },
    ],
  };

  // Inventory Data
  const inventoryDatabase: { [key: string]: { available: number, unit: string } } = {
    'RM001': { available: 4500, unit: 'kg' },
    'RM002': { available: 300, unit: 'kg' },
    'RM003': { available: 80, unit: 'liter' },
    'RM004': { available: 400, unit: 'kg' },
    'RM005': { available: 1500, unit: 'pcs' },
    'RM006': { available: 800, unit: 'pcs' },
    'RM007': { available: 1200, unit: 'kg' },
    'RM008': { available: 150, unit: 'kg' },
  };

  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handlePlanProduction = (order: SalesOrder) => {
    setSelectedOrder(order);
    setCurrentStep(1);
    
    // Calculate BOM requirements
    const bom = bomDatabase[order.productName] || [];
    const calculatedBom = bom.map(item => ({
      ...item,
      totalRequired: item.quantityPerUnit * order.quantity
    }));
    setBomItems(calculatedBom);
    
    // Check inventory
    const inventoryCheck = calculatedBom.map(bomItem => {
      const inventory = inventoryDatabase[bomItem.materialId] || { available: 0, unit: bomItem.unit };
      const shortage = Math.max(0, bomItem.totalRequired - inventory.available);
      return {
        materialId: bomItem.materialId,
        materialName: bomItem.materialName,
        availableQuantity: inventory.available,
        requiredQuantity: bomItem.totalRequired,
        unit: inventory.unit,
        shortage: shortage
      };
    });
    setInventoryItems(inventoryCheck);
  };

  const hasMaterialShortage = () => {
    return inventoryItems.some(item => item.shortage > 0);
  };

  const handleCreateProductionOrder = () => {
    const productionOrderId = `PO-${Date.now()}`;
    alert(`Production Order ${productionOrderId} created successfully!\n\nProduct: ${selectedOrder?.productName}\nQuantity: ${selectedOrder?.quantity}\nDeadline: ${selectedOrder?.deliveryDate}`);
    setSelectedOrder(null);
    setCurrentStep(1);
    navigate('/production/orders');
  };

  const handleCreatePurchaseRequest = () => {
    const shortageItems = inventoryItems.filter(item => item.shortage > 0);
    alert(`Purchase Request Created!\n\nMaterials to purchase:\n${shortageItems.map(item => `- ${item.materialName}: ${item.shortage} ${item.unit}`).join('\n')}\n\nPriority: ${selectedOrder?.priority}`);
    setShowPurchaseRequest(false);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700';
      case 'LOW': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF9E8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Production Planning
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan production from confirmed sales orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by order ID, product or customer..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Sales Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Confirmed Sales Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Select an order to start production planning</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.deliveryDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePlanProduction(order)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition flex items-center gap-2"
                      >
                        <Factory size={16} />
                        Plan Production
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Planning Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Production Planning Wizard</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedOrder.productName}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setCurrentStep(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Steps */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex">
                  {[
                    { step: 1, title: 'Order Details', icon: Package },
                    { step: 2, title: 'BOM Check', icon: Factory },
                    { step: 3, title: 'Inventory Check', icon: ShoppingCart },
                  ].map((item) => (
                    <div key={item.step} className="flex-1 relative">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          currentStep >= item.step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          <item.icon size={18} />
                        </div>
                        {item.step < 3 && (
                          <div className={`flex-1 h-0.5 mx-2 transition-all ${
                            currentStep > item.step ? 'bg-orange-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                {/* Step 1: Order Details */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Order Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-xs text-gray-500 uppercase">Order ID</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.id}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-xs text-gray-500 uppercase">Product</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.productName}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-xs text-gray-500 uppercase">Quantity Required</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.quantity.toLocaleString()} units</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-xs text-gray-500 uppercase">Delivery Date</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.deliveryDate}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-xs text-gray-500 uppercase">Customer Name</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <label className="text-xs text-gray-500 uppercase">Contact</label>
                        <p className="font-semibold text-gray-900">{selectedOrder.customerPhone}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">✓ Ready to check BOM. Click Next to view Bill of Materials.</p>
                    </div>
                  </div>
                )}

                {/* Step 2: BOM Check */}
                {currentStep === 2 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Bill of Materials (BOM)</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty/Unit</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bomItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm">{item.materialName}</td>
                              <td className="px-4 py-3 text-sm">{item.quantityPerUnit}</td>
                              <td className="px-4 py-3 text-sm">{item.unit}</td>
                              <td className="px-4 py-3 text-sm font-semibold">{item.totalRequired.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm text-green-800">✓ BOM fetched successfully. Click Next to check inventory availability.</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Inventory Check */}
                {currentStep === 3 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">Inventory Availability Check</h3>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {inventoryItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-sm">{item.materialName}</td>
                              <td className="px-4 py-3 text-sm">{item.requiredQuantity.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm">{item.availableQuantity}</td>
                              <td className="px-4 py-3 text-sm">{item.unit}</td>
                              <td className="px-4 py-3">
                                {item.shortage === 0 ? (
                                  <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                    <CheckCircle size={14} /> Available
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                                    <AlertCircle size={14} /> Shortage: {item.shortage.toFixed(2)} {item.unit}
                                  </span>
                                )}
                              </td>
                             </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>
                    
                    {hasMaterialShortage() && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="text-yellow-600 mt-0.5" size={18} />
                          <div>
                            <p className="text-sm font-semibold text-yellow-800">Material Shortage Detected</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Some materials are insufficient. A purchase request will be created.
                            </p>
                            <button
                              onClick={() => setShowPurchaseRequest(true)}
                              className="mt-3 px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition"
                            >
                              Create Purchase Request
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className={`px-6 py-2 rounded-xl transition ${
                    currentStep > 1 ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'invisible'
                  }`}
                >
                  Previous
                </button>
                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition flex items-center gap-2"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleCreateProductionOrder}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Create Production Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Purchase Request Modal */}
        {showPurchaseRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Create Purchase Request</h3>
              <div className="space-y-3 mb-6">
                {inventoryItems.filter(i => i.shortage > 0).map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-800">{item.materialName}</p>
                    <p className="text-sm text-gray-600">Required: {item.shortage.toFixed(2)} {item.unit}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseRequest(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePurchaseRequest}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                >
                  Create Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionPlanningScreen;