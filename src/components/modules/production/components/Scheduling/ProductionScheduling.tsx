import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type WorkOrderStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
type Shift = "MORNING" | "EVENING" | "NIGHT";

interface WorkOrder {
  id: string;
  workOrderId: string;
  taskName: string;
  productionOrderId: string;
  machineName: string;
  operatorName: string;
  shift: Shift;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  createdAt: string;
}

// ==================== Mock Data ====================
const mockWorkOrders: WorkOrder[] = [
  { id: "1", workOrderId: "WO-1001", taskName: "CNC Milling", productionOrderId: "PO-990", machineName: "Milling Station A", operatorName: "John Doe", shift: "MORNING", startDate: "2024-05-10", endDate: "2024-05-12", status: "IN_PROGRESS", createdAt: "2024-05-01" },
  { id: "2", workOrderId: "WO-1002", taskName: "Quality Check", productionOrderId: "PO-991", machineName: "Inspection Lab", operatorName: "Jane Smith", shift: "EVENING", startDate: "2024-05-15", endDate: "2024-05-15", status: "PENDING", createdAt: "2024-05-02" },
  { id: "3", workOrderId: "WO-1003", taskName: "Assembly", productionOrderId: "PO-992", machineName: "Line 4", operatorName: "Mike Ross", shift: "NIGHT", startDate: "2024-05-11", endDate: "2024-05-14", status: "ASSIGNED", createdAt: "2024-05-03" },
];

const WorkOrderScheduling: React.FC = () => {
  // Refs for Outside Clicks
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const viewModalRef = useRef<HTMLDivElement>(null);
  const scheduleModalRef = useRef<HTMLDivElement>(null);

  // State
  const [workOrders, _setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Handle Outside Clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activeDropdown === "time" && timeDropdownRef.current && !timeDropdownRef.current.contains(target)) setActiveDropdown(null);
      if (activeDropdown === "status" && statusDropdownRef.current && !statusDropdownRef.current.contains(target)) setActiveDropdown(null);
      if (showViewModal && viewModalRef.current && !viewModalRef.current.contains(target)) setShowViewModal(false);
      if (showScheduleModal && scheduleModalRef.current && !scheduleModalRef.current.contains(target)) setShowScheduleModal(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, showViewModal, showScheduleModal]);

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    return workOrders.filter(wo => 
      (wo.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()) || wo.taskName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "All" || wo.status === statusFilter)
    );
  }, [workOrders, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Work Scheduling</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Assign shifts and dates to work orders</p>
          </div>

          <div className="relative" ref={timeDropdownRef}>
            <button onClick={() => setActiveDropdown(activeDropdown === "time" ? null : "time")} className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{timeFilter}</span>
              <ChevronDown size={14} className={activeDropdown === "time" ? "rotate-180" : ""} />
            </button>
            {activeDropdown === "time" && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-44 border border-slate-50 overflow-hidden">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"].map(t => (
                  <button key={t} onClick={() => { setTimeFilter(t as TimeFilter); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 text-slate-600 transition-colors font-medium italic">{t}</button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Scheduled" value={workOrders.length} color="border-orange-500" />
          <StatCard label="Morning Shift" value={workOrders.filter(w=>w.shift==="MORNING").length} color="border-blue-500" />
          <StatCard label="Evening Shift" value={workOrders.filter(w=>w.shift==="EVENING").length} color="border-purple-500" />
          <StatCard label="Night Shift" value={workOrders.filter(w=>w.shift==="NIGHT").length} color="border-slate-800" />
        </div>

        {/* Main List Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search work orders..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="relative" ref={statusDropdownRef}>
                <button onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")} className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                  {statusFilter === "All" ? "Status" : statusFilter}
                  <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl z-50 py-2 border border-slate-50 overflow-hidden">
                    {["All", "PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].map(s => (
                      <button key={s} onClick={() => { setStatusFilter(s); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 text-slate-600 font-medium">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">WO ID</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Task</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Shift</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Start Date</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">End Date</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((wo) => (
                  <tr key={wo.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="px-6 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{wo.workOrderId}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700 text-center font-medium">{wo.taskName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${wo.shift === 'MORNING' ? 'bg-blue-50 text-blue-600 border-blue-100' : wo.shift === 'EVENING' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {wo.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700 text-center">{formatDate(wo.startDate)}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700 text-center">{formatDate(wo.endDate)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => { setSelectedOrder(wo); setShowViewModal(true); }}
                          className="p-2 text-slate-400 hover:text-[#F59E0B] hover:bg-white rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => { setSelectedOrder(wo); setShowScheduleModal(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                        >
                          <Calendar size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
               <div className="py-20 text-center">
                 <AlertTriangle className="mx-auto text-slate-200 mb-4" size={48} />
                 <h3 className="text-lg font-bold text-slate-800">No records found</h3>
               </div>
            )}
          </div>

          {/* Pagination */}
          <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} records
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 outline-none"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                {getPageNumbers().map(n => (
                  <button 
                    key={n} 
                    onClick={() => setCurrentPage(n)}
                    className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all outline-none ${currentPage === n ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200 hover:border-orange-200"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 outline-none"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* VIEW DETAILS MODAL (Read Only) */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div ref={viewModalRef} className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Work Order Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl outline-none">×</button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <ModalDetail label="Work Order ID" value={selectedOrder.workOrderId} />
                <ModalDetail label="Production ID" value={selectedOrder.productionOrderId} />
                <ModalDetail label="Machine" value={selectedOrder.machineName} />
                <ModalDetail label="Operator" value={selectedOrder.operatorName} />
              </div>
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-8">
                <ModalDetail label="Status" value={selectedOrder.status} isBadge />
                <ModalDetail label="Current Shift" value={selectedOrder.shift} isBadge />
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-8 py-3 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all outline-none"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULING MODAL (Functional) */}
      {showScheduleModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div ref={scheduleModalRef} className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b bg-orange-50/30 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Update Schedule</h2>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">{selectedOrder.workOrderId} • {selectedOrder.taskName}</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl outline-none">×</button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Assignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {["MORNING", "EVENING", "NIGHT"].map((s) => (
                    <button 
                      key={s}
                      onClick={() => setSelectedOrder({...selectedOrder, shift: s as Shift})}
                      className={`py-3 rounded-xl border text-[11px] font-bold transition-all outline-none ${selectedOrder.shift === s ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200' : 'bg-white border-slate-200 text-slate-500 hover:border-orange-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                  <input 
                    type="date" 
                    value={selectedOrder.startDate}
                    onChange={(e) => setSelectedOrder({...selectedOrder, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                  <input 
                    type="date" 
                    value={selectedOrder.endDate}
                    onChange={(e) => setSelectedOrder({...selectedOrder, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex flex-col gap-3">
              <button 
                onClick={() => {
                  alert(`Schedule updated for ${selectedOrder.workOrderId}`);
                  setShowScheduleModal(false);
                }}
                className="w-full py-4 bg-[#F59E0B] text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-[#f67317] transition-all active:scale-[0.98] outline-none"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Sub-Components ====================
const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${color} shadow-sm`}>
    <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-700">{value}</p>
  </div>
);

const ModalDetail = ({ label, value, isBadge }: { label: string; value: string; isBadge?: boolean }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
    {isBadge ? (
       <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-black uppercase border border-slate-200">
         {value}
       </span>
    ) : (
      <p className="text-md font-bold text-slate-800 leading-tight">{value}</p>
    )}
  </div>
);

export default WorkOrderScheduling;