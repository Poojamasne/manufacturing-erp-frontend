import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Factory,
  Package,
  AlertCircle,
  Play,
  Printer,
  ClipboardList,
  Calendar,
  X,
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
  workInstructions: string;
  createdAt: string;
}

interface MaterialRequirement {
  materialName: string;
  requiredQty: number;
  availableQty: number;
  shortage: number;
  unit: string;
  status?: string;
}

// ==================== Mock Data ====================
const productionOrders: ProductionOrder[] = [
  { id: "1", productionOrderId: "PO-001", salesOrderId: "SO-001", productName: "Industrial Bolt M12", quantity: 5000, completedQuantity: 3250, rejectedQuantity: 45, deadline: "2024-05-20", startDate: "2024-05-15", status: "IN_PROGRESS", priority: "HIGH", progress: 65, shift: "MORNING", assignedMachine: "CNC Machine B", assignedOperator: "John Doe", workInstructions: "Set CNC parameters to 1200 RPM. Use cooling fluid every 50 units.", createdAt: "2024-05-14" },
  { id: "2", productionOrderId: "PO-002", salesOrderId: "SO-002", productName: "Aluminum Frame 4x4", quantity: 250, completedQuantity: 0, rejectedQuantity: 0, deadline: "2024-05-18", startDate: "", status: "PLANNED", priority: "HIGH", progress: 0, shift: "MORNING", assignedMachine: "", assignedOperator: "", workInstructions: "", createdAt: "2024-05-12" },
  { id: "3", productionOrderId: "PO-003", salesOrderId: "SO-003", productName: "Plastic Container L", quantity: 1000, completedQuantity: 300, rejectedQuantity: 12, deadline: "2024-05-22", startDate: "2024-05-17", status: "ON_HOLD", priority: "MEDIUM", progress: 30, shift: "EVENING", assignedMachine: "Injection Molder", assignedOperator: "Sarah Wilson", workInstructions: "Set mold temperature to 220°C. Cycle time 45 seconds.", createdAt: "2024-05-13" },
  { id: "4", productionOrderId: "PO-004", salesOrderId: "SO-004", productName: "Rubber Gasket Set", quantity: 3000, completedQuantity: 3000, rejectedQuantity: 28, deadline: "2024-05-19", startDate: "2024-05-10", status: "COMPLETED", priority: "HIGH", progress: 100, shift: "MORNING", assignedMachine: "Assembly Line 1", assignedOperator: "Jane Smith", workInstructions: "Inspect each gasket for defects. Package in sets of 50.", createdAt: "2024-05-09" },
  { id: "5", productionOrderId: "PO-005", salesOrderId: "SO-005", productName: "Steel Plates 6mm", quantity: 1500, completedQuantity: 0, rejectedQuantity: 0, deadline: "2024-05-25", startDate: "", status: "SCHEDULED", priority: "MEDIUM", progress: 0, shift: "NIGHT", assignedMachine: "CNC Machine A", assignedOperator: "Mike Johnson", workInstructions: "Cut to 300x300mm tolerance ±0.5mm", createdAt: "2024-05-15" },
  { id: "6", productionOrderId: "PO-006", salesOrderId: "SO-006", productName: "Copper Wires", quantity: 8000, completedQuantity: 0, rejectedQuantity: 0, deadline: "2024-05-28", startDate: "", status: "DRAFT", priority: "LOW", progress: 0, shift: "MORNING", assignedMachine: "", assignedOperator: "", workInstructions: "", createdAt: "2024-05-16" },
];

const materialRequirements: MaterialRequirement[] = [
  { materialName: "Steel Rod 10mm", requiredQty: 5000, availableQty: 3200, shortage: 1800, unit: "pcs", status: "CRITICAL" },
  { materialName: "Aluminum Sheet", requiredQty: 250, availableQty: 250, shortage: 0, unit: "sheets", status: "OK" },
  { materialName: "Plastic Granules", requiredQty: 1000, availableQty: 450, shortage: 550, unit: "kg", status: "CRITICAL" },
  { materialName: "Rubber Compound", requiredQty: 3000, availableQty: 3000, shortage: 0, unit: "kg", status: "OK" },
  { materialName: "Copper Wire", requiredQty: 8000, availableQty: 2000, shortage: 6000, unit: "mtr", status: "CRITICAL" },
];

const trendData = [
  { label: "Shift 1", actual: 72, target: 80 },
  { label: "Shift 2", actual: 84, target: 80 },
  { label: "Shift 3", actual: 68, target: 80 },
  { label: "Shift 4", actual: 90, target: 80 },
  { label: "Shift 5", actual: 82, target: 80 },
  { label: "Shift 6", actual: 76, target: 80 },
  { label: "Shift 7", actual: 88, target: 80 },
];

const downtimeBreakdown = [
  { label: "Maintenance", value: 45, description: "Planned and reactive equipment work", color: "orange" },
  { label: "Material wait", value: 30, description: "Material not staged on time", color: "blue" },
  { label: "Changeover", value: 15, description: "Tooling and line setup time", color: "emerald" },
  { label: "Other", value: 10, description: "Minor stops and approvals", color: "slate" },
];

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const getStatusBadge = (status: ProductionOrderStatus) => {
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
  return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border whitespace-nowrap ${styles[status]}`}>{labels[status]}</span>;
};

const getPriorityBadge = (priority: Priority) => {
  const styles: Record<Priority, string> = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-[#f3f4e6] border-[#f3f4e6]"
  };
  return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border whitespace-nowrap ${styles[priority]}`}>{priority}</span>;
};

const getShiftLabel = (shift: Shift) => {
  const labels: Record<Shift, string> = { MORNING: "Morning", EVENING: "Evening", NIGHT: "Night" };
  return labels[shift];
};

