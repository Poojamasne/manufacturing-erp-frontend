import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Package,
  ClipboardList,
  Database,
  CheckCircle2,
  Building2,
  Calendar,
  ArrowRight,
  Info,
  Search,
  Hash
} from "lucide-react";

// Import Redux Actions and Types
import { createPurchaseRequest } from "../../ModuleStateFiles/PurchaseRequestManagementSlice";
import type { RootState } from "../../../../app/store/store"; // Adjust path
import { useAppDispatch } from "../../../../app/store/hook";
import { useAppSelector } from "../../../common/ReduxMainHooks";

// ==================== Types & Mock Data ====================
interface MaterialMaster {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
}

const mockMaterials: MaterialMaster[] = [
  { id: "1", code: "HDW-B-M12", name: "Industrial Bolt M12", category: "Hardware", unit: "pcs" },
  { id: "2", code: "AL-F-44", name: "Aluminum Frame 4x4", category: "Raw Material", unit: "units" },
  { id: "3", code: "CHEM-HF-01", name: "Hydraulic Fluid", category: "Chemicals", unit: "Ltrs" },
  { id: "4", code: "STL-PL-06", name: "Steel Plate 6mm", category: "Raw Material", unit: "kg" },
];

const CreatePurchaseRequest: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get loading state from Redux
  const { loading } = useAppSelector((state: RootState) => state.purchaseRequests);

  const [currentStep, setCurrentStep] = useState(1);

  // Updated Form State to align with Slice Keys (SRS 3.3.1)
  const [formData, setFormData] = useState({
    material_name: "",
    material_code: "",
    unit: "",
    quantity: 0,
    required_date: "",
    department: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    requested_by: "Current User", // Mocked user session
  });

  const steps = [
    { id: 1, title: "Material" },
    { id: 2, title: "Details" },
    { id: 3, title: "Priority" },
    { id: 4, title: "Finalize" },
  ];

  const handleFinalAction = async () => {
    // Dispatching the Redux Thunk instead of local timeout
    dispatch(createPurchaseRequest(formData, navigate));
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <button onClick={() => navigate("/purchase/purchase-requests")} className="hover:text-[#F59E0B] transition-colors font-medium">
            Purchase Management
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold">New PR</span>
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Raise Request</h1>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-3 ${currentStep >= step.id ? "cursor-pointer" : "cursor-not-allowed"}`}
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep >= step.id ? "bg-[#F59E0B] text-white shadow-lg shadow-orange-200" : "bg-slate-100 text-slate-400"
                  }`}>
                  {step.id}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${currentStep >= step.id ? "text-slate-800" : "text-slate-400"}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && <div className="h-px bg-slate-100 flex-1 mx-4" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Select Material */}
        {currentStep === 1 && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-8 py-4 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700">
                Select Material
              </h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-300" size={16} />
                <input type="text" placeholder="Search code..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-amber-500/20" />
              </div>
            </div>
            <div className="px-8 py-4 grid grid-cols-1 md:grid-cols-4 gap-6">
              {mockMaterials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setFormData({ ...formData, material_name: m.name, material_code: m.code, unit: m.unit });
                    setCurrentStep(2);
                  }}
                  className="group text-left p-6 border border-slate-300 rounded-4xl hover:border-[#F59E0B] hover:bg-orange-50/20 transition-all relative overflow-hidden"
                >
                  <span className="text-[13px] font-black text-[#F59E0B] uppercase tracking-[0.2em]">{m.code}</span>
                  <h4 className="text-xl font-bold text-slate-800 mt-1">{m.name}</h4>
                  <p className="text-sm text-slate-500">{m.category}</p>
                  <div className="flex justify-between items-center border-t border-slate-50">
                    <span className="text-sm font-bold text-slate-400 italic">UOM: {m.unit}</span>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-[#F59E0B] transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Request Details */}
        {currentStep === 2 && formData.material_name && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-8">
              <div className="p-3 bg-orange-50 rounded-2xl"><Info className="text-[#F59E0B]" /></div>
              <div>
                <h3 className="font-bold text-xl">Requirement Details</h3>
                <p className="text-sm text-slate-400 font-medium">Specify quantity and timeline for {formData.material_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 flex items-center gap-1.5">
                  <Database size={14} /> Quantity Required ({formData.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="appearance-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} /> Required Date
                </label>
                <input
                  type="date"
                  value={formData.required_date}
                  onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                  className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 flex items-center gap-1.5">
                  <Building2 size={14} /> Requesting Dept
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
                >
                  <option value="">Select Department</option>
                  <option value="Production">Production</option>
                  <option value="Inventory">Inventory</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setCurrentStep(1)} className="outline-none px-4 py-2 rounded-xl font-bold text-[#F59E0B] border border-transparent hover:border-amber-500 transition-all">Back</button>
              <button
                disabled={!formData.quantity || !formData.required_date || !formData.department}
                onClick={() => setCurrentStep(3)}
                className="outline-none bg-slate-900 disabled:opacity-30 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Priority & Final Review */}
        {currentStep === 3 && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
              <div className="p-3 bg-orange-50 rounded-2xl"><ClipboardList className="text-[#F59E0B]" /></div>
              <h3 className="font-bold text-xl text-slate-800">Review & Set Priority</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <DetailBox label="Material" value={formData.material_name} icon={<Package size={14} />} />
                <DetailBox label="Item Code" value={formData.material_code} icon={<Hash size={14} />} />
                <div className="grid grid-cols-2 gap-4">
                  <DetailBox label="Quantity" value={`${formData.quantity} ${formData.unit}`} icon={<Database size={14} />} />
                  <DetailBox label="Target Date" value={formData.required_date} icon={<Calendar size={14} />} />
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-4xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Set Urgency Level</label>
                <div className="flex flex-col gap-3">
                  {["LOW", "MEDIUM", "HIGH"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFormData({ ...formData, priority: p as any })}
                      className={`outline-none flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black transition-all ${formData.priority === p
                        ? 'bg-[#F59E0B] text-white shadow-xl scale-[1.02]'
                        : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {p}
                      {formData.priority === p && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setCurrentStep(2)} className="outline-none px-4 py-2 rounded-xl text-sm font-bold text-[#F59E0B] hover:text-[#ffb73a] border border-amber-500 transition-all">Modify Details</button>
              <button onClick={() => setCurrentStep(4)} className="outline-none bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all">Finalize</button>
            </div>
          </div>
        )}

        {/* Step 4: Success / Finalize */}
        {currentStep === 4 && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 animate-in fade-in zoom-in-95">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 bg-orange-50 text-[#f59e0b]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Ready to Submit</h2>
              <p className="text-slate-500 mb-10 font-medium">
                The purchase request will be submitted to the Purchase Department for vendor selection and RFQ processing.
              </p>

              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={handleFinalAction}
                  disabled={loading}
                  className="outline-none bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50 min-w-45"
                >
                  {loading ? "Generating PR..." : "Confirm & Create PR"}
                </button>
                <button onClick={() => navigate("/purchase/purchase-requests")} className="outline-none rounded-xl font-bold text-sm text-[#F59E0B] hover:text-red-500 border hover:border-rose-500 py-2 px-4 transition-colors">
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== Sub-Components ====================

const DetailBox: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="space-y-2">
    <label className="outline-none text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
      {icon} {label}
    </label>
    <div className="outline-none text-slate-800 font-bold text-base bg-slate-50/50 px-4 py-3 rounded-2xl border border-slate-50">
      {value || "-"}
    </div>
  </div>
);

export default CreatePurchaseRequest;