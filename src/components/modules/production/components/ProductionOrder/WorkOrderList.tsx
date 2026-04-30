import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  Eye,
  Play,
  CheckCircle,
  AlertTriangle,
  User,
  Cpu,
  Trash2,
} from "lucide-react";

type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type WorkOrderStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
type Shift = "MORNING" | "EVENING" | "NIGHT";

interface WorkOrder {
  id: string;
  workOrderId: string;
  productionOrderId: string;
  productionOrderName: string;
  taskName: string;
  description: string;
  machineId: string;
  machineName: string;
  operatorId: string;
  operatorName: string;
  shift: Shift;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  status: WorkOrderStatus;
  progress: number;
  instructions: string[];
  safetyNotes: string[];
  createdAt: string;
}

// ==================== Mock Data ====================
const mockWorkOrders: WorkOrder[] = [
  { id: "1", workOrderId: "WO-001", productionOrderId: "PO-001", productionOrderName: "Industrial Bolt M12", taskName: "Raw Material Cutting", description: "Cut steel rods to specified length", machineId: "M001", machineName: "CNC Machine A", operatorId: "OP001", operatorName: "John Doe", shift: "MORNING", startDate: "2024-05-15", endDate: "2024-05-16", estimatedHours: 8, actualHours: 7.5, status: "COMPLETED", progress: 100, instructions: ["Use cutting tool #A12", "Maintain speed at 1500 RPM"], safetyNotes: ["Wear safety goggles", "Keep hands clear"], createdAt: "2024-05-14" },
  { id: "2", workOrderId: "WO-002", productionOrderId: "PO-001", productionOrderName: "Industrial Bolt M12", taskName: "Threading", description: "Create threads on bolts", machineId: "M002", machineName: "CNC Machine B", operatorId: "OP001", operatorName: "John Doe", shift: "MORNING", startDate: "2024-05-16", endDate: "2024-05-18", estimatedHours: 16, actualHours: 14, status: "IN_PROGRESS", progress: 65, instructions: ["Use threading die size M12", "Apply cutting oil"], safetyNotes: ["Watch for hot chips", "Use coolant"], createdAt: "2024-05-15" },
  { id: "3", workOrderId: "WO-003", productionOrderId: "PO-001", productionOrderName: "Industrial Bolt M12", taskName: "Quality Inspection", description: "Inspect finished bolts", machineId: "M005", machineName: "Quality Station", operatorId: "OP003", operatorName: "Mike Johnson", shift: "EVENING", startDate: "2024-05-18", endDate: "2024-05-19", estimatedHours: 8, actualHours: 0, status: "PENDING", progress: 0, instructions: ["Check thread tolerance", "Verify hardness"], safetyNotes: ["Use calibrated gauges"], createdAt: "2024-05-17" },
  { id: "4", workOrderId: "WO-004", productionOrderId: "PO-002", productionOrderName: "Aluminum Frame 4x4", taskName: "Frame Assembly", description: "Assemble aluminum frames", machineId: "M004", machineName: "Assembly Line 1", operatorId: "OP002", operatorName: "Jane Smith", shift: "MORNING", startDate: "2024-05-17", endDate: "2024-05-20", estimatedHours: 24, actualHours: 0, status: "ASSIGNED", progress: 0, instructions: ["Align corners properly", "Secure with screws"], safetyNotes: ["Use safety gloves"], createdAt: "2024-05-16" },
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: WorkOrderStatus }> = ({ status }) => {
  const styles: Record<WorkOrderStatus, string> = {
    PENDING: "bg-gray-100 text-gray-700 border-gray-200",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    BLOCKED: "bg-red-100 text-red-700 border-red-200"
  };
  const labels: Record<WorkOrderStatus, string> = { PENDING: "Pending", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", COMPLETED: "Completed", BLOCKED: "Blocked" };
  return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status]}`}>{labels[status]}</span>;
};

const getShiftLabel = (shift: Shift) => {
  const labels: Record<Shift, string> = { MORNING: "Morning", EVENING: "Evening", NIGHT: "Night" };
  return labels[shift];
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// ==================== Main Component ====================
const WorkOrderList: React.FC = () => {
  // Refs for outside click detection
  const timeFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const shiftFilterRef = useRef<HTMLDivElement>(null);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [shiftFilter, setShiftFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const statusOptions = ["All", "PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "BLOCKED"];
  const shiftOptions = ["All", "MORNING", "EVENING", "NIGHT"];

  // Stats
  const stats = useMemo(() => ({
    total: workOrders.length,
    pending: workOrders.filter(w => w.status === "PENDING").length,
    inProgress: workOrders.filter(w => w.status === "IN_PROGRESS").length,
    completed: workOrders.filter(w => w.status === "COMPLETED").length,
    blocked: workOrders.filter(w => w.status === "BLOCKED").length,
  }), [workOrders]);

  // Handle outside clicks for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Time & Calendar Ref
      if (timeFilterRef.current && !timeFilterRef.current.contains(target)) {
        setIsTimeDropdownOpen(false);
        setIsCalendarOpen(false);
      }

      // Status Ref
      if (statusFilterRef.current && !statusFilterRef.current.contains(target)) {
        if (activeDropdown === "status") setActiveDropdown(null);
      }

      // Shift Ref
      if (shiftFilterRef.current && !shiftFilterRef.current.contains(target)) {
        if (activeDropdown === "shift") setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, shiftFilter, timeFilter, customRange]);

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

  const filteredWorkOrders = useMemo(() => {
    let filtered = [...workOrders];
    if (searchQuery) filtered = filtered.filter(w => w.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()) || w.taskName.toLowerCase().includes(searchQuery.toLowerCase()) || w.productionOrderName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (statusFilter !== "All") filtered = filtered.filter(w => w.status === statusFilter);
    if (shiftFilter !== "All") filtered = filtered.filter(w => w.shift === shiftFilter);

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
  }, [workOrders, searchQuery, statusFilter, shiftFilter, timeFilter, customRange]);

  const totalPages = Math.ceil(filteredWorkOrders.length / itemsPerPage);
  const paginatedOrders = filteredWorkOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this work order?")) {
      setWorkOrders(workOrders.filter((o) => o.id !== id));
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} work order(s)?`)) {
      setWorkOrders(workOrders.filter((o) => !selectedIds.includes(o.id)));
      setSelectedIds([]);
    }
  };

  const handleViewDetails = (order: WorkOrder) => { setSelectedOrder(order); setShowDetailsModal(true); };
  const handleStartTask = (id: string) => {
    setWorkOrders(workOrders.map(w => w.id === id ? { ...w, status: "IN_PROGRESS", progress: 5 } : w));
    alert("Task started successfully!");
  };
  const handleCompleteTask = (id: string) => {
    setWorkOrders(workOrders.map(w => w.id === id ? { ...w, status: "COMPLETED", progress: 100 } : w));
    alert("Task completed!");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Work Orders</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage work order assignments </p>
          </div>

          {/* Global Time Filter */}
          <div className="relative" ref={timeFilterRef}>
            <button onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)} className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-40 overflow-hidden">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map(tab => (
                  <button key={tab} onClick={() => handleTimeFilterChange(tab as TimeFilter)} className={`outline-none w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>{tab}</button>
                ))}
                <button onClick={() => handleTimeFilterChange("Custom")} className={`outline-none w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === "Custom" ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>Custom</button>
              </div>
            )}
            {isCalendarOpen && (
              <div className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-2xl z-50 w-72">
                <div className="space-y-3">
                  <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <input type="date" value={customRange.end} min={customRange.start} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <button onClick={handleCustomApply} className="outline-none w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#f67317]">Apply Range</button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">
              Total Work Orders</p>
            <p className="text-2xl text-gray-700 font-bold">{stats.total}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border-l-4 border-gray-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">
              Pending</p>
            <p className="text-2xl text-gray-700 font-bold">{stats.pending}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">
              In Progress</p>
            <p className="text-2xl text-gray-700 font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-green-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">
              Completed</p>
            <p className="text-2xl text-gray-700 font-bold">{stats.completed}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-red-500 shadow-sm">
            <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">
              Blocked</p>
            <p className="text-2xl text-gray-700 font-bold">{stats.blocked}</p>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search by work order ID or task..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative" ref={statusFilterRef}>
                <button onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")} className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                  {statusFilter === "All" ? "Status" : statusFilter} <ChevronDown size={14} className={activeDropdown === "status" ? "outline-none rotate-180" : ""} />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                    {statusOptions.map(opt => (
                      <button key={opt} onClick={() => { setStatusFilter(opt); setActiveDropdown(null); }} className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
              {/* Shift Filter */}
              <div className="relative" ref={shiftFilterRef}>
                <button onClick={() => setActiveDropdown(activeDropdown === "shift" ? null : "shift")} className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${shiftFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                  {shiftFilter === "All" ? "Shift" : getShiftLabel(shiftFilter as Shift)} <ChevronDown size={14} className={activeDropdown === "shift" ? "outline-none rotate-180" : ""} />
                </button>
                {activeDropdown === "shift" && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                    {shiftOptions.map(opt => (
                      <button key={opt} onClick={() => { setShiftFilter(opt); setActiveDropdown(null); }} className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${shiftFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}>{opt === "All" ? "All" : getShiftLabel(opt as Shift)}</button>
                    ))}
                  </div>
                )}
              </div>
              <button
                disabled={selectedIds.length === 0}
                onClick={handleBulkDelete}
                className={`outline-none p-3 rounded-xl ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}
              >
                <Trash2 size={20} className="outline-none " />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50/50">
                <th className="w-12 p-5 text-center border-b border-slate-100">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                    checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">WO ID</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">TASK</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PO ID</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">MACHINE</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">OPERATOR</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">SHIFT</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">STATUS</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PROGRESS</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">ACTIONS</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map(wo => (
                  <tr key={wo.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                        checked={selectedIds.includes(wo.id)}
                        onChange={() => {
                          if (selectedIds.includes(wo.id))
                            setSelectedIds(selectedIds.filter((id) => id !== wo.id));
                          else setSelectedIds([...selectedIds, wo.id]);
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{wo.workOrderId}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{wo.taskName}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{wo.productionOrderId}</td>
                    <td className="px-4 py-4"><div className="flex items-center justify-center gap-1"><Cpu size={14} className="text-purple-500" /><span className="text-[13px]">{wo.machineName}</span></div></td>
                    <td className="px-4 py-4"><div className="flex items-center justify-center gap-1"><User size={14} className="text-blue-500" /><span className="text-[13px]">{wo.operatorName}</span></div></td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{getShiftLabel(wo.shift)}</td>
                    <td className="px-4 py-4 text-center"><StatusBadge status={wo.status} /></td>
                    <td className="px-4 py-4"><div className="flex items-center justify-center gap-2"><div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${wo.progress}%` }} /></div><span className="text-[11px] font-semibold">{wo.progress}%</span></div></td>
                    <td className="px-4 py-4"><div className="flex justify-center gap-2">
                      <button onClick={() => handleViewDetails(wo)} className="outline-none p-1.5 text-slate-400 hover:text-[#F59E0B]"><Eye size={16} /></button>
                      {wo.status === "PENDING" && <button onClick={() => handleStartTask(wo.id)} className="outline-none p-1.5 text-slate-400 hover:text-green-500"><Play size={16} /></button>}
                      {wo.status === "IN_PROGRESS" && <button onClick={() => handleCompleteTask(wo.id)} className="outline-none p-1.5 text-slate-400 hover:text-green-600"><CheckCircle size={16} /></button>}
                      <button onClick={() => handleDelete(wo.id)} className="outline-none p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWorkOrders.length === 0 && (<div className="py-32 text-center"><div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4"><AlertTriangle className="text-slate-200 outline-none " size={40} /></div><h3 className="text-lg font-bold text-slate-800">No Work Orders Found</h3></div>)}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWorkOrders.length)} of {filteredWorkOrders.length} Work Orders</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="outline-none p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30"><ChevronLeft size={18} /></button>
                <div className="flex gap-1.5">{getPageNumbers().map((page, i) => page === "..." ? <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span> : <button key={i} onClick={() => setCurrentPage(page as number)} className={`outline-none min-w-10 h-10 rounded-xl text-xs font-bold ${currentPage === page ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}>{page}</button>)}</div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="outline-none p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30"><ChevronRight size={18} /></button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Work Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between"><div><h2 className="text-xl font-bold">{selectedOrder.workOrderId}</h2><p className="text-sm text-gray-500">{selectedOrder.taskName}</p></div><button onClick={() => setShowDetailsModal(false)} className="outline-none text-gray-400">✕</button></div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Production Order</label><p className="font-semibold">{selectedOrder.productionOrderName}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Machine</label><p className="font-semibold">{selectedOrder.machineName}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Operator</label><p className="font-semibold">{selectedOrder.operatorName}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Shift</label><p className="font-semibold">{getShiftLabel(selectedOrder.shift)}</p></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Start Date</label><p className="font-semibold">{formatDate(selectedOrder.startDate)}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">End Date</label><p className="font-semibold">{formatDate(selectedOrder.endDate) || "In Progress"}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Est. Hours</label><p className="font-semibold">{selectedOrder.estimatedHours}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500">Actual Hours</label><p className="font-semibold">{selectedOrder.actualHours || 0}</p></div>
              </div>
              <div><h3 className="font-bold mb-2">Work Instructions</h3><div className="bg-gray-50 rounded-xl p-4"><ul className="list-disc list-inside space-y-1">{selectedOrder.instructions.map((inst, i) => <li key={i} className="text-sm">{inst}</li>)}</ul></div></div>
              <div><h3 className="font-bold mb-2">Safety Instructions</h3><div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"><ul className="list-disc list-inside space-y-1">{selectedOrder.safetyNotes.map((note, i) => <li key={i} className="text-sm text-yellow-800">{note}</li>)}</ul></div></div>
              <div><div className="bg-gray-100 rounded-full h-2 overflow-hidden"><div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${selectedOrder.progress}%` }} /></div><p className="text-right text-sm mt-1">{selectedOrder.progress}% Complete</p></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
              {selectedOrder.status === "PENDING" && <button onClick={() => { handleStartTask(selectedOrder.id); setShowDetailsModal(false); }} className="outline-none px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl">Start Task</button>}
              {selectedOrder.status === "IN_PROGRESS" && <button onClick={() => { handleCompleteTask(selectedOrder.id); setShowDetailsModal(false); }} className="outline-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">Complete Task</button>}
              <button onClick={() => setShowDetailsModal(false)} className="outline-none px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderList;