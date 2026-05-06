import React from "react";
import { useInventoryStore } from "../hooks/useInventoryStore";
import { 
  Package, 
  AlertTriangle, 
  ClipboardList, 
  Bell,
  CheckCircle,
  XCircle,
  Loader 
} from "lucide-react";

export const InventoryDashboard: React.FC = () => {
  const { 
    summary, 
    lowStockMaterials, 
    pendingRequests, 
    unreadNotifications,
    dashboardAlerts,
    isLoading,
    actions ,
      recentReceipts,

  } = useInventoryStore();

  if (isLoading && summary.totalMaterials === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
        <button
          onClick={() => actions.refresh()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Materials</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalMaterials}</p>
            </div>
            <Package className="h-10 w-10 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pendingRequestsCount}</p>
            </div>
            <ClipboardList className="h-10 w-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">{summary.lowStockCount}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Notifications</p>
              <p className="text-2xl font-bold text-blue-600">{summary.unreadNotifications}</p>
            </div>
            <Bell className="h-10 w-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      {dashboardAlerts.totalAlerts > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Inventory Alerts</p>
              <div className="flex gap-4 mt-1 text-sm">
                <span className="text-red-600">{dashboardAlerts.criticalAlerts} Critical</span>
                <span className="text-orange-600">{dashboardAlerts.warningAlerts} Warnings</span>
                <span className="text-yellow-600">{dashboardAlerts.pendingActions} Ready to Issue</span>
                <span className="text-red-600">{dashboardAlerts.shortages} Shortages</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Materials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Low Stock Materials
            </h2>
          </div>
          <div className="p-6">
            {lowStockMaterials.length === 0 ? (
              <p className="text-green-600 text-center">✓ All materials are at healthy levels</p>
            ) : (
              <div className="space-y-3">
                {lowStockMaterials.map((material) => (
                  <div key={material.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{material.name}</p>
                      <p className="text-sm text-gray-600">Code: {material.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-semibold">
                        {material.currentStock} {material.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {material.minStockLevel} | Short: {material.shortageAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <ClipboardList className="h-5 w-5 text-yellow-500 mr-2" />
              Pending Material Requests
            </h2>
          </div>
          <div className="p-6">
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center">No pending requests</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{request.materialName}</p>
                      <p className="text-sm text-gray-600">Order: {request.productionOrderId}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {request.availableStock} | Required: {request.quantityRequired}
                      </p>
                    </div>
                    <div className="text-right">
                      {request.isAvailable ? (
                        <span className="inline-flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          <CheckCircle className="h-3 w-3 mr-1" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          <XCircle className="h-3 w-3 mr-1" /> Shortage
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Recent Receipts</h2>
          </div>
          <div className="p-6">
            {recentReceipts.length === 0 ? (
              <p className="text-gray-500 text-center">No recent receipts</p>
            ) : (
              <div className="space-y-3">
                {recentReceipts.slice(0, 5).map((receipt) => (
                  <div key={receipt.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{receipt.materialName}</p>
                      <p className="text-sm text-gray-600">Supplier: {receipt.supplierName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-semibold">+{receipt.quantityReceived}</p>
                      <p className="text-xs text-gray-500">{new Date(receipt.receivedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Bell className="h-5 w-5 text-blue-500 mr-2" />
              Recent Notifications
            </h2>
          </div>
          <div className="p-6">
            {unreadNotifications.length === 0 ? (
              <p className="text-gray-500 text-center">No unread notifications</p>
            ) : (
              <div className="space-y-3">
                {unreadNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-gray-800">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};