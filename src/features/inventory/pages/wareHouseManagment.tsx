import React, { useState } from 'react';
import { 
  MapPin, 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2,
  Grid,
  List,
  CheckCircle,
  XCircle,
  AlertCircle,
  Warehouse,
  MoreVertical
} from 'lucide-react';

const WarehouseManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for UI
  const warehouses = [
    { id: 'wh1', name: 'Main Warehouse', location: 'Building A, Floor 1', totalRacks: 24, occupiedRacks: 18, utilization: 75 },
    { id: 'wh2', name: 'Secondary Warehouse', location: 'Building B, Floor 2', totalRacks: 16, occupiedRacks: 9, utilization: 56 },
    { id: 'wh3', name: 'Raw Material Warehouse', location: 'Building C, Ground Floor', totalRacks: 32, occupiedRacks: 28, utilization: 88 },
  ];

  const locations = [
    { id: 'loc1', warehouseName: 'Main Warehouse', rackNumber: 'A-01', storageArea: 'Raw Materials', materialName: 'Steel Sheet', materialCode: 'RAW001', batchNumber: 'BATCH-001', quantity: 500, unit: 'kg', status: 'occupied', lastUpdated: '2024-01-15' },
    { id: 'loc2', warehouseName: 'Main Warehouse', rackNumber: 'A-02', storageArea: 'Raw Materials', materialName: 'Aluminum Rod', materialCode: 'RAW002', batchNumber: 'BATCH-002', quantity: 200, unit: 'kg', status: 'occupied', lastUpdated: '2024-01-14' },
    { id: 'loc3', warehouseName: 'Main Warehouse', rackNumber: 'A-03', storageArea: 'Raw Materials', materialName: null, materialCode: null, batchNumber: null, quantity: null, unit: null, status: 'empty', lastUpdated: null },
    { id: 'loc4', warehouseName: 'Main Warehouse', rackNumber: 'B-01', storageArea: 'Finished Goods', materialName: 'Finished Product A', materialCode: 'FIN001', batchNumber: 'BATCH-045', quantity: 1000, unit: 'pcs', status: 'occupied', lastUpdated: '2024-01-13' },
    { id: 'loc5', warehouseName: 'Secondary Warehouse', rackNumber: 'C-01', storageArea: 'Bulk Storage', materialName: 'Copper Wire', materialCode: 'RAW003', batchNumber: 'BATCH-003', quantity: 3000, unit: 'm', status: 'occupied', lastUpdated: '2024-01-12' },
    { id: 'loc6', warehouseName: 'Secondary Warehouse', rackNumber: 'C-02', storageArea: 'Bulk Storage', materialName: null, materialCode: null, batchNumber: null, quantity: null, unit: null, status: 'empty', lastUpdated: null },
    { id: 'loc7', warehouseName: 'Raw Material Warehouse', rackNumber: 'D-01', storageArea: 'Chemicals', materialName: 'Plastic Granules', materialCode: 'RAW004', batchNumber: 'BATCH-004', quantity: 150, unit: 'kg', status: 'occupied', lastUpdated: '2024-01-11' },
    { id: 'loc8', warehouseName: 'Raw Material Warehouse', rackNumber: 'D-02', storageArea: 'Chemicals', materialName: null, materialCode: null, batchNumber: null, quantity: null, unit: null, status: 'maintenance', lastUpdated: null },
  ];

  const filteredLocations = locations.filter(loc => {
    const matchesWarehouse = selectedWarehouse === 'all' || loc.warehouseName === selectedWarehouse;
    const matchesSearch = searchTerm === '' || 
      (loc.materialName && loc.materialName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (loc.materialCode && loc.materialCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      loc.rackNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesWarehouse && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'occupied':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Occupied', icon: CheckCircle };
      case 'empty':
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Empty', icon: XCircle };
      case 'maintenance':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Under Maintenance', icon: AlertCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Unknown', icon: XCircle };
    }
  };

  return (
<div className="p-6 bg-[#f4f7f6] min-h-screen">      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Warehouse Management</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Manage storage locations and material assignments</p>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {warehouses.map(warehouse => (
          <div key={warehouse.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Warehouse className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{warehouse.name}</h3>
                  <p className="text-xs text-gray-500">{warehouse.location}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Racks</span>
                <span className="font-medium">{warehouse.totalRacks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Occupied Racks</span>
                <span className="font-medium text-green-600">{warehouse.occupiedRacks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Empty Racks</span>
                <span className="font-medium text-gray-600">{warehouse.totalRacks - warehouse.occupiedRacks}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Utilization</span>
                  <span className="font-medium">{warehouse.utilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${warehouse.utilization > 80 ? 'bg-red-500' : warehouse.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${warehouse.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by material, code, or rack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Warehouse Filter */}
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.name}>{wh.name}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add Location Button */}
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </button>
        </div>
      </div>

      {/* Locations Display */}
      {viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLocations.map(location => {
            const status = getStatusBadge(location.status);
            const StatusIcon = status.icon;
            
            return (
              <div key={location.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-semibold text-gray-800">{location.rackNumber}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status.bg} ${status.text}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </span>
                </div>

                {/* Location Info */}
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-500">{location.warehouseName} - {location.storageArea}</p>
                  {location.materialName ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{location.materialName}</p>
                        <p className="text-xs text-gray-500">Code: {location.materialCode}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{location.quantity} {location.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Batch:</span>
                        <span className="text-xs font-mono">{location.batchNumber}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Last updated:</span>
                        <span>{location.lastUpdated}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Empty Location</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {location.materialName && (
                  <div className="flex space-x-2 pt-3 border-t border-gray-100">
                    <button className="flex-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                      <Edit2 className="h-3 w-3 inline mr-1" />
                      Move
                    </button>
                    <button className="flex-1 px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">
                      <Trash2 className="h-3 w-3 inline mr-1" />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rack Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLocations.map(location => {
                  const status = getStatusBadge(location.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium">{location.rackNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{location.warehouseName}</div>
                        <div className="text-xs text-gray-500">{location.storageArea}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{location.storageArea}</span>
                      </td>
                      <td className="px-6 py-4">
                        {location.materialName ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{location.materialName}</div>
                            <div className="text-xs text-gray-500">{location.materialCode}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Empty</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {location.quantity ? (
                          <span className="text-sm">{location.quantity} {location.unit}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status.bg} ${status.text}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {location.materialName && (
                            <>
                              <button className="text-blue-600 hover:text-blue-800">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No locations found matching your criteria</p>
        </div>
      )}


    </div>
  );
};

export default WarehouseManagement;