const ProductionReports: React.FC = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const shiftDropdownRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [shiftFilter, setShiftFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hoveredShift, setHoveredShift] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<"orders" | "materials">("orders");
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [materialAlerts, setMaterialAlerts] = useState<MaterialRequirement[]>(materialRequirements);

  // Options
  const statusOptions = ["All", "DRAFT", "PLANNED", "SCHEDULED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
  const priorityOptions = ["All", "HIGH", "MEDIUM", "LOW"];
  const shiftOptions = ["All", "MORNING", "EVENING", "NIGHT"];

  // Stats
  const stats = useMemo(() => ({
    totalOrders: productionOrders.length,
    inProgress: productionOrders.filter(o => o.status === "IN_PROGRESS").length,
    completed: productionOrders.filter(o => o.status === "COMPLETED").length,
    planned: productionOrders.filter(o => o.status === "PLANNED" || o.status === "SCHEDULED").length,
    onHold: productionOrders.filter(o => o.status === "ON_HOLD").length,
    materialShortages: materialAlerts.filter(m => m.shortage > 0).length,
  }), [materialAlerts]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) setActiveDropdown(null);
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) setActiveDropdown(null);
      if (shiftDropdownRef.current && !shiftDropdownRef.current.contains(event.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    let filtered = [...productionOrders];

    if (searchQuery) {
      filtered = filtered.filter(o =>
        o.productionOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.salesOrderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
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
  }, [searchQuery, statusFilter, priorityFilter, shiftFilter, timeFilter, customRange]);

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

  const handleViewDetails = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  //eslint-disable-next-line react-hooks/exhaustive-deps
  const handleDelete = (_id: string) => {
    if (window.confirm("Delete this production order?")) {
      // In a real app, you would call an API here
      setSuccessMessage("Production order deleted successfully!");
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} order(s)?`)) {
      setSuccessMessage(`${selectedIds.length} production order(s) deleted successfully!`);
      setSelectedIds([]);
    }
  };

  const handleCreatePO = (materialName: string) => {
    setMaterialAlerts(prev =>
      prev.map(m => m.materialName === materialName && m.shortage > 0
        ? { ...m, shortage: 0, status: "OK" }
        : m
      )
    );
    setSuccessMessage(`Purchase Order created for ${materialName}!`);
  };

  const bestShift = trendData.reduce((best, current) => (current.actual > best.actual ? current : best), trendData[0]);
  const totalDowntimeMinutes = 242;
  const averageEfficiency = Math.round(trendData.reduce((sum, p) => sum + p.actual, 0) / trendData.length);
  const shortageMaterials = materialAlerts.filter(m => m.shortage > 0);
  const maxValue = Math.max(...trendData.map(d => Math.max(d.actual, d.target)));
  const yAxisSteps = 5;
  const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) => Math.round((maxValue / yAxisSteps) * i));

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Success Toast Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Production Reports
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Analyze production performance and material requirements
            </p>
          </div>

          {/* Global Time Filter */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-4 py-2 outline-none rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map(tab => (
                  <button key={tab} onClick={() => handleTimeFilterChange(tab as TimeFilter)} className={` outline-none w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>
                    {tab}
                  </button>
                ))}
                <button onClick={() => handleTimeFilterChange("Custom")} className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === "Custom" ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>Custom</button>
              </div>
            )}
            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                <div className="space-y-3">
                  <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <input type="date" value={customRange.end} min={customRange.start} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <button onClick={handleCustomApply} className="w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#f67317]">Apply Range</button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Stats Cards - Matching Dashboard Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Total Orders</p>
              <Factory size={20} className="text-[#F59E0B]" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{stats.totalOrders}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">In Progress</p>
              <Play size={20} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{stats.inProgress}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Completed</p>
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{stats.completed}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-purple-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Scheduled</p>
              <Calendar size={20} className="text-purple-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{stats.planned}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Material Shortages</p>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-red-600">{stats.materialShortages}</h3>
          </div>
        </div>

        {/* Material Shortages Alert - Matching Dashboard Style */}
        {!isAlertDismissed && shortageMaterials.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 relative">
            <button onClick={() => setIsAlertDismissed(true)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition">
              <X size={20} />
            </button>
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={22} />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-3">Critical Material Shortages Alert</h4>
                <div className="space-y-3">
                  {shortageMaterials.map((material, idx) => (
                    <div key={idx} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl">
                      <span className="font-medium text-gray-800">{material.materialName}</span>
                      <div className="flex gap-4 text-sm">
                        <span>Required: <strong>{material.requiredQty.toLocaleString()} {material.unit}</strong></span>
                        <span>Available: <strong>{material.availableQty.toLocaleString()} {material.unit}</strong></span>
                        <span className="text-red-600">Shortage: <strong>{material.shortage.toLocaleString()} {material.unit}</strong></span>
                      </div>
                      <button onClick={() => handleCreatePO(material.materialName)} className="px-3 py-1.5 bg-[#F59E0B] text-white rounded-lg text-sm hover:bg-[#f67317] transition">
                        Create PO
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Insights Grid - Matching Dashboard Graph UI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Efficiency Trend Chart - Same as Dashboard Production Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">
                  EFFICIENCY TREND ANALYSIS
                </h3>
                <p className="text-sm text-gray-400 font-normal mt-1">Actual vs Target Efficiency by Shift</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Actual
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-slate-300" /> Target (80%)
                </div>
              </div>
            </div>

            <div className="h-64 flex">
              {/* Y-Axis */}
              <div className="flex flex-col justify-between h-full text-[11px] text-gray-400 mr-2">
                {[...yAxisValues].reverse().map((val, i) => (
                  <div key={i} className="flex items-start">
                    <span className="-translate-y-1/2">{val}%</span>
                  </div>
                ))}
              </div>

              {/* Graph Area */}
              <div className="flex-1 relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {yAxisValues.map((_, i) => (
                    <div key={i} className="border-t border-gray-200 w-full" />
                  ))}
                </div>

                {/* Bars */}
                <div className="relative flex h-full items-end gap-2">
                  {trendData.map((point, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full">
                      <div className="w-full h-full flex items-end justify-center gap-1">
                        <div
                          className="w-4 bg-slate-300 rounded-t transition-all duration-300"
                          style={{ height: `${(point.target / maxValue) * 100}%` }}
                        />
                        <div
                          className="w-4 bg-[#F59E0B] rounded-t transition-all duration-300 cursor-pointer relative"
                          style={{ height: `${(point.actual / maxValue) * 100}%` }}
                          onMouseEnter={() => setHoveredShift(idx)}
                          onMouseLeave={() => setHoveredShift(null)}
                        />
                      </div>
                      {hoveredShift === idx && (
                        <div className="absolute -top-7 bg-slate-700 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                          {point.actual}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* X-axis Labels */}
                <div className="flex mt-2">
                  {trendData.map((point, idx) => (
                    <div key={idx} className="flex-1 text-center text-[10px] text-gray-500">
                      {point.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-14 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-gray-500">Average:</span>
                  <span className="text-sm font-bold text-gray-800">{averageEfficiency}%</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">Peak:</span>
                  <span className="text-sm font-bold text-emerald-600">{Math.max(...trendData.map(p => p.actual))}%</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">Best Shift:</span>
                  <span className="text-sm font-bold text-amber-500">{bestShift.label}</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-400">Hover bars for details</div>
            </div>
          </div>

          {/* Downtime Causes - Matching Resource Status Style */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PieChart size={16} className="text-rose-500" />
                  <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">DOWNTIME ANALYSIS</h3>
                </div>
                <p className="text-sm text-gray-400">Root Cause Breakdown</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-gray-700">{formatTime(totalDowntimeMinutes)}</p>
                <p className="text-[10px] text-gray-400">total idle time</p>
              </div>
            </div>

            <div className="relative flex justify-center my-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let cumulative = 0;
                    const colors: Record<string, string> = { orange: "#f97316", blue: "#3b82f6", emerald: "#10b981", slate: "#94a3b8" };
                    return downtimeBreakdown.map((item) => {
                      const startAngle = (cumulative / 100) * 360;
                      const endAngle = ((cumulative + item.value) / 100) * 360;
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      const x1 = 50 + 38 * Math.cos(startRad);
                      const y1 = 50 + 38 * Math.sin(startRad);
                      const x2 = 50 + 38 * Math.cos(endRad);
                      const y2 = 50 + 38 * Math.sin(endRad);
                      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                      cumulative += item.value;
                      return (
                        <path
                          key={item.label}
                          d={`M 50 50 L ${x1} ${y1} A 38 38 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[item.color]}
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        />
                      );
                    });
                  })()}
                  <circle cx="50" cy="50" r="22" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-800">{Math.floor(totalDowntimeMinutes / 60)}</p>
                    <p className="text-[9px] text-gray-400">Hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {downtimeBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Toggle - Matching Dashboard Quick Actions Style */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveView("orders")}
            className={`px-4 py-2 outline-none text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeView === "orders"
              ? "bg-[#F59E0B] text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            <Factory size={16} /> Production Orders
          </button>
          <button
            onClick={() => setActiveView("materials")}
            className={`px-4 py-2 outline-none text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeView === "materials"
              ? "bg-[#F59E0B] text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            <Package size={16} /> Material Requirements
          </button>
        </div>

        {/* Production Orders Table - Matching Table Style from Other Pages */}
        {activeView === "orders" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">

            {/* Toolbar */}
            <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  placeholder="Search by PO ID, Sales Order, or Product..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <div className="relative" ref={statusDropdownRef}>
                  <button onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")} className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                    {statusFilter === "All" ? "Status" : statusFilter.replace("_", " ")} <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
                  </button>
                  {activeDropdown === "status" && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl z-50 py-2">
                      {statusOptions.map(opt => (
                        <button key={opt} onClick={() => { setStatusFilter(opt); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}>
                          {opt === "All" ? "All" : opt.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Filter */}
                <div className="relative" ref={priorityDropdownRef}>
                  <button onClick={() => setActiveDropdown(activeDropdown === "priority" ? null : "priority")} className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${priorityFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                    {priorityFilter === "All" ? "Priority" : priorityFilter} <ChevronDown size={14} className={activeDropdown === "priority" ? "rotate-180" : ""} />
                  </button>
                  {activeDropdown === "priority" && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl z-50 py-2">
                      {priorityOptions.map(opt => (
                        <button key={opt} onClick={() => { setPriorityFilter(opt); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${priorityFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shift Filter */}
                <div className="relative" ref={shiftDropdownRef}>
                  <button onClick={() => setActiveDropdown(activeDropdown === "shift" ? null : "shift")} className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${shiftFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                    {shiftFilter === "All" ? "Shift" : getShiftLabel(shiftFilter as Shift)} <ChevronDown size={14} className={activeDropdown === "shift" ? "rotate-180" : ""} />
                  </button>
                  {activeDropdown === "shift" && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl z-50 py-2">
                      {shiftOptions.map(opt => (
                        <button key={opt} onClick={() => { setShiftFilter(opt); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${shiftFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}>
                          {opt === "All" ? "All" : getShiftLabel(opt as Shift)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bulk Delete Button */}
                <button
                  disabled={selectedIds.length === 0}
                  onClick={handleBulkDelete}
                  className={`p-3 rounded-xl ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="w-12 p-5 text-center border-b border-slate-100">
                      <input type="checkbox"
                        className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                        checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-orange-50/20 transition-colors">
                      <td className="p-5 text-center">
                        <input type="checkbox"
                          className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                          checked={selectedIds.includes(order.id)} onChange={() => {
                            if (selectedIds.includes(order.id)) setSelectedIds(selectedIds.filter(id => id !== order.id));
                            else setSelectedIds([...selectedIds, order.id]);
                          }} />
                      </td>
                      <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center whitespace-nowrap">{order.productionOrderId}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-700 text-center truncate max-w-37.5">{order.productName}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-600 text-center">{order.quantity.toLocaleString()}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-600 text-center">{order.completedQuantity.toLocaleString()}</td>
                      <td className={`px-4 py-4 text-[13px] text-center whitespace-nowrap ${new Date(order.deadline) < new Date() && order.status !== "COMPLETED" ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                        {formatDate(order.deadline)}
                      </td>
                      <td className="px-4 py-4 text-[13px] text-slate-600 text-center whitespace-nowrap">{getShiftLabel(order.shift)}</td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">{getPriorityBadge(order.priority)}</td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F59E0B] rounded-full transition-all" style={{ width: `${order.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600">{order.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleViewDetails(order)} className="p-1.5 text-slate-400 hover:text-[#F59E0B] transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDelete(order.id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-center">
                  <div className="p-6 bg-slate-50 rounded-full mb-4">
                    <Factory className="text-slate-200" size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No Production Orders Found</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} Orders
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1.5">
                    {getPageNumbers().map((page, i) => page === "..." ? (<span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span>) : (<button key={i} onClick={() => setCurrentPage(page as number)} className={`min-w-10 h-10 rounded-xl text-xs font-bold ${currentPage === page ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}>{page}</button>))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </footer>
            )}
          </div>
        )}

        {/* Material Requirements Tab */}
        {activeView === "materials" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Bill of Materials & Inventory Check</h3>
              <p className="text-sm text-slate-500 mt-1">Raw material requirements for active production orders</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-left">Material Name</th>
                    <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Required Qty</th>
                    <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Available Qty</th>
                    <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Shortage</th>
                    <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Unit</th>
                    <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {materialAlerts.map((material, idx) => (
                    <tr key={idx} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{material.materialName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center">{material.requiredQty.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-center">{material.availableQty.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-sm text-center font-semibold ${material.shortage > 0 ? "text-red-600" : "text-green-600"}`}>
                        {material.shortage > 0 ? material.shortage.toLocaleString() : "None"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 text-center">{material.unit}</td>
                      <td className="px-6 py-4 text-center">
                        {material.shortage > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                            <AlertCircle size={12} /> Shortage
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-600 text-[10px] font-bold">
                            <CheckCircle size={12} /> Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {material.shortage > 0 && (
                          <button onClick={() => handleCreatePO(material.materialName)} className="outline-none px-4 py-2 bg-[#F59E0B] text-white text-xs font-medium rounded-lg hover:bg-[#f67317] transition">
                            Create PO
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal - Same as Dashboard Modal Style */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedOrder.productionOrderId}</h2>
                <p className="text-sm text-gray-500">{selectedOrder.productName}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Sales Order</label>
                  <p className="font-semibold">{selectedOrder.salesOrderId}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Quantity</label>
                  <p className="font-semibold">{selectedOrder.quantity.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Completed</label>
                  <p className="font-semibold text-green-600">{selectedOrder.completedQuantity.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Rejected</label>
                  <p className="font-semibold text-red-600">{selectedOrder.rejectedQuantity.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Machine</label>
                  <p className="font-semibold">{selectedOrder.assignedMachine || "Not Assigned"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Operator</label>
                  <p className="font-semibold">{selectedOrder.assignedOperator || "Not Assigned"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Shift</label>
                  <p className="font-semibold">{getShiftLabel(selectedOrder.shift)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Start Date</label>
                  <p className="font-semibold">{formatDate(selectedOrder.startDate) || "Not Started"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Deadline</label>
                  <p className="font-semibold">{formatDate(selectedOrder.deadline)}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={16} className="text-blue-600" />
                  <p className="text-sm font-semibold text-blue-800">Work Instructions</p>
                </div>
                <p className="text-sm text-slate-700">{selectedOrder.workInstructions || "Standard operating procedure to be followed. Refer to quality manual for detailed specifications."}</p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500">Production Progress</span>
                  <span className="text-xs font-semibold">{selectedOrder.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: `${selectedOrder.progress}%` }} />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-between">
              <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Close</button>
              <button className="px-6 py-2 bg-[#F59E0B] text-white rounded-xl text-sm font-medium hover:bg-[#f67317] transition-colors flex items-center gap-2">
                <Printer size={16} /> Print Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionReports;