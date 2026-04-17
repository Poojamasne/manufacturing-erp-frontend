import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  Factory,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type ProductionOrderStatus = "DRAFT" | "PLANNED" | "SCHEDULED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
type Priority = "HIGH" | "MEDIUM" | "LOW";
type Shift = "MORNING" | "EVENING" | "NIGHT";

interface ProductionOrder {
  id: string;
  productionOrderId: string;
  salesOrderId: string;
  productName: string;
  quantity: number;
  completedQuantity: number;
  rejectedQuantity: number;
  deadline: string;
  startDate: string;
  status: ProductionOrderStatus;
  priority: Priority;
  progress: number;
  shift: Shift;
  assignedMachine: string;
  assignedOperator: string;
  createdAt: string;
}


const mockOrders: ProductionOrder[] = [
  { id: "1", productionOrderId: "PO-001", salesOrderId: "SO-001", productName: "Industrial Bolt M12", quantity: 5000, completedQuantity: 3250, rejectedQuantity: 45, deadline: "2024-05-20", startDate: "2024-05-15", status: "IN_PROGRESS", priority: "HIGH", progress: 65, shift: "MORNING", assignedMachine: "CNC Machine B", assignedOperator: "John Doe", createdAt: "2024-05-14" },
  { id: "2", productionOrderId: "PO-002", salesOrderId: "SO-002", productName: "Aluminum Frame 4x4", quantity: 250, completedQuantity: 0, rejectedQuantity: 0, deadline: "2024-05-18", startDate: "", status: "PLANNED", priority: "HIGH", progress: 0, shift: "MORNING", assignedMachine: "", assignedOperator: "", createdAt: "2024-05-12" },
  { id: "3", productionOrderId: "PO-003", salesOrderId: "SO-003", productName: "Plastic Container L", quantity: 1000, completedQuantity: 300, rejectedQuantity: 12, deadline: "2024-05-22", startDate: "2024-05-17", status: "ON_HOLD", priority: "MEDIUM", progress: 30, shift: "EVENING", assignedMachine: "Injection Molder", assignedOperator: "Sarah Wilson", createdAt: "2024-05-13" },
  { id: "4", productionOrderId: "PO-004", salesOrderId: "SO-004", productName: "Rubber Gasket Set", quantity: 3000, completedQuantity: 3000, rejectedQuantity: 28, deadline: "2024-05-19", startDate: "2024-05-10", status: "COMPLETED", priority: "HIGH", progress: 100, shift: "MORNING", assignedMachine: "Assembly Line 1", assignedOperator: "Jane Smith", createdAt: "2024-05-09" },
  { id: "5", productionOrderId: "PO-005", salesOrderId: "SO-005", productName: "Steel Plates 6mm", quantity: 1500, completedQuantity: 0, rejectedQuantity: 0, deadline: "2024-05-25", startDate: "", status: "SCHEDULED", priority: "MEDIUM", progress: 0, shift: "NIGHT", assignedMachine: "CNC Machine A", assignedOperator: "Mike Johnson", createdAt: "2024-05-15" },
  { id: "6", productionOrderId: "PO-006", salesOrderId: "SO-006", productName: "Copper Wires", quantity: 8000, completedQuantity: 0, rejectedQuantity: 0, deadline: "2024-05-28", startDate: "", status: "DRAFT", priority: "LOW", progress: 0, shift: "MORNING", assignedMachine: "", assignedOperator: "", createdAt: "2024-05-16" },
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: ProductionOrderStatus }> = ({ status }) => {
  const styles: Record<ProductionOrderStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    PLANNED: "bg-blue-100 text-blue-700 border-blue-200",
    SCHEDULED: "bg-purple-100 text-purple-700 border-purple-200",
    IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
    ON_HOLD: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200"
  };
  const labels: Record<ProductionOrderStatus, string> = {
    DRAFT: "Draft", PLANNED: "Planned", SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress", ON_HOLD: "On Hold", COMPLETED: "Completed", CANCELLED: "Cancelled"
  };
  return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status]}`}>{labels[status]}</span>;
};

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-teal-50 border-teal-100"
  };
  return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[priority]}`}>{priority}</span>;
};

const getShiftLabel = (shift: Shift) => {
  const labels: Record<Shift, string> = { MORNING: "Morning", EVENING: "Evening", NIGHT: "Night" };
  return labels[shift];
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
};

const ProductionOrderList: React.FC = () => {

  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State
  const [orders, setOrders] = useState<ProductionOrder[]>(mockOrders);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [shiftFilter, setShiftFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Options
  const statusOptions = ["All", "DRAFT", "PLANNED", "SCHEDULED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
  const priorityOptions = ["All", "HIGH", "MEDIUM", "LOW"];
  const shiftOptions = ["All", "MORNING", "EVENING", "NIGHT"];

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    planned: orders.filter(o => o.status === 'PLANNED' || o.status === 'SCHEDULED').length,
    onHold: orders.filter(o => o.status === 'ON_HOLD').length,
  }), [orders]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, priorityFilter, shiftFilter, timeFilter, customRange]);

  const handleTimeFilterChange = (value: TimeFilter) => {
    if (value === "Custom") { setIsCalendarOpen(true); setIsTimeDropdownOpen(false); }
    else { setTimeFilter(value); setIsTimeDropdownOpen(false); setIsCalendarOpen(false); setCustomRange({ start: "", end: "" }); }
  };

  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) { alert("Please select date range"); return; }
    setTimeFilter("Custom"); setIsCalendarOpen(false); setIsTimeDropdownOpen(false);
  };

  const getFilterDisplayText = () => {
    if (timeFilter === "Custom" && customRange.start && customRange.end) return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    return timeFilter;
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    if (searchQuery) filtered = filtered.filter(o => o.productionOrderId.toLowerCase().includes(searchQuery.toLowerCase()) || o.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (statusFilter !== "All") filtered = filtered.filter(o => o.status === statusFilter);
    if (priorityFilter !== "All") filtered = filtered.filter(o => o.priority === priorityFilter);
    if (shiftFilter !== "All") filtered = filtered.filter(o => o.shift === shiftFilter);
    
    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (timeFilter === "Weekly") { const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24); return diffDays <= 7 && diffDays >= 0; }
      if (timeFilter === "Monthly") return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Quarterly") return Math.floor(orderDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Yearly") return orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Custom" && customRange.start && customRange.end) { const start = new Date(customRange.start); const end = new Date(customRange.end); return orderDate >= start && orderDate <= end; }
      return true;
    });
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, statusFilter, priorityFilter, shiftFilter, timeFilter, customRange]);

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

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length && paginatedOrders.length > 0) setSelectedIds([]);
    else setSelectedIds(paginatedOrders.map(o => o.id));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this production order?")) setOrders(orders.filter(o => o.id !== id));
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} order(s)?`)) setOrders(orders.filter(o => !selectedIds.includes(o.id)));
    setSelectedIds([]);
  };

  const handleViewDetails = (order: ProductionOrder) => { setSelectedOrder(order); setShowDetailsModal(true); };


  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Production Orders</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage and track all production orders </p>
          </div>

          {/* Global Time Filter */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-orange-500" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"].map(tab => (
                  <button key={tab} onClick={() => handleTimeFilterChange(tab as TimeFilter)} className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>{tab}</button>
                ))}
                <button onClick={() => handleTimeFilterChange("Custom")} className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === "Custom" ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>Custom</button>
              </div>
            )}
            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                <div className="space-y-3">
                  <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <input type="date" value={customRange.end} min={customRange.start} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <button onClick={handleCustomApply} className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600">Apply Range</button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm"><p className="text-xs text-gray-500">Total Orders</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm"><p className="text-xs text-gray-500">In Progress</p><p className="text-2xl font-bold">{stats.inProgress}</p></div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-green-500 shadow-sm"><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold">{stats.completed}</p></div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-purple-500 shadow-sm"><p className="text-xs text-gray-500">Planned/Scheduled</p><p className="text-2xl font-bold">{stats.planned}</p></div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-yellow-500 shadow-sm"><p className="text-xs text-gray-500">On Hold</p><p className="text-2xl font-bold">{stats.onHold}</p></div>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search by PO ID or product..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative">
                <button onClick={() => setIsStatusOpen(!isStatusOpen)} className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}>
                  {statusFilter === "All" ? "Status" : statusFilter.replace("_", " ")} <ChevronDown size={14} className={isStatusOpen ? "rotate-180" : ""} />
                </button>
                {isStatusOpen && (<div className="absolute right-0 mt-2 w-40 bg-white border rounded-2xl shadow-2xl z-50 py-2">{statusOptions.map(opt => (<button key={opt} onClick={() => { setStatusFilter(opt); setIsStatusOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}>{opt === "All" ? "All" : opt.replace("_", " ")}</button>))}</div>)}
              </div>
              {/* Priority Filter */}
              <div className="relative">
                <button onClick={() => setIsPriorityOpen(!isPriorityOpen)} className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${priorityFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}>
                  {priorityFilter === "All" ? "Priority" : priorityFilter} <ChevronDown size={14} className={isPriorityOpen ? "rotate-180" : ""} />
                </button>
                {isPriorityOpen && (<div className="absolute right-0 mt-2 w-32 bg-white border rounded-2xl shadow-2xl z-50 py-2">{priorityOptions.map(opt => (<button key={opt} onClick={() => { setPriorityFilter(opt); setIsPriorityOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${priorityFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}>{opt}</button>))}</div>)}
              </div>
              {/* Shift Filter */}
              <div className="relative">
                <button onClick={() => setIsShiftOpen(!isShiftOpen)} className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${shiftFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}>
                  {shiftFilter === "All" ? "Shift" : getShiftLabel(shiftFilter as Shift)} <ChevronDown size={14} className={isShiftOpen ? "rotate-180" : ""} />
                </button>
                {isShiftOpen && (<div className="absolute right-0 mt-2 w-40 bg-white border rounded-2xl shadow-2xl z-50 py-2">{shiftOptions.map(opt => (<button key={opt} onClick={() => { setShiftFilter(opt); setIsShiftOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${shiftFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}>{opt === "All" ? "All" : getShiftLabel(opt as Shift)}</button>))}</div>)}
              </div>
              <button disabled={selectedIds.length === 0} onClick={handleBulkDelete} className={`p-3 rounded-xl ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}><Trash2 size={20} /></button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50/50">
                <th className="w-12 p-5 text-center border-b border-slate-100"><input type="checkbox" className="accent-orange-500 w-4 h-4" checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length} onChange={toggleSelectAll} /></th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PO ID</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PRODUCT</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">QTY</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">COMPLETED</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">DEADLINE</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">SHIFT</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PRIORITY</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">STATUS</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PROGRESS</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">ACTIONS</th>
               </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map(order => (
                  <tr key={order.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center"><input type="checkbox" className="accent-orange-500 w-4 h-4" checked={selectedIds.includes(order.id)} onChange={() => { if (selectedIds.includes(order.id)) setSelectedIds(selectedIds.filter(id => id !== order.id)); else setSelectedIds([...selectedIds, order.id]); }} /></td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{order.productionOrderId}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.productName}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.quantity.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.completedQuantity.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{formatDate(order.deadline)}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{getShiftLabel(order.shift)}</td>
                    <td className="px-4 py-4 text-center"><PriorityBadge priority={order.priority} /></td>
                    <td className="px-4 py-4 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-4"><div className="flex items-center justify-center gap-2"><div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${order.progress}%` }} /></div><span className="text-[11px] font-semibold">{order.progress}%</span></div></td>
                    <td className="px-4 py-4"><div className="flex justify-center gap-2"><button onClick={() => handleViewDetails(order)} className="p-1.5 text-slate-400 hover:text-orange-500"><Eye size={16} /></button><button className="p-1.5 text-slate-400 hover:text-blue-500"><Edit size={16} /></button><button onClick={() => handleDelete(order.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (<div className="py-32 text-center"><div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4"><Factory className="text-slate-200" size={40} /></div><h3 className="text-lg font-bold text-slate-800">No Production Orders Found</h3></div>)}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase">Showing {(currentPage-1)*itemsPerPage+1} to {Math.min(currentPage*itemsPerPage, filteredOrders.length)} of {filteredOrders.length} Orders</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"><ChevronLeft size={18} /></button>
                <div className="flex gap-1.5">{getPageNumbers().map((page, i) => page === "..." ? <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span> : <button key={i} onClick={() => setCurrentPage(page as number)} className={`min-w-10 h-10 rounded-xl text-xs font-bold ${currentPage === page ? "bg-orange-500 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}>{page}</button>)}</div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"><ChevronRight size={18} /></button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between"><div><h2 className="text-xl font-bold">{selectedOrder.productionOrderId}</h2><p className="text-sm text-gray-500">{selectedOrder.productName}</p></div><button onClick={() => setShowDetailsModal(false)} className="text-gray-400">✕</button></div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Sales Order</label><p className="font-semibold">{selectedOrder.salesOrderId}</p></div><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Quantity</label><p className="font-semibold">{selectedOrder.quantity.toLocaleString()}</p></div><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Completed</label><p className="font-semibold text-green-600">{selectedOrder.completedQuantity.toLocaleString()}</p></div><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Rejected</label><p className="font-semibold text-red-600">{selectedOrder.rejectedQuantity.toLocaleString()}</p></div></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4"><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Machine</label><p className="font-semibold">{selectedOrder.assignedMachine || "Not Assigned"}</p></div><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Operator</label><p className="font-semibold">{selectedOrder.assignedOperator || "Not Assigned"}</p></div><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Shift</label><p className="font-semibold">{getShiftLabel(selectedOrder.shift)}</p></div></div>
              <div className="grid grid-cols-2 gap-4"><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Start Date</label><p className="font-semibold">{formatDate(selectedOrder.startDate) || "Not Started"}</p></div><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Deadline</label><p className="font-semibold">{formatDate(selectedOrder.deadline)}</p></div></div>
              <div><div className="bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${selectedOrder.progress}%` }} /></div><p className="text-right text-sm mt-1">{selectedOrder.progress}% Complete</p></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end"><button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-gray-100 rounded-xl">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionOrderList;