import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  MoreHorizontal,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type WorkOrderStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
type Shift = "MORNING" | "EVENING" | "NIGHT";

interface WorkOrder {
  id: string;
  workOrderId: string;
  productName: string; // Changed from taskName
  productionOrderId: string;
  taskCount: number;   // New Field
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
  { id: "1", workOrderId: "WO-1001", productName: "Industrial Bolt M12", productionOrderId: "PO-990", taskCount: 5, machineName: "Milling Station A", operatorName: "Yogesh Pote", shift: "MORNING", startDate: "2024-05-10", endDate: "2024-05-12", status: "IN_PROGRESS", createdAt: new Date().toISOString() },
  { id: "2", workOrderId: "WO-1002", productName: "Aluminum Frame 4x4", productionOrderId: "PO-991", taskCount: 3, machineName: "Inspection Lab", operatorName: "Shubham Tiwari", shift: "EVENING", startDate: "2024-05-15", endDate: "2024-05-15", status: "PENDING", createdAt: "2024-05-01T10:00:00Z" },
  { id: "3", workOrderId: "WO-1003", productName: "Plastic Container L", productionOrderId: "PO-992", taskCount: 8, machineName: "Line 4", operatorName: "Ram Sharma", shift: "NIGHT", startDate: "2024-05-11", endDate: "2024-05-14", status: "ASSIGNED", createdAt: "2024-01-15T10:00:00Z" },
  { id: "4", workOrderId: "WO-1004", productName: "Steel Beam 10x20", productionOrderId: "PO-993", taskCount: 6, machineName: "Welding Station", operatorName: "Shyam Kumar", shift: "MORNING", startDate: "2024-05-12", endDate: "2024-05-13", status: "COMPLETED", createdAt: "2024-05-10T10:00:00Z" },
];

// ==================== Helper Components ====================
const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const WorkOrderScheduling: React.FC = () => {
  // Refs
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const viewModalRef = useRef<HTMLDivElement>(null);
  const scheduleModalRef = useRef<HTMLDivElement>(null);

  // States
  const [workOrders, _setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sync Outside Clicks for Dropdowns and Modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Dropdowns
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(target)) {
        setIsTimeDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setIsCalendarOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(target)) {
        setActiveDropdown(null);
      }

      // Modals Outside Click
      if (showViewModal && viewModalRef.current && !viewModalRef.current.contains(target)) {
        setShowViewModal(false);
      }
      if (showScheduleModal && scheduleModalRef.current && !scheduleModalRef.current.contains(target)) {
        setShowScheduleModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showViewModal, showScheduleModal]);

  const handleTimeFilterChange = (value: TimeFilter) => {
    if (value === "Custom") {
      setIsCalendarOpen(true);
      setIsTimeDropdownOpen(false);
    } else {
      setTimeFilter(value);
      setIsTimeDropdownOpen(false);
      setIsCalendarOpen(false);
      setCustomRange({ start: "", end: "" });
    }
  };

  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) return;
    setTimeFilter("Custom");
    setIsCalendarOpen(false);
    setIsTimeDropdownOpen(false);
  };

  const getFilterDisplayText = () => {
    if (timeFilter === "Custom" && customRange.start && customRange.end) {
      return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    }
    return timeFilter;
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...workOrders];
    if (searchQuery) {
      filtered = filtered.filter(wo =>
        wo.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "All") filtered = filtered.filter(wo => wo.status === statusFilter);

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (timeFilter === "Weekly") {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays >= 0;
      }
      if (timeFilter === "Monthly") return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Quarterly") return Math.floor(orderDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Yearly") return orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Custom" && customRange.start && customRange.end) {
        return orderDate >= new Date(customRange.start) && orderDate <= new Date(customRange.end);
      }
      return true;
    });
    return filtered;
  }, [workOrders, searchQuery, statusFilter, timeFilter, customRange]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Work Scheduling</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Assign shifts and dates to work orders</p>
          </div>

          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-44 border border-slate-100 overflow-hidden">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map(t => (
                  <button
                    key={t}
                    onClick={() => handleTimeFilterChange(t as TimeFilter)}
                    className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === t ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {t}
                  </button>
                ))}
                <button onClick={() => setIsCalendarOpen(true)} className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50">Custom</button>
              </div>
            )}
            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72"
              >
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, start: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) =>
                      setCustomRange({ ...customRange, end: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    onClick={handleCustomApply}
                    className="outline-none w-full bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#f67317]"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Orders" value={workOrders.length} color="border-orange-500" />
          <StatCard label="Morning Shift" value={workOrders.filter(w => w.shift === "MORNING").length} color="border-blue-500" />
          <StatCard label="Evening Shift" value={workOrders.filter(w => w.shift === "EVENING").length} color="border-purple-500" />
          <StatCard label="Night Shift" value={workOrders.filter(w => w.shift === "NIGHT").length} color="border-slate-800" />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text" placeholder="Search work orders..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none font-medium"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 transition-all ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}
              >
                {statusFilter === "All" ? "Status" : statusFilter}
                <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
              </button>
              {activeDropdown === "status" && (
                <div className="absolute right-0 mt-2 w-30 bg-white rounded-2xl shadow-2xl z-50 py-2 border border-slate-50 overflow-hidden">
                  {["All", "PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED"].map(s => (
                    <button
                      key={s} onClick={() => { setStatusFilter(s); setActiveDropdown(null); }}
                      className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50  ${statusFilter === s ? "text-amber-500 font-bold bg-orange-50/50"
                          : "text-slate-600"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">WO ID</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Product Name</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Total Tasks</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Shift</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Start Date</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">End Date</th>
                  <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((wo) => (
                  <tr key={wo.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="px-6 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{wo.workOrderId}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700 text-center font-bold tracking-tight">{wo.productName}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700 text-center font-bold">{wo.taskCount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${wo.shift === 'MORNING' ? 'bg-blue-50 text-blue-600 border-blue-100' : wo.shift === 'EVENING' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {wo.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-700 text-center">{formatDate(wo.startDate)}</td>
                    <td className="px-6 py-4 text-[13px] text-slate-700 text-center">{formatDate(wo.endDate)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelectedOrder(wo); setShowViewModal(true); }} className="p-2 text-slate-400 hover:text-[#F59E0B] transition-all"><Eye size={18} /></button>
                        <button onClick={() => { setSelectedOrder(wo); setShowScheduleModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Calendar size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} Records
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {getPageNumbers().map((n, i) => (
                    n === "..." ? <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span> :
                      <button key={i} onClick={() => setCurrentPage(n as number)} className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all outline-none ${currentPage === n ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}>{n}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30">
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={viewModalRef} className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Work Order Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-rose-500 text-2xl transition-colors">×</button>
            </div>
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <ModalDetail label="Work Order ID" value={selectedOrder.workOrderId} />
                <ModalDetail label="Production ID" value={selectedOrder.productionOrderId} />
                <ModalDetail label="Product Name" value={selectedOrder.productName} />
                <ModalDetail label="Start Date" value={formatDate(selectedOrder.startDate)} />
                <ModalDetail label="End Date" value={formatDate(selectedOrder.endDate)} />
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50/50 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-8 py-3 bg-[#F59E0B] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#f67317] transition-all shadow-lg">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULING MODAL */}
      {showScheduleModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={scheduleModalRef} className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b bg-orange-50/30 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase">Update Schedule</h2>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">{selectedOrder.workOrderId}</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-rose-500 text-2xl transition-colors">×</button>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Assignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {["MORNING", "EVENING", "NIGHT"].map((s) => (
                    <button key={s} onClick={() => setSelectedOrder({ ...selectedOrder, shift: s as Shift })} className={`py-3 rounded-xl border text-[11px] font-bold transition-all ${selectedOrder.shift === s ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                  <input type="date" value={selectedOrder.startDate} onChange={(e) => setSelectedOrder({ ...selectedOrder, startDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-100 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                  <input type="date" value={selectedOrder.endDate} onChange={(e) => setSelectedOrder({ ...selectedOrder, endDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-100 outline-none" />
                </div>
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50/50">
              <button onClick={() => setShowScheduleModal(false)} className="w-full py-4 bg-[#F59E0B] text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#f67317] transition-all active:scale-[0.98]">Update Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Sub-Components ====================
const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <div className={`bg-white p-8 rounded-xl border-l-4 ${color} shadow-sm transition-transform`}>
    <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black text-slate-700 tracking-tight">{value}</p>
  </div>
);

const ModalDetail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
    <p className="text-md font-bold text-slate-800 tracking-tight leading-tight">{value}</p>
  </div>
);

export default WorkOrderScheduling;