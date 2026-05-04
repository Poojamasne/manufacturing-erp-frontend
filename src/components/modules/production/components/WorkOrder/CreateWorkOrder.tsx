import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Save,
  Loader2,
  Settings,
  Cpu,
  User,
  LayoutGrid,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

// ==================== Types & Mock Data ====================
interface ProductionOrder {
  id: string;
  poId: string;
  productName: string;
  totalQuantity: number;
  deadline: string;
}

interface Task {
  id: string;
  name: string;
  machine: string;
  operator: string;
  startDate: string;
  endDate: string;
}

const mockProductionOrders: ProductionOrder[] = [
  { id: "1", poId: "PO-001", productName: "Industrial Bolt M12", totalQuantity: 5000, deadline: "2024-05-20" },
  { id: "2", poId: "PO-002", productName: "Aluminum Frame 4x4", totalQuantity: 250, deadline: "2024-05-18" },
];

const mockMachines = ["CNC Machine A", "CNC Machine B", "Injection Molder", "Assembly Line 1"];
const mockOperators = ["John Doe", "Sarah Wilson", "Jane Smith", "Mike Johnson"];

const CreateWorkOrder: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedPO, setSelectedPO] = useState<ProductionOrder | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    { id: Date.now().toString(), name: "", machine: "", operator: "", startDate: "", endDate: "" }
  ]);

  const addTask = () => {
    setTasks([...tasks, { id: Date.now().toString(), name: "", machine: "", operator: "", startDate: "", endDate: "" }]);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const updateTask = (id: string, field: keyof Task, value: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`${tasks.length} Work Orders created successfully!`);
      navigate("/production/work-orders");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <button
            onClick={() => navigate("/production/planning")}
            className="hover:text-[#F59E0B] transition-colors font-medium"
          >
            Production planning
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-bold">New Work Order</span>
        </div>

        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Generate Work Orders</h1>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-6 mb-10 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm w-fit">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 1 ? "bg-[#F59E0B] text-white shadow-lg" : "bg-emerald-500 text-white"}`}>
                    {currentStep > 1 ? <CheckCircle2 size={20}/> : "1"}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-800">Order Selection</span>
            </div>
            <div className="w-12 h-px bg-slate-200" />
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 2 ? "bg-[#F59E0B] text-white shadow-lg" : "bg-slate-100 text-slate-400"}`}>
                    2
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${currentStep === 2 ? "text-slate-800" : "text-slate-400"}`}>Task Assignment</span>
            </div>
        </div>

        {/* Step 1: Select Production Order */}
        {currentStep === 1 && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700">
                <LayoutGrid size={20} className="text-[#F59E0B]" /> Select Production Order to Break Down
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockProductionOrders.map((po) => (
                <button
                  key={po.id}
                  onClick={() => { setSelectedPO(po); setCurrentStep(2); }}
                  className="group text-left p-6 border border-slate-300 rounded-4xl hover:border-[#F59E0B] hover:bg-orange-50/20 transition-all"
                >
                  <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest">{po.poId}</span>
                  <h4 className="text-xl font-bold text-slate-800 mt-1">{po.productName}</h4>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                    <span className="text-sm font-bold text-slate-500">{po.totalQuantity} Units Total</span>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-[#F59E0B]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Task Assignment (Multi-Task) */}
        {currentStep === 2 && selectedPO && (
          <div className="space-y-6">
            {/* Order Context Header */}
            <div className="bg-slate-900 rounded-4xl p-8 text-white flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Breaking Down Order</p>
                    <h2 className="text-2xl font-bold">{selectedPO.productName} ({selectedPO.poId})</h2>
                </div>
                <button onClick={() => setCurrentStep(1)} className="text-sm font-bold text-[#F59E0B] hover:underline">Change Order</button>
            </div>

            {/* Dynamic Task List */}
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-xs font-black text-slate-400">0{index + 1}</div>
                        <h3 className="font-bold text-lg text-slate-800">Task Details</h3>
                    </div>
                    {tasks.length > 1 && (
                        <button onClick={() => removeTask(task.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                            <Trash2 size={18}/>
                        </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Task Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Settings size={12}/> Task Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Cutting, Welding, Assembly"
                            value={task.name}
                            onChange={(e) => updateTask(task.id, "name", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-[#F59E0B] outline-none text-sm"
                        />
                    </div>

                    {/* Machine Assignment */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Cpu size={12}/> Assigned Machine</label>
                        <select 
                            value={task.machine}
                            onChange={(e) => updateTask(task.id, "machine", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-[#F59E0B] outline-none text-sm"
                        >
                            <option value="">Select Machine...</option>
                            {mockMachines.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* Operator Assignment */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><User size={12}/> Assigned Operator</label>
                        <select 
                            value={task.operator}
                            onChange={(e) => updateTask(task.id, "operator", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-[#F59E0B] outline-none text-sm"
                        >
                            <option value="">Select Operator...</option>
                            {mockOperators.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Start Date</label>
                        <input 
                            type="date"
                            value={task.startDate}
                            onChange={(e) => updateTask(task.id, "startDate", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-[#F59E0B] outline-none text-sm"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Calendar size={12}/> End Date</label>
                        <input 
                            type="date"
                            value={task.endDate}
                            onChange={(e) => updateTask(task.id, "endDate", e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-[#F59E0B] outline-none text-sm"
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-10">
                <button 
                    onClick={addTask}
                    className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
                >
                    <Plus size={18}/> Add Another Task
                </button>

                <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="w-full md:w-auto bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Create Work Orders
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWorkOrder;