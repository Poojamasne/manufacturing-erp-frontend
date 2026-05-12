import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle2,
  Play,
  Settings,
  AlertTriangle,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
type WOStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED";
type Shift = "MORNING" | "EVENING" | "NIGHT";

interface Task {
  id: string;
  name: string;
  machine: string;
  operator: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
}

interface WorkOrder {
  id: string;
  workOrderId: string;
  productionOrderId: string;
  productName: string;
  totalQuantity: number;
  status: WOStatus;
  shift: Shift;
  tasks: Task[];
  createdAt: string;
}

// ==================== Mock Data ====================
const initialWorkOrders: WorkOrder[] = [
  {
    id: "wo-1",
    workOrderId: "WO-2024-001",
    productionOrderId: "PO-9901",
    productName: "Industrial Bolt M12",
    totalQuantity: 5000,
    status: "IN_PROGRESS",
    shift: "MORNING",
    createdAt: new Date().toISOString(),
    tasks: [
      { id: "t1", name: "Raw Material Cutting", machine: "Cutter X", operator: "John Doe", startDate: "2024-05-10", endDate: "2024-05-10", status: "COMPLETED" },
      { id: "t2", name: "Thread Milling", machine: "CNC-01", operator: "Jane Smith", startDate: "2024-05-11", endDate: "2024-05-12", status: "IN_PROGRESS" },
      { id: "t3", name: "Quality Inspection", machine: "QC-Station", operator: "Mike Ross", startDate: "2024-05-13", endDate: "2024-05-13", status: "PENDING" },
    ]
  },
  {
    id: "wo-2",
    workOrderId: "WO-2024-002",
    productionOrderId: "PO-9905",
    productName: "Aluminum Frame 4x4",
    totalQuantity: 250,
    status: "COMPLETED",
    shift: "EVENING",
    createdAt: "2024-05-01T10:00:00Z",
    tasks: [
      { id: "t4", name: "Frame Welding", machine: "Weld-Bot", operator: "Sarah W.", startDate: "2024-05-15", endDate: "2024-05-16", status: "COMPLETED" },
      { id: "t5", name: "Surface Coating", machine: "Powder Line", operator: "Tom H.", startDate: "2024-05-17", endDate: "2024-05-17", status: "COMPLETED" },
    ]
  },
  {
    id: "wo-3",
    workOrderId: "WO-2024-003",
    productionOrderId: "PO-9909",
    productName: "Steel Bracket 2x2",
    totalQuantity: 1000,
    status: "OPEN",
    shift: "NIGHT",
    createdAt: "2024-05-05T14:00:00Z",
    tasks: [
      { id: "t6", name: "Brace Cutting", machine: "Cutter Y", operator: "Alice J.", startDate: "2024-05-20", endDate: "2024-05-20", status: "PENDING" },
      { id: "t7", name: "Bracket Assembly", machine: "Assembly Line", operator: "Bob K.", startDate: "2024-05-21", endDate: "2024-05-21", status: "PENDING" },
      { id: "t8", name: "Final Inspection", machine: "QC-Station", operator: "Charlie M.", startDate: "2024-05-22", endDate: "2024-05-22", status: "PENDING" },
      { id: "t9", name: "Packaging", machine: "Packager 3000", operator: "Diana P.", startDate: "2024-05-23", endDate: "2024-05-23", status: "PENDING" },
    ]
  }
];

const StatusBadge: React.FC<{ status: WOStatus }> = ({ status }) => {
  const styles: Record<WOStatus, string> = {
    OPEN: "bg-gray-100 text-gray-700 border-gray-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const ShopFloorExecution: React.FC = () => {
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activeDropdown === "time" && timeDropdownRef.current && !timeDropdownRef.current.contains(target)) {
        setActiveDropdown(null);
        setIsCalendarOpen(false);
      }
      if (activeDropdown === "status" && statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setActiveDropdown(null);
      }
      if (showManageModal && modalRef.current && !modalRef.current.contains(target)) {
        setShowManageModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, showManageModal]);

  // FIX: Custom Date Range Application
  const handleCustomApply = () => {
    if (customRange.start && customRange.end) {
      setTimeFilter("Custom");
      setIsCalendarOpen(false);
      setActiveDropdown(null);
    } else {
      alert("Please select both dates");
    }
  };

  const filteredWOs = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || wo.status === statusFilter;

      const orderDate = new Date(wo.createdAt);
      const now = new Date();
      let matchesTime = true;

      if (timeFilter === "Weekly") {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        matchesTime = diffDays <= 7 && diffDays >= 0;
      } else if (timeFilter === "Monthly") {
        matchesTime = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === "Yearly") {
        matchesTime = orderDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === "Custom" && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59); // Ensure full end day is included
        matchesTime = orderDate >= start && orderDate <= end;
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [workOrders, searchQuery, statusFilter, timeFilter, customRange]);

  const totalPages = Math.ceil(filteredWOs.length / itemsPerPage);
  const paginatedWOs = filteredWOs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateTaskStatus = (woId: string, taskId: string, newStatus: TaskStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        const updatedTasks = wo.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        return { ...wo, tasks: updatedTasks, status: "IN_PROGRESS" as WOStatus };
      }
      return wo;
    }));
    if (selectedWO?.id === woId) {
      const updatedTasks = selectedWO.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      setSelectedWO({ ...selectedWO, tasks: updatedTasks });
    }
  };

  const finalizeWorkOrder = (woId: string) => {
    setWorkOrders(prev => prev.map(wo =>
      wo.id === woId ? { ...wo, status: "COMPLETED" as WOStatus } : wo
    ));
    // Also update current selected state for UI immediate reaction
    if (selectedWO) setSelectedWO({ ...selectedWO, status: "COMPLETED" });
  };

  const allTasksFinished = selectedWO?.tasks.every(t => t.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Shop Floor</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Real-time task tracking and manufacturing oversight</p>
          </div>

          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "time" ? null : "time")}
              className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{timeFilter === "Custom" && customRange.start ? `${formatDate(customRange.start)} - ${formatDate(customRange.end)}` : timeFilter}</span>
              <ChevronDown size={14} className={activeDropdown === "time" ? "rotate-180" : ""} />
            </button>
            {activeDropdown === "time" && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-40 overflow-hidden">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setTimeFilter(tab as TimeFilter); setActiveDropdown(null); }}
                    className={`outline-none w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {tab}
                  </button>
                ))}
                <button onClick={() => setIsCalendarOpen(true)} className="outline-none w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50">Custom</button>
              </div>
            )}
            {isCalendarOpen && activeDropdown === "time" && (
              <div className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-2xl z-50 w-72 border">
                <div className="space-y-3">
                  <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-100" />
                  <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-100" />
                  <button onClick={handleCustomApply} className="outline-none w-full bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-lg text-sm font-bold">Apply Range</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Live Orders" value={workOrders.filter(w => w.status === 'IN_PROGRESS').length} color="border-amber-500" />
          <StatCard label="Tasks Done" value={workOrders.reduce((acc, wo) => acc + wo.tasks.filter(t => t.status === 'COMPLETED').length, 0)} color="border-slate-800" />
          <StatCard label="Completed WO" value={workOrders.filter(w => w.status === 'COMPLETED').length} color="border-green-500" />
          <StatCard label="Personnel" value="14 Active" color="border-blue-500" />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl text-sm outline-none font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="relative" ref={statusDropdownRef}>
              <button onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")} className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                {statusFilter === "All" ? "Status" : statusFilter}
                <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
              </button>
              {activeDropdown === "status" && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                  {["All", "OPEN", "IN_PROGRESS", "COMPLETED"].map((opt) => (
                    <button key={opt} onClick={() => { setStatusFilter(opt); setActiveDropdown(null); }} className={`outline-none w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}>{opt}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">WO ID</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Product / PO</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Progress</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedWOs.map((wo) => {
                  const completed = wo.tasks.filter(t => t.status === "COMPLETED").length;
                  const percent = Math.round((completed / wo.tasks.length) * 100);
                  return (
                    <tr key={wo.id} className="group hover:bg-orange-50/20 transition-colors">
                      <td className="px-6 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{wo.workOrderId}</td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-[13px] font-bold text-slate-700">{wo.productName}</p>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tight">{wo.productionOrderId}</p>
                      </td>
                      <td className="px-6 py-4 text-center"><StatusBadge status={wo.status} /></td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F59E0B] transition-all" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{percent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => { setSelectedWO(wo); setShowManageModal(true); }} className="outline-none p-1.5 text-slate-400 hover:text-[#F59E0B]"><Eye size={18} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWOs.length)} of {filteredWOs.length} Work Orders
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="outline-none p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setCurrentPage(n)} className={`outline-none min-w-10 h-10 rounded-xl text-xs font-bold ${currentPage === n ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border"}`}>{n}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="outline-none p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30">
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Modal */}
      {showManageModal && selectedWO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase">Operational Breakdown</h2>
                <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">{selectedWO.workOrderId} • {selectedWO.productName}</p>
              </div>
              <button onClick={() => setShowManageModal(false)} className="text-gray-400 text-2xl hover:text-rose-600 transition-colors">×</button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {selectedWO.tasks.map((task) => (
                <div key={task.id} className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-center gap-4 ${task.status === 'COMPLETED' ? 'bg-green-50/50 border-green-100' : 'bg-slate-50/50 border-slate-100'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.status === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                      {task.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Settings size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{task.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">{task.machine} • {task.operator}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status === "PENDING" && (
                      <button onClick={() => handleUpdateTaskStatus(selectedWO.id, task.id, "IN_PROGRESS")} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-blue-700">
                        <Play size={12} fill="currentColor" /> Start Task
                      </button>
                    )}
                    {task.status === "IN_PROGRESS" && (
                      <button onClick={() => handleUpdateTaskStatus(selectedWO.id, task.id, "COMPLETED")} className="px-4 py-2 bg-[#F59E0B] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-amber-600">
                        <CheckCircle2 size={12} /> Mark Done
                      </button>
                    )}
                    {task.status === "COMPLETED" && (
                      <span className="text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-100 px-3 py-1.5 rounded-lg border border-green-200">Processed</span>
                    )}
                  </div>
                </div>
              ))}

              {allTasksFinished && selectedWO.status !== "COMPLETED" && (
                <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100 animate-pulse">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <p className="text-xs font-bold text-amber-700 uppercase">Ready for finalization. All tasks recorded as finished.</p>
                </div>
              )}
            </div>

            <div className="bg-white border-t p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Settings size={16} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Execution Tracking System</span>
              </div>

              <div className="flex gap-3 w-full sm:w-auto items-center">
                <button onClick={() => setShowManageModal(false)} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-100 transition-all border">Close</button>

                {/* FIX: Status-based Footer Message with Animation */}
                {selectedWO.status === "COMPLETED" ? (
                  <div className="cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-black text-[11px] uppercase tracking-widest border border-green-100 animate-pulse">
                    <CheckCircle2 size={16} />
                    Production Finalized
                  </div>
                ) : (
                  <button
                    disabled={!allTasksFinished}
                    onClick={() => finalizeWorkOrder(selectedWO.id)}
                    className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md ${allTasksFinished
                      ? "bg-[#F59E0B] text-white hover:bg-slate-900 shadow-orange-100"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                      }`}
                  >
                    Finalize Production
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <div className={`bg-white p-8 rounded-xl border-l-4 ${color} shadow-sm transition-all hover:shadow-md`}>
    <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-bold text-slate-700 tracking-tight">{value}</p>
  </div>
);

export default ShopFloorExecution;