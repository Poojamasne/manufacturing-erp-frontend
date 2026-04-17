import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Filter,
  Factory,
  X,
  Eye,
  Pencil
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type MachineStatus = "Available" | "In Use" | "Maintenance" | "Shutdown";
type OperatorStatus = "Assigned" | "Available" | "At Capacity";
type Shift = "Morning" | "Afternoon" | "Evening";

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
];

const initialOperators: Operator[] = [
  { id: "OP-001", name: "John Doe", role: "CNC Specialist", skill: "Senior", workload: 60, status: "Assigned", shift: "Morning" },
  { id: "OP-002", name: "Sarah Smith", role: "Assembly Tech", skill: "Junior", workload: 0, status: "Available", shift: "Afternoon" },
  { id: "OP-003", name: "Mike Ross", role: "Quality Control", skill: "Senior", workload: 100, status: "At Capacity", shift: "Evening" },
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
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
};

// ==================== Main Component ====================
const ResourceAllocation: React.FC = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Data States
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [operators] = useState<Operator[]>(initialOperators);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Filter States
  const [machineSearch, setMachineSearch] = useState("");
  const [machineStatusFilter, setMachineStatusFilter] = useState<string>("All");
  const [operatorSearch, setOperatorSearch] = useState("");
  const [operatorStatusFilter, setOperatorStatusFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMachineFilterOpen, setIsMachineFilterOpen] = useState(false);
  const [isOperatorFilterOpen, setIsOperatorFilterOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredMachines = useMemo(() => {
    return machines.filter(m =>
      (machineStatusFilter === "All" || m.status === machineStatusFilter) &&
      (m.id.toLowerCase().includes(machineSearch.toLowerCase()) || m.name.toLowerCase().includes(machineSearch.toLowerCase()))
    );
  }, [machines, machineSearch, machineStatusFilter]);

  const filteredOperators = useMemo(() => {
    return operators.filter(o =>
      (operatorStatusFilter === "All" || o.status === operatorStatusFilter) &&
      (o.id.toLowerCase().includes(operatorSearch.toLowerCase()) || o.name.toLowerCase().includes(operatorSearch.toLowerCase()))
    );
  }, [operators, operatorSearch, operatorStatusFilter]);

  const handleTimeFilterChange = (value: TimeFilter) => {
    if (value === "Custom") {
      setIsCalendarOpen(true);
      setIsTimeDropdownOpen(false);
    } else {
      setTimeFilter(value);
      setIsTimeDropdownOpen(false);
      setIsCalendarOpen(false);
    }
  };

  const handleUpdateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMachine) {
      setMachines(machines.map(m => m.id === editingMachine.id ? editingMachine : m));
      setEditingMachine(null);
    }
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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-orange-500" />
              <span>{timeFilter === "Custom" && customRange.start ? `${formatDate(customRange.start)} - ${formatDate(customRange.end)}` : timeFilter}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["Weekly", "Monthly", "Quarterly", "Yearly", "All Time", "Custom"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                    className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                <div className="space-y-3">
                  <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                  <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                  <button onClick={() => { setIsCalendarOpen(false); setTimeFilter("Custom"); }} className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold">Apply Range</button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Machine Allocation Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Machine Allocation</h2>
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  placeholder="Search machines..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm outline-none"
                  value={machineSearch}
                  onChange={(e) => setMachineSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <button onClick={() => setIsMachineFilterOpen(!isMachineFilterOpen)} className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                    machineStatusFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}>
                  {machineStatusFilter === "All" ? "Status" : machineStatusFilter} <ChevronDown size={14} />
                </button>
                {isMachineFilterOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {["All", "Available", "In Use", "Maintenance", "Shutdown"].map(opt => (
                      <button key={opt} onClick={() => { setMachineStatusFilter(opt); setIsMachineFilterOpen(false); }} className={`outline-none w-full text-left px-2 py-2 text-[13px] hover:bg-slate-50 ${
                          machineStatusFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"
                        }`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-12 p-5 text-center border-b border-slate-100"><input type="checkbox" className="accent-orange-500" /></th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">MACHINE ID</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">NAME</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">TYPE</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">STATUS</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">LOAD</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMachines.map((m) => (
                <tr key={m.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="p-5 text-center"><input type="checkbox" className="accent-orange-500" /></td>
                  <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{m.id}</td>
                  <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{m.name}</td>
                  <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{m.type}</td>
                  <td className="px-4 py-4 text-center"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-4 text-[13px] font-bold text-slate-800 text-center">{m.load}%</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors"><Eye size={16} /></button>
                      <button onClick={() => setEditingMachine(m)} className="p-2 text-slate-400 hover:text-orange-500 transition-colors"><Pencil size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Operator Allocation Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Operator Allocation</h2>
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  placeholder="Search operators..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm outline-none"
                  value={operatorSearch}
                  onChange={(e) => setOperatorSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <button onClick={() => setIsOperatorFilterOpen(!isOperatorFilterOpen)} className={`outline-none w-full flex items-center justify-between gap-2 px-5 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                    operatorStatusFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}>
                  {operatorStatusFilter === "All" ? "Status" : operatorStatusFilter} <ChevronDown size={14} />
                </button>
                {isOperatorFilterOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {["All", "Assigned", "Available", "At Capacity"].map(opt => (
                      <button key={opt} onClick={() => { setOperatorStatusFilter(opt); setIsOperatorFilterOpen(false); }} className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${
                          operatorStatusFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"
                        }`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-12 p-5 text-center border-b border-slate-100"><input type="checkbox" className="accent-orange-500" /></th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">OPERATOR ID</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">NAME</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">SHIFT</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">UTILIZATION</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">STATUS</th>
                <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOperators.map((o) => (
                <tr key={o.id} className="hover:bg-orange-50/20 transition-colors">
                  <td className="p-5 text-center"><input type="checkbox" className="accent-orange-500" /></td>
                  <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{o.id}</td>
                  <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{o.name}</td>
                  <td className="px-4 py-4 text-[13px] text-slate-700 text-center font-bold">{o.shift}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${o.workload > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${o.workload}%` }} />
                      </div>
                      <span className="text-[10px] font-bold">{o.workload}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-4 text-center">
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2 mx-auto">
                      <Factory size={14} /> Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Machine Modal */}
      {editingMachine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
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