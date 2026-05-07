import React, { useState } from 'react';
import { 
  CheckCircle, 
   Printer, 
  Send, 
  Eye,
  Package,
  Truck,
  CheckSquare
} from 'lucide-react';

const MaterialIssueExecution: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);

  // Mock data for approved/pending requests
  const approvedRequests = [
    {
      id: 'REQ-001',
      productionOrderId: 'PO-1001',
      materialName: 'Steel Sheet',
      materialCode: 'RAW001',
      quantityRequired: 150,
      unit: 'kg',
      requestedDate: '2024-01-15',
      approvedDate: '2024-01-15',
      status: 'APPROVED',
      batchNumber: 'BATCH-001',
      warehouseLocation: 'Main Warehouse - Rack A-01'
    },
    {
      id: 'REQ-002',
      productionOrderId: 'PO-1002',
      materialName: 'Aluminum Rod',
      materialCode: 'RAW002',
      quantityRequired: 200,
      unit: 'kg',
      requestedDate: '2024-01-14',
      approvedDate: '2024-01-14',
      status: 'APPROVED',
      batchNumber: 'BATCH-002',
      warehouseLocation: 'Main Warehouse - Rack A-02'
    },
    {
      id: 'REQ-003',
      productionOrderId: 'PO-1003',
      materialName: 'Copper Wire',
      materialCode: 'RAW003',
      quantityRequired: 500,
      unit: 'm',
      requestedDate: '2024-01-13',
      approvedDate: '2024-01-13',
      status: 'ISSUED',
      batchNumber: 'BATCH-003',
      warehouseLocation: 'Secondary Warehouse - Rack C-01'
    },
    {
      id: 'REQ-004',
      productionOrderId: 'PO-1004',
      materialName: 'Plastic Granules',
      materialCode: 'RAW004',
      quantityRequired: 100,
      unit: 'kg',
      requestedDate: '2024-01-12',
      approvedDate: '2024-01-12',
      status: 'DELIVERED',
      batchNumber: 'BATCH-004',
      warehouseLocation: 'Raw Material Warehouse - Rack D-01'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Approved', icon: CheckCircle };
      case 'ISSUED':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Issued', icon: Package };
      case 'DELIVERED':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered', icon: CheckSquare };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: Package };
    }
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Material Issue Execution</h1>
        <p className="text-gray-600 mt-1">Process approved material requests and dispatch to production</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Approved to Issue</p>
          <p className="text-2xl font-bold text-gray-800">2</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Issued (Pending Delivery)</p>
          <p className="text-2xl font-bold text-gray-800">1</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Delivered Today</p>
          <p className="text-2xl font-bold text-gray-800">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-gray-800">24</p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Approved Material Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Production Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {approvedRequests.map((request) => {
                const status = getStatusBadge(request.status);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium">{request.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{request.productionOrderId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.materialName}</div>
                      <div className="text-xs text-gray-500">{request.materialCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm">{request.quantityRequired} {request.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        {/* <MapPin className="h-3 w-3 mr-1 text-gray-400" /> */}
                        {request.warehouseLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status.bg} ${status.text}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {request.status === 'APPROVED' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowIssueModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Issue
                          </button>
                        )}
                        {request.status === 'ISSUED' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowAcknowledgment(true);
                            }}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                          >
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Confirm Delivery
                          </button>
                        )}
                        <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50 flex items-center">
                          <Printer className="h-3 w-3 mr-1" />
                          Print
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50">
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Issue Material</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Request ID</label>
                  <p className="font-mono text-sm">{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Production Order</label>
                  <p className="font-medium">{selectedRequest.productionOrderId}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Material</label>
                  <p className="font-medium">{selectedRequest.materialName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Quantity to Issue</label>
                  <p className="font-medium">{selectedRequest.quantityRequired} {selectedRequest.unit}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Batch Number</label>
                  <p className="font-mono text-sm">{selectedRequest.batchNumber}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Issue Slip ID</label>
                  <p className="font-mono text-sm text-indigo-600">IS-{Date.now()}</p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please verify the quantity and batch number before issuing. This action will reduce stock levels.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  alert('Material issued successfully!');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Generate Issue Slip & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Acknowledgment Modal */}
      {showAcknowledgment && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Confirm Delivery</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center py-4">
                <Truck className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Has production confirmed receipt of materials?</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Received By</label>
                  <input
                    type="text"
                    placeholder="Production team member name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Delivery Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Any issues or comments..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowAcknowledgment(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAcknowledgment(false);
                  alert('Delivery confirmed! Stock updated.');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIssueExecution;