import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Warehouse, 
  Info, 
  AlertTriangle,
  Layers,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddStorageLocation: React.FC = () => {
  const navigate = useNavigate();
  
  // Form State
  const [formData, setFormData] = useState({
    rackNumber: '',
    storageArea: 'General Storage',
    warehouseName: 'Raw Material Warehouse',
    materialType: 'Raw Material',
    maxCapacity: '',
    unit: 'kg',
    minThreshold: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call (SRS 3.4 Behavior)
    setTimeout(() => {
      console.log('New Storage Location Registered:', formData);
      setIsSubmitting(false);
      navigate('/inventory/warehouse'); // Navigate back to main panel
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Register New Storage</h1>
            <p className="text-slate-500 text-sm font-medium">Add a new rack or bin to the Raw Material Warehouse</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Configuration Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-1 bg-indigo-600"></div> {/* Industrial Accent Bar */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Rack ID */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-indigo-500" /> Rack / Bin Number
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. RM-RACK-502"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                    value={formData.rackNumber}
                    onChange={(e) => setFormData({...formData, rackNumber: e.target.value})}
                  />
                </div>

                {/* Storage Area */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <Layers className="h-3 w-3 mr-1 text-indigo-500" /> Storage Zone
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold text-slate-700"
                    value={formData.storageArea}
                    onChange={(e) => setFormData({...formData, storageArea: e.target.value})}
                  >
                    <option value="General Storage">General Storage</option>
                    <option value="Bulk Metals">Bulk Metals</option>
                    <option value="Chemical Vault">Chemical Vault</option>
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Small Components">Small Components</option>
                  </select>
                </div>

                {/* Warehouse Reference (Locked for this panel) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <Warehouse className="h-3 w-3 mr-1 text-indigo-500" /> Warehouse
                  </label>
                  <input
                    disabled
                    type="text"
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium"
                    value={formData.warehouseName}
                  />
                </div>

                {/* Material Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <Info className="h-3 w-3 mr-1 text-indigo-500" /> Material Class
                  </label>
                  <input
                    disabled
                    type="text"
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium"
                    value={formData.materialType}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Capacity & Alert Settings (SRS 3.2 & 3.4) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" /> Capacity & Alerts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Max Capacity</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Unit of Measure</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="liters">Liters (L)</option>
                  <option value="units">Units (pcs)</option>
                  <option value="meters">Meters (m)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase text-amber-600">Min Threshold</label>
                <input
                  type="number"
                  placeholder="Low stock alert at..."
                  className="w-full px-4 py-3 bg-amber-50/30 border border-amber-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({...formData, minThreshold: e.target.value})}
                />
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-400 italic">
              * The Minimum Threshold triggers an automated request to the Purchase module when stock falls below this level.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Registering...' : 'Save Storage Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStorageLocation;