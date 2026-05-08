import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save, MapPin,  Warehouse,
  ChevronRight,
  Package,
 
} from "lucide-react";

// Redux
import { useAppSelector, useAppDispatch } from "../../common/ReduxMainHooks";
import { getStorageAllocation, editStorageAllocation } from "../ModuleStateFiles/WarehouseSlice";
import { type RootState } from "../../../app/store/store";

const EditMaterialStorageAllocation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux State
  const { allocation, loading } = useAppSelector(
    (state: RootState) => state.inventoryWarehouse
  );

  const [formData, setFormData] = useState({
    receipt_id: '',
    material_name: '',
    material_code: '',
    batch_number: '',
    warehouse_name: '',
    rack_number: '',
    storage_area: '',
    quantity: 0,
    measure_unit: '',
    notes: '',
    allocated_at:""
  });

  const [errors, setErrors] = useState<any>({});

  // 1. Fetch the existing allocation on mount
  useEffect(() => {
    if (id) {
      dispatch(getStorageAllocation(id));
    }
  }, [id, dispatch]);

  // 2. Sync Redux state to local form
  useEffect(() => {
    if (allocation) {
      setFormData({
        receipt_id: allocation.receipt_id || '',
        material_name: allocation.material_name || '',
        material_code: allocation.material_code || '',
        batch_number: allocation.batch_number || '',
        warehouse_name: allocation.warehouse_name || '',
        rack_number: allocation.rack_number || '',
        storage_area: allocation.storage_area || '',
        quantity: allocation.quantity || 0,
        measure_unit: allocation.measure_unit || '',
        notes: allocation.notes || '',
        allocated_at: allocation.allocated_at || '',
      });
    }
  }, [allocation]);

  const validate = () => {
    let tempErrors: any = {};
    if (!formData.warehouse_name) tempErrors.warehouse_name = "Select target warehouse";
    if (!formData.rack_number) tempErrors.rack_number = "Rack / Bin number is required";
    if (!formData.storage_area) tempErrors.storage_area = "Storage area is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    dispatch(editStorageAllocation(id, formData, navigate));
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">Scanning Warehouse Logs...</div>;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">

        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <button onClick={() => navigate("/inventory/warehouse")} className="hover:text-[#F59E0B] transition-colors font-medium">Warehouse</button>
              <ChevronRight size={14} />
              <span className="text-gray-800 font-bold">Edit Allocation</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase">Update Storage Slot</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium font-mono tracking-tighter">
               REALLOCATING BATCH: {formData.batch_number}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/inventory/warehouse")}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#F59E0B] shadow-lg shadow-amber-500/10 hover:bg-[#f67317] transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Update Allocation
            </button>
          </div>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6">

          {/* Section 1: Material Reference (Read-Only) */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm opacity-90">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl"><Package size={20} /></div>
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">Material Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Material Name</label>
                <div className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600">{formData.material_name}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Batch Number</label>
                <div className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono font-bold text-slate-600">{formData.batch_number}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Stock</label>
                <div className="px-4 py-4 bg-amber-50 border border-amber-100 rounded-xl text-sm font-black text-amber-700">
                    {formData.quantity.toLocaleString()} {formData.measure_unit}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Destination Setup (Manual Entry) */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-50 shadow-sm"><Warehouse size={20} /></div>
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">Modify Location Assignment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Warehouse Name</label>
                <select
                  className={`w-full bg-slate-50 border ${errors.warehouse_name ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all`}
                  value={formData.warehouse_name}
                  onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })}
                >
                  <option value="">Select Warehouse...</option>
                  <option value="Main Warehouse">Main Warehouse (A1)</option>
                  <option value="Bulk Storage">Bulk Storage (B2)</option>
                  <option value="Cold Storage">Cold Storage (C1)</option>
                </select>
                {errors.warehouse_name && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.warehouse_name}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Rack / Bin Number</label>
                <div className="relative group">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required type="text" placeholder="e.g. RK-05"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border ${errors.rack_number ? 'border-rose-400' : 'border-slate-200'} rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all`}
                    value={formData.rack_number}
                    onChange={(e) => setFormData({ ...formData, rack_number: e.target.value })}
                  />
                </div>
                {errors.rack_number && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.rack_number}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Storage Area Zone</label>
                <select
                  className={`w-full bg-slate-50 border ${errors.storage_area ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all`}
                  value={formData.storage_area}
                  onChange={(e) => setFormData({ ...formData, storage_area: e.target.value })}
                >
                  <option value="">Select Area...</option>
                  <option value="Metals Zone">Metals Zone</option>
                  <option value="Chemical Vault">Chemical Vault</option>
                  <option value="Bulk Area">Bulk Area</option>
                  <option value="General Store">General Store</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Internal Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#F59E0B] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all resize-none font-medium text-slate-800"
                  placeholder="Movement reason or condition notes..."
                />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaterialStorageAllocation;