import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Coffee,
  Play,
  ShieldAlert,
  Zap,
  Factory,
  User,
  Eye,
  Search,
  RefreshCw,
  Calendar,
  QrCode,
  Camera,
  X,
  ChevronDown,
  Filter,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type MachineStatus = "Running" | "Idle" | "Down" | "Warning";
type Shift = "MORNING" | "EVENING" | "NIGHT";

interface MachineStation {
  id: string;
  name: string;
  status: MachineStatus;
  operator: string;
  operatorId: string;
  currentTask: string;
  productionOrderId: string;
  progress: number;
  output: string;
  completed: number;
  total: number;
  efficiency: number;
  shift: Shift;
  lastUpdated: string;
}

interface ActivityItem {
  id: string;
  operatorName: string;
  operatorId: string;
  action: string;
  details: string;
  timestamp: string;
  icon: React.ReactNode;
}

// ==================== Mock Data ====================
const initialStations: MachineStation[] = [
  { id: "WS-01", name: "CNC Milling X1", status: "Running", operator: "John Doe", operatorId: "OP001", currentTask: "M12 Bolts", productionOrderId: "PO-001", progress: 68, output: "3,400 / 5,000", completed: 3400, total: 5000, efficiency: 94, shift: "MORNING", lastUpdated: "2024-05-20T10:30:00Z" },
  { id: "WS-02", name: "Laser Cutter v2", status: "Warning", operator: "Sarah Smith", operatorId: "OP004", currentTask: "Frame Assembly", productionOrderId: "PO-002", progress: 24, output: "60 / 250", completed: 60, total: 250, efficiency: 82, shift: "MORNING", lastUpdated: "2024-05-20T10:15:00Z" },
  { id: "WS-03", name: "Heavy Press 05", status: "Idle", operator: "None", operatorId: "", currentTask: "Queue: PO-003", productionOrderId: "PO-003", progress: 0, output: "0 / 1,000", completed: 0, total: 1000, efficiency: 0, shift: "EVENING", lastUpdated: "2024-05-20T09:00:00Z" },
  { id: "WS-04", name: "Assembly Line A", status: "Down", operator: "Mike Ross", operatorId: "OP003", currentTask: "System Maintenance", productionOrderId: "", progress: 0, output: "Blocked", completed: 0, total: 0, efficiency: 0, shift: "MORNING", lastUpdated: "2024-05-20T08:45:00Z" },
  { id: "WS-05", name: "Injection Molder", status: "Running", operator: "Sarah Wilson", operatorId: "OP004", currentTask: "Plastic Containers", productionOrderId: "PO-003", progress: 45, output: "450 / 1,000", completed: 450, total: 1000, efficiency: 88, shift: "NIGHT", lastUpdated: "2024-05-20T11:00:00Z" },
  { id: "WS-06", name: "Quality Station", status: "Idle", operator: "Mike Johnson", operatorId: "OP003", currentTask: "Pending Inspection", productionOrderId: "PO-001", progress: 0, output: "0 / 5,000", completed: 0, total: 5000, efficiency: 0, shift: "EVENING", lastUpdated: "2024-05-20T10:00:00Z" },
];

const initialActivities: ActivityItem[] = [
  { id: "1", operatorName: "John Doe", operatorId: "OP001", action: "Completed Setup", details: "CNC Machine B setup completed", timestamp: "2024-05-20T10:25:00Z", icon: <CheckCircle2 size={14} /> },
  { id: "2", operatorName: "Mike Ross", operatorId: "OP003", action: "Requested Downtime", details: "Assembly line maintenance request", timestamp: "2024-05-20T10:00:00Z", icon: <ShieldAlert size={14} /> },
  { id: "3", operatorName: "Sarah Smith", operatorId: "OP002", action: "Break Started", details: "Morning break - 30 minutes", timestamp: "2024-05-20T09:30:00Z", icon: <Coffee size={14} /> },
  { id: "4", operatorName: "Sarah Wilson", operatorId: "OP004", action: "Task Started", details: "Started injection molding run", timestamp: "2024-05-20T09:00:00Z", icon: <Play size={14} /> },
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: MachineStatus }> = ({ status }) => {
  const styles: Record<MachineStatus, string> = {
    Running: "bg-teal-100 text-teal-700 border-teal-200",
    Warning: "bg-amber-100 text-amber-700 border-amber-200",
    Idle: "bg-slate-100 text-slate-600 border-slate-200",
    Down: "bg-red-100 text-red-700 border-red-200"
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};
const ShiftBadge: React.FC<{ shift: Shift }> = ({ shift }) => {
  const styles: Record<Shift, string> = {
    MORNING: "bg-blue-100 text-blue-700 border-blue-200",
    EVENING: "bg-orange-100 text-orange-700 border-orange-200",
    NIGHT: "bg-purple-100 text-purple-700 border-purple-200"
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[shift]}`}>
      {getShiftLabel(shift)}
    </span>
  );
};

const getShiftLabel = (shift: Shift) => {
  const labels: Record<Shift, string> = { MORNING: "Morning", EVENING: "Evening", NIGHT: "Night" };
  return labels[shift];
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return formatDate(dateString);
};

// ==================== Main Component ====================
const ShopFloorExecution: React.FC = () => {
  // Refs for outside click detection
  const timeFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const shiftFilterRef = useRef<HTMLDivElement>(null);

  // State
  const [stations, setStations] = useState<MachineStation[]>(initialStations);
  const [activities] = useState<ActivityItem[]>(initialActivities);
  const [selectedStation, setSelectedStation] = useState<MachineStation | null>(null);
  const [showStationModal, setShowStationModal] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [shiftFilter, setShiftFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const statusOptions = ["All", "Running", "Warning", "Idle", "Down"];
  const shiftOptions = ["All", "MORNING", "EVENING", "NIGHT"];

  // Stats
  const stats = useMemo(() => ({
    total: stations.length,
    running: stations.filter(s => s.status === "Running").length,
    warning: stations.filter(s => s.status === "Warning").length,
    idle: stations.filter(s => s.status === "Idle").length,
    down: stations.filter(s => s.status === "Down").length,
    avgEfficiency: stations.filter(s => s.efficiency > 0).length > 0
      ? Math.round(stations.filter(s => s.efficiency > 0).reduce((acc, s) => acc + s.efficiency, 0) / stations.filter(s => s.efficiency > 0).length)
      : 0,
    totalOutput: stations.reduce((acc, s) => acc + s.completed, 0),
    totalTarget: stations.reduce((acc, s) => acc + s.total, 0),
  }), [stations]);

  // Handle outside clicks for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Time & Calendar
      if (timeFilterRef.current && !timeFilterRef.current.contains(target)) {
        setIsTimeDropdownOpen(false);
        setIsCalendarOpen(false);
      }

      // Status Filter
      if (activeDropdown === "status" && statusFilterRef.current && !statusFilterRef.current.contains(target)) {
        setActiveDropdown(null);
      }

      // Shift Filter
      if (activeDropdown === "shift" && shiftFilterRef.current && !shiftFilterRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, shiftFilter, timeFilter, customRange]);

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
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
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

  // Filter logic
  const filteredStations = useMemo(() => {
    let filtered = [...stations];
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.currentTask.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "All") filtered = filtered.filter(s => s.status === statusFilter);
    if (shiftFilter !== "All") filtered = filtered.filter(s => s.shift === shiftFilter);

    filtered = filtered.filter((station) => {
      const stationDate = new Date(station.lastUpdated);
      const now = new Date();
      if (timeFilter === "Weekly") {
        const diffDays = (now.getTime() - stationDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays >= 0;
      }
      if (timeFilter === "Monthly") return stationDate.getMonth() === now.getMonth() && stationDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Quarterly") return Math.floor(stationDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && stationDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Yearly") return stationDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Custom" && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        return stationDate >= start && stationDate <= end;
      }
      return true;
    });
    return filtered;
  }, [stations, searchQuery, statusFilter, shiftFilter, timeFilter, customRange]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const paginatedStations = filteredStations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this workstation?")) {
      setStations(stations.filter((s) => s.id !== id));
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} workstation(s)?`)) {
      setStations(stations.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleViewStation = (station: MachineStation) => {
    setSelectedStation(station);
    setShowStationModal(true);
  };

  const displayedActivities = showAllActivities ? activities : activities.slice(0, 3);
  const overallProgress = stats.totalTarget > 0 ? Math.round((stats.totalOutput / stats.totalTarget) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Shop Floor</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Monitoring and execution overview</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleRefresh} className="p-2.5 bg-white border border-slate-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium flex items-center gap-2">
              <QrCode size={16} /> Scan QR
            </button>
            <button className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg shadow-orange-500/20">
              <Camera size={16} /> Capture
            </button>

            {/* Global Time Filter */}
            <div className="relative" ref={timeFilterRef}>
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
              >
                <Filter size={16} className="text-orange-500" />
                <span>{getFilterDisplayText()}</span>
                <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
              </button>

              {isTimeDropdownOpen && !isCalendarOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-40 overflow-hidden">
                  {["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tab}
                    </button>
                  ))}
                  <button
                    onClick={() => handleTimeFilterChange("Custom")}
                    className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === "Custom" ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    Custom
                  </button>
                </div>
              )}

              {isCalendarOpen && (
                <div className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-2xl z-50 w-72">
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <input
                      type="date"
                      value={customRange.end}
                      min={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      onClick={handleCustomApply}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Plant OEE</p><Zap size={18} className="text-orange-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{stats.avgEfficiency}%</h3>
            <p className="text-xs text-green-600 mt-1">↑ 5% increase</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-teal-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Target Progress</p><Activity size={18} className="text-teal-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{overallProgress}%</h3>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${overallProgress}%` }} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Stations</p><Factory size={18} className="text-blue-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{stats.running}/{stats.total}</h3>
            <p className="text-xs text-gray-500 mt-1">{stats.down} offline, {stats.warning} issues</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Staffing</p><User size={18} className="text-purple-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{new Set(stations.filter(s => s.operator !== "None").map(s => s.operatorId)).size}</h3>
            <p className="text-xs text-gray-500 mt-1">Active operators</p>
          </div>
        </div>

        {/* Workstation Grid Content */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search station, operator or task..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative" ref={statusFilterRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <Filter size={14} />
                  {statusFilter === "All" ? "Status" : statusFilter}
                  <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                    {statusOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setStatusFilter(opt); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shift Filter */}
              <div className="relative" ref={shiftFilterRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "shift" ? null : "shift")}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${shiftFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <Calendar size={14} />
                  {shiftFilter === "All" ? "Shift" : getShiftLabel(shiftFilter as Shift)}
                  <ChevronDown size={14} className={activeDropdown === "shift" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "shift" && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                    {shiftOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setShiftFilter(opt); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${shiftFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}
                      >
                        {opt === "All" ? "All Shifts" : getShiftLabel(opt as Shift)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={selectedIds.length === 0}
                onClick={handleBulkDelete}
                className={`p-3 rounded-xl ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Cards Display */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStations.map((station) => (
                <div key={station.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="accent-orange-500 w-4 h-4 cursor-pointer mt-1"
                        checked={selectedIds.includes(station.id)}
                        onChange={() => {
                          if (selectedIds.includes(station.id))
                            setSelectedIds(selectedIds.filter((id) => id !== station.id));
                          else setSelectedIds([...selectedIds, station.id]);
                        }}
                      />
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-400 mb-0.5">{station.id}</p>
                        <h3 className="text-base font-bold text-gray-800">{station.name}</h3>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleViewStation(station)} className="p-1.5 text-gray-400 hover:text-orange-500 transition rounded-lg"><Eye size={16} /></button>
                      <button onClick={() => handleDelete(station.id)} className="p-1.5 text-gray-400 hover:text-rose-600 transition rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <div className="mb-3 flex gap-2">
                    <StatusBadge status={station.status} />

                    <ShiftBadge shift={station.shift} />
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Current Task</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{station.currentTask}</p>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className="text-gray-800">{station.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${station.status === "Running" ? "bg-teal-500" :
                          station.status === "Warning" ? "bg-amber-500" :
                            station.status === "Down" ? "bg-red-500" : "bg-gray-400"
                          }`}
                        style={{ width: `${station.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-gray-400" />
                      <p className="text-xs font-medium text-gray-600">
                        {station.operator === "None" ? "Unassigned" : station.operator.split(' ')[0]}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatTime(station.lastUpdated)}</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredStations.length === 0 && (
              <div className="py-32 text-center">
                <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                  <Factory className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Stations Matching Filters</h3>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStations.length)} of {filteredStations.length} Stations
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"
                >
                  <ChevronDown size={18} className="rotate-90" />
                </button>
                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span> : (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(page as number)}
                        className={`min-w-10 h-10 rounded-xl text-xs font-bold ${currentPage === page ? "bg-orange-500 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"
                >
                  <ChevronDown size={18} className="-rotate-90" />
                </button>
              </div>
            </footer>
          )}
        </div>

        {/* Activity & Shift Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-bold text-gray-800 flex items-center gap-2"><User size={18} className="text-orange-500" /> Recent Activity</h2>
              <button onClick={() => setShowAllActivities(!showAllActivities)} className="text-[10px] font-bold text-orange-500 hover:text-orange-600">
                {showAllActivities ? "Show Less" : "View All"}
              </button>
            </div>
            <div className="space-y-4">
              {displayedActivities.map(act => (
                <div key={act.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">{act.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800 leading-tight"><strong>{act.operatorName}</strong> • {act.action}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{formatTime(act.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={18} className="text-orange-500" /> Shift Info</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Current Shift:</span><span className="font-semibold">Morning</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Personnel:</span><span className="font-semibold">12 Assigned</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Progress:</span><span className="font-semibold">65% of daily target</span></div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: "65%" }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Station Modal */}
      {showStationModal && selectedStation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <div><h2 className="text-xl font-bold">{selectedStation.name}</h2><p className="text-sm text-gray-500">{selectedStation.id}</p></div>
              <button onClick={() => setShowStationModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Status</label><div className="mt-1"><StatusBadge status={selectedStation.status} /></div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Operator</label><p className="font-semibold">{selectedStation.operator}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Shift</label><p className="font-semibold">{getShiftLabel(selectedStation.shift)}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Efficiency</label><p className="font-bold text-orange-600">{selectedStation.efficiency}%</p></div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <label className="text-xs text-gray-500 uppercase">Production Progress</label>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${selectedStation.progress}%` }} />
                </div>
                <p className="text-right text-sm mt-1 font-bold">{selectedStation.progress}% ({selectedStation.output})</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <label className="text-xs text-gray-500 uppercase">Current Task</label>
                <p className="font-semibold mt-1">{selectedStation.currentTask}</p>
                <p className="text-xs text-gray-400 mt-0.5">PO: {selectedStation.productionOrderId}</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3 z-10">
              <button onClick={() => setShowStationModal(false)} className="px-6 py-2 bg-gray-100 rounded-xl text-sm font-bold">Close</button>
              <button className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20">Station Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFloorExecution;