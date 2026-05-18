import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save, MapPin,
  Info, Warehouse,
  ChevronRight
} from "lucide-react";
import { useAppSelector } from "../../common/ReduxMainHooks";
import { type RootState } from "../../../app/store/store";
import { createStorageAllocation } from "../ModuleStateFiles/WarehouseSlice";
import { useAppDispatch } from "../../../app/store/hook";

const AllocateMaterialStorage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const dispatch = useAppDispatch();
  // Get Receipts from your actual Redux Slice
  const { receipts } = useAppSelector((state: RootState) => state.inventoryMaterialReceipt);

  const [formData, setFormData] = useState({
    receipt_id: '',
    material_name: '',
    material_code: '',
    batch_number: '',
    warehouse_name: '',
    rack_number: '',
    storage_area: '',
    quantity: '',
    measure_unit: '',
    notes: "",
    allocated_at: new Date().toISOString().split('T')[0],
  });

  // Validation Logic
  const validate = () => {
    let tempErrors: any = {};
    if (!formData.receipt_id) tempErrors.receipt_id = "Please select a valid receipt entry";
    if (!formData.warehouse_name) tempErrors.warehouse_name = "Select target warehouse";
    if (!formData.rack_number) tempErrors.rack_number = "Rack / Bin number is required";
    if (!formData.storage_area) tempErrors.storage_area = "Storage area is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle Selection from Receipt Entry
  const handleReceiptSelect = (id: string) => {
    const selected = receipts.find(r => r.id.toString() === id);
    if (selected) {
      setFormData({
        ...formData,
        receipt_id: selected.id.toString(),
        material_name: selected.material_name,
        material_code: selected.material_code,
        batch_number: selected.batch_number,
        quantity: selected.quantity_received.toString(),
        measure_unit: selected.measure_unit,
      });
      setErrors({ ...errors, receipt_id: "" });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    dispatch(createStorageAllocation(formData, navigate))
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <button
                  onClick={() => navigate("/inventory/warehouse")}
                  className="hover:text-[#F59E0B] transition-colors font-medium">Warehouse</button>
                <ChevronRight size={14} />
                <span className="text-gray-800 font-bold">Allocate Storage</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Allocate Storage</h1>
              <p className="text-sm text-gray-500 font-medium">Map incoming receipt data to physical warehouse location</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/inventory/warehouse")}
              className="w-full md:w-auto px-4 py-2 rounded-xl font-bold text-sm  text-slate-700 hover:text-[#f67317] border border-amber-500 transition-all flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full md:w-auto px-4 py-2 rounded-xl font-bold text-sm text-white bg-[#F59E0B] shadow-lg shadow-amber-500/10 hover:bg-[#f67317] transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> {isSubmitting ? 'Allocating...' : 'Complete Allocation'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Section 1: Source Selection (SRS Integration) */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-[#f3f4e6] text-[#F59E0B] rounded-xl border border-[#f3f4e6] shadow-sm"><Info size={20} /></div>
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">Step 1: Select Receipt</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Source Receipt Entry</label>
                <div className="relative group">
                  <select
                    required
                    className={`w-full bg-slate-50 border ${errors.receipt_id ? 'border-rose-400 ring-2 ring-rose-50' : 'border-slate-200'} rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-[#F59E0B] transition-all`}
                    value={formData.receipt_id}
                    onChange={(e) => handleReceiptSelect(e.target.value)}
                  >
                    <option value="">Select an inward entry...</option>
                    {receipts.map(r => (
                      <option key={r.id} value={r.id}>{r.receipt_id} | {r.material_name} ({r.batch_number})</option>
                    ))}
                  </select>
                  {errors.receipt_id && <p className="text-[10px] text-rose-500 font-bold mt-1 px-1">{errors.receipt_id}</p>}
                </div>
              </div>

              {/* Auto-populated Material Info */}
              <div className="grid grid-cols-2 gap-4 items-start">

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                    Material Name
                  </label>

                  <div className="px-4 py-4 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 truncate">
                    {formData.material_name || '---'}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                    Batch Number
                  </label>

                  <div className="px-4 py-4 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 border border-slate-200">
                    {formData.batch_number || '---'}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                    Internal Notes
                  </label>

                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:border-[#F59E0B] transition-all"
                    placeholder="condition notes..."
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Section 2: Destination Setup (Manual Entry) */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-50 shadow-sm"><Warehouse size={20} /></div>
              <h3 className="font-bold text-xl text-slate-800 tracking-tight">Step 2: Location Assignment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Warehouse Name</label>
                <select
                  className={`w-full bg-slate-50 border ${errors.warehouse_name ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-4 py-4 text-sm font-bold outline-none`}
                  value={formData.warehouse_name}
                  onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })}
                >
                  <option value="">Select Warehouse...</option>
                  <option value="Main Warehouse">Main Warehouse (A1)</option>
                  <option value="Bulk Storage">Bulk Storage (B2)</option>
                  <option value="Raw Materials">Raw Materials (R1)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Rack / Bin Number</label>
                <div className="relative group">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required type="text" placeholder="e.g. RK-05 / B-12"
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border ${errors.rack_number ? 'border-rose-400' : 'border-slate-200'} rounded-xl text-sm font-bold outline-none focus:border-[#F59E0B]`}
                    value={formData.rack_number}
                    onChange={(e) => setFormData({ ...formData, rack_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Storage Area Zone</label>
                <select
                  className={`w-full bg-slate-50 border ${errors.storage_area ? 'border-rose-400' : 'border-slate-200'} rounded-xl px-4 py-4 text-sm font-bold outline-none`}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllocateMaterialStorage;