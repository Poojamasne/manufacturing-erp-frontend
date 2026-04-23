import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Filter,
  Factory,
  X,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Users,
  Trash2
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "All Time" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";
type MachineStatus = "Available" | "In Use" | "Maintenance" | "Shutdown";
type OperatorStatus = "Assigned" | "Available" | "At Capacity";
type Shift = "Morning" | "Afternoon" | "Evening";
type ResourceType = "machines" | "operators";

interface Machine {
  id: string;
  name: string;
  type: string;
  status: MachineStatus;
  load: number;
}

interface Operator {
  id: string;
  name: string;
  role: string;
  skill: "Senior" | "Intermediate" | "Junior";
  workload: number;
  status: OperatorStatus;
  shift: Shift;
}

// ==================== Mock Data ====================
const initialMachines: Machine[] = [
  { id: "MAC-101", name: "CNC Milling X1", type: "Heavy Machining", status: "Available", load: 0 },
  { id: "MAC-102", name: "Laser Cutter v2", type: "Precision", status: "In Use", load: 85 },
  { id: "MAC-103", name: "Lathe Pro", type: "Manual", status: "Maintenance", load: 0 },
  { id: "MAC-104", name: "3D Printer Industrial", type: "Additive", status: "Shutdown", load: 0 },
  { id: "MAC-105", name: "Drill Press A", type: "Manual", status: "Available", load: 10 },
  { id: "MAC-106", name: "Hydraulic Press", type: "Heavy", status: "In Use", load: 45 },
];

const initialOperators: Operator[] = [
  { id: "OP-001", name: "John Doe", role: "CNC Specialist", skill: "Senior", workload: 60, status: "Assigned", shift: "Morning" },
  { id: "OP-002", name: "Sarah Smith", role: "Assembly Tech", skill: "Junior", workload: 0, status: "Available", shift: "Afternoon" },
  { id: "OP-003", name: "Mike Ross", role: "Quality Control", skill: "Senior", workload: 100, status: "At Capacity", shift: "Evening" },
  { id: "OP-004", name: "Anna Bell", role: "Logistics", skill: "Intermediate", workload: 20, status: "Available", shift: "Morning" },
  { id: "OP-005", name: "Chris Post", role: "Maintenance", skill: "Senior", workload: 50, status: "Assigned", shift: "Afternoon" },
  { id: "OP-006", name: "Dana White", role: "Operator", skill: "Junior", workload: 10, status: "Available", shift: "Morning" },
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: { [key: string]: string } = {
    Available: "text-teal-600 bg-teal-50 border-teal-100",
    "In Use": "text-blue-600 bg-blue-50 border-blue-100",
    Maintenance: "text-red-600 bg-red-50 border-red-100",
    Shutdown: "text-slate-600 bg-slate-50 border-slate-100",
    Assigned: "text-blue-600 bg-blue-50 border-blue-100",
    "At Capacity": "text-amber-600 bg-amber-50 border-amber-100",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status] || "text-slate-600 bg-slate-50"}`}>
      {status}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const ResourceAllocation: React.FC = () => {
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const resourceFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  // Data States
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [operators] = useState<Operator[]>(initialOperators);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Resource Type Filter (Machine/Operator)
  const [resourceType, setResourceType] = useState<ResourceType>("machines");

  // Pagination States
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);


  // Options for filters
  const statusOptions = resourceType === "machines" 
    ? ["All", "Available", "In Use", "Maintenance", "Shutdown"]
    : ["All", "Assigned", "Available", "At Capacity"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
      if (resourceFilterRef.current && !resourceFilterRef.current.contains(event.target as Node)) setActiveDropdown(null);
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, resourceType]);

  // Get current data based on resource type
  const currentData = useMemo(() => {
    if (resourceType === "machines") {
      return machines.filter(item =>
        (statusFilter === "All" || item.status === statusFilter) &&
        (item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
         item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } else {
      return operators.filter(item =>
        (statusFilter === "All" || item.status === statusFilter) &&
        (item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
         item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [machines, operators, resourceType, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

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

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleViewDetails = (item: any) => {
  console.log("View Details:", item);

  // Example: open modal / alert / navigation
  alert(`Viewing details for ${item.name}`);
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

  const handleUpdateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMachine) {
      setMachines(machines.map(m => m.id === editingMachine.id ? editingMachine : m));
      setEditingMachine(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds([]);
    } else {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedIds(paginatedData.map((item: any) => item.id));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Delete this ${resourceType === "machines" ? "machine" : "operator"}?`)) {
      if (resourceType === "machines") {
        setMachines(machines.filter(m => m.id !== id));
      } else {
        alert(`Would delete operator with id ${id}`);

      }
      // Remove from selectedIds if present
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} ${resourceType}?`)) {
      if (resourceType === "machines") {
        setMachines(machines.filter(m => !selectedIds.includes(m.id)));
      } else {
        alert(`Would delete ${selectedIds.length} operator(s)`);
      }
      setSelectedIds([]);
    }
  };

  const stats = {
    totalMachines: machines.length,
    availableMachines: machines.filter(m => m.status === "Available").length,
    inUseMachines: machines.filter(m => m.status === "In Use").length,
    maintenanceMachines: machines.filter(m => m.status === "Maintenance").length,
    totalOperators: operators.length,
    availableOperators: operators.filter(o => o.status === "Available").length,
    assignedOperators: operators.filter(o => o.status === "Assigned").length,
    atCapacityOperators: operators.filter(o => o.status === "At Capacity").length,
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Resource Allocation</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage machines and operator workloads</p>
          </div>

          {/* Global Time Filter */}
          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-orange-500" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
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
              <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
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
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm">
            <p className="text-xs text-gray-500">Total Machines</p>
            <p className="text-2xl font-bold">{stats.totalMachines}</p>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-teal-600">Available: {stats.availableMachines}</span>
              <span className="text-blue-600">In Use: {stats.inUseMachines}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <p className="text-xs text-gray-500">Maintenance</p>
            <p className="text-2xl font-bold">{stats.maintenanceMachines}</p>
            <p className="text-xs text-red-600 mt-1">Machines in maintenance</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-green-500 shadow-sm">
            <p className="text-xs text-gray-500">Total Operators</p>
            <p className="text-2xl font-bold">{stats.totalOperators}</p>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-teal-600">Available: {stats.availableOperators}</span>
              <span className="text-blue-600">Assigned: {stats.assignedOperators}</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-amber-500 shadow-sm">
            <p className="text-xs text-gray-500">At Capacity</p>
            <p className="text-2xl font-bold">{stats.atCapacityOperators}</p>
            <p className="text-xs text-amber-600 mt-1">Operators at max workload</p>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            {/* Search Bar - Left Side */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder={resourceType === "machines" ? "Search machines..." : "Search operators..."}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters and Actions - Right Side */}
            <div className="flex flex-wrap gap-3">
              {/* Resource Type Filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "resource" ? null : "resource")}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${resourceType !== "machines" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {resourceType === "machines" ? <Factory size={16} /> : <Users size={16} />}
                  {resourceType === "machines" ? "Machines" : "Operators"}
                  <ChevronDown size={14} className={activeDropdown === "resource" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "resource" && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-2xl shadow-2xl z-50 py-2">
                    <button
                      onClick={() => { setResourceType("machines"); setActiveDropdown(null); setSelectedIds([]); setCurrentPage(1); setSearchQuery(""); setStatusFilter("All"); }}
                      className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 flex items-center gap-2 ${resourceType === "machines" ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}
                    >
                      <Factory size={14} /> Machines
                    </button>
                    <button
                      onClick={() => { setResourceType("operators"); setActiveDropdown(null); setSelectedIds([]); setCurrentPage(1); setSearchQuery(""); setStatusFilter("All"); }}
                      className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 flex items-center gap-2 ${resourceType === "operators" ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}
                    >
                      <Users size={14} /> Operators
                    </button>
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {statusFilter === "All" ? "Status" : statusFilter}
                  <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-2xl shadow-2xl z-50 py-2">
                    {statusOptions.map((opt) => (
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

              {/* Bulk Delete Button - Same as Production Orders */}
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
                    <input
                      type="checkbox"
                      className="accent-orange-500 w-4 h-4 cursor-pointer"
                      checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {resourceType === "machines" ? (
                    <>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">MACHINE ID</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">NAME</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">TYPE</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">STATUS</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">LOAD</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">ACTIONS</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">OPERATOR ID</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">NAME</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">SHIFT</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">UTILIZATION</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">STATUS</th>
                      <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">ACTIONS</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((item: any) => (
                  <tr key={item.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => {
                          if (selectedIds.includes(item.id))
                            setSelectedIds(selectedIds.filter(id => id !== item.id));
                          else setSelectedIds([...selectedIds, item.id]);
                        }}
                      />
                    </td>
                    {resourceType === "machines" ? (
                      <>
                        <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center whitespace-nowrap">{item.id}</td>
                        <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{item.name}</td>
                        <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{item.type}</td>
                        <td className="px-4 py-4 text-center"><StatusBadge status={item.status} /></td>
                        <td className="px-4 py-4 text-[13px] font-bold text-slate-800 text-center">{item.load}%</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button onClick={() => setEditingMachine(item)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center whitespace-nowrap">{item.id}</td>
                        <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{item.name}</td>
                        <td className="px-4 py-4 text-[13px] text-slate-700 text-center font-bold">{item.shift}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${item.workload > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${item.workload}%` }} />
                            </div>
                            <span className="text-[10px] font-bold">{item.workload}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center"><StatusBadge status={item.status} /></td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {currentData.length === 0 && (
              <div className="py-32 text-center">
                <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                  {resourceType === "machines" ? <Factory className="text-slate-200" size={40} /> : <Users className="text-slate-200" size={40} />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">No {resourceType === "machines" ? "Machines" : "Operators"} Found</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">No {resourceType} matching your filter criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, currentData.length)} of{" "}
                {currentData.length} {resourceType === "machines" ? "Machines" : "Operators"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={i} className="px-2 text-slate-300">
                        <MoreHorizontal size={14} />
                      </span>
                    ) : (
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Edit Machine Modal */}
      {editingMachine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Edit Machine Info</h3>
              <button onClick={() => setEditingMachine(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateMachine} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Machine Name</label>
                <input type="text" value={editingMachine.name} onChange={e => setEditingMachine({ ...editingMachine, name: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Status</label>
                <select value={editingMachine.status} onChange={e => setEditingMachine({ ...editingMachine, status: e.target.value as MachineStatus })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none">
                  {["Available", "In Use", "Maintenance", "Shutdown"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingMachine(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocation;