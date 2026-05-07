import React, { useState, useMemo } from 'react';
import { Search, Plus, Box, ClipboardCheck, History, ArrowDownLeft, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Component Imports
import LocationCard from '../components/warehousecomponents/LocationCard';
import LocationTable from '../components/warehousecomponents/LocationTable';
import LocationDetailsDrawer from '../components/warehousecomponents/LocationDetailDrawer';
import ProductionRequests from '../components/warehousecomponents/ProductionRequests';
import AuditLedger from '../components/warehousecomponents/AuditLedger';

const RawMaterialWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'ledger'>('inventory');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  // --- MOCK DATA ---
  const [locations] = useState([
    { id: 'rm-1', rackNumber: 'R-101', storageArea: 'Metals', materialName: 'Stainless Steel Sheet', materialCode: 'RM-SS-001', batchNumber: 'BAT-9920', totalQuantity: 850, reservedQuantity: 200, minThreshold: 300, unit: 'kg', status: 'occupied' },
    { id: 'rm-2', rackNumber: 'R-102', storageArea: 'Metals', materialName: 'Aluminum Alloy Rod', materialCode: 'RM-AL-005', batchNumber: 'BAT-9921', totalQuantity: 120, reservedQuantity: 0, minThreshold: 150, unit: 'units', status: 'occupied' },
  ]);

  const [requests] = useState([
    { id: 'REQ-0112', productionOrderId: 'PROD-991', materialName: 'Stainless Steel Sheet', qtyRequested: 150, unit: 'kg', priority: 'High', requestDate: '2024-01-18' },
    { id: 'REQ-0115', productionOrderId: 'PROD-995', materialName: 'Industrial Resin', qtyRequested: 50, unit: 'liters', priority: 'Normal', requestDate: '2024-01-19' },
  ]);

  const [ledger] = useState([
    { id: 'L1', timestamp: '2024-01-18 09:15', type: 'INWARD', materialName: 'Stainless Steel Sheet', quantity: 500, reference: 'PUR-7721', user: 'Admin' },
    { id: 'L2', timestamp: '2024-01-18 14:40', type: 'OUTWARD', materialName: 'Aluminum Rod', quantity: 20, reference: 'PROD-991', user: 'Warehouse_Staff_1' },
  ]);

  const filteredInventory = useMemo(() => {
    return locations.filter(loc => 
      loc.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.rackNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, locations]);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Operational Area</span>
          <h1 className="text-4xl font-black text-slate-900 uppercase mt-1 tracking-tight">Raw Materials</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <ArrowDownLeft className="h-4 w-4 mr-2 text-emerald-600" /> STOCK INWARD
          </button>
          <button onClick={() => navigate('/inventory/warehouse/add')} className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-indigo-600 transition shadow-xl">
            <Plus className="h-4 w-4 mr-2" /> REGISTER RACK
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit mb-8">
        {[
          { id: 'inventory', label: 'Live Stock', icon: Box },
          { id: 'requests', label: 'Prod Requests', icon: ClipboardCheck },
          { id: 'ledger', label: 'Audit Ledger', icon: History }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center px-6 py-2.5 rounded-lg text-xs font-black uppercase transition ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
            <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT RENDERING */}
      {activeTab === 'inventory' && (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" placeholder="Search inventory..." 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}><Grid className="h-5 w-5" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}><List className="h-5 w-5" /></button>
            </div>
          </div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredInventory.map(loc => ( <LocationCard key={loc.id} location={loc} onViewDetails={(loc) => setSelectedLocation(loc)} /> ))}
            </div>
          ) : (
            <LocationTable locations={filteredInventory} onViewDetails={(loc) => setSelectedLocation(loc)} />
          )}
        </>
      )}

      {activeTab === 'requests' && <ProductionRequests requests={requests} />}
      {activeTab === 'ledger' && <AuditLedger ledgerData={ledger} />}

      <LocationDetailsDrawer location={selectedLocation} onClose={() => setSelectedLocation(null)} />
    </div>
  );
};

export default RawMaterialWarehouse;