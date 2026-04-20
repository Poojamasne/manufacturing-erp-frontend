import React, { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Play,
  Settings,
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
} from "lucide-react";

// ==================== Types ====================
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


interface Activity {
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


const initialActivities: Activity[] = [
  { id: "1", operatorName: "John Doe", operatorId: "OP001", action: "Completed Setup", details: "CNC Machine B setup completed", timestamp: "2024-05-20T10:25:00Z", icon: <CheckCircle2 size={16} /> },
  { id: "2", operatorName: "Mike Ross", operatorId: "OP003", action: "Requested Downtime", details: "Assembly line maintenance request", timestamp: "2024-05-20T10:00:00Z", icon: <ShieldAlert size={16} /> },
  { id: "3", operatorName: "Sarah Smith", operatorId: "OP002", action: "Break Started", details: "Morning break - 30 minutes", timestamp: "2024-05-20T09:30:00Z", icon: <Coffee size={16} /> },
  { id: "4", operatorName: "Sarah Wilson", operatorId: "OP004", action: "Task Started", details: "Started injection molding run", timestamp: "2024-05-20T09:00:00Z", icon: <Play size={16} /> },
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: MachineStatus }> = ({ status }) => {
  const styles: Record<MachineStatus, string> = {
    Running: "bg-teal-100 text-teal-700 border-teal-200",
    Warning: "bg-amber-100 text-amber-700 border-amber-200",
    Idle: "bg-slate-100 text-slate-600 border-slate-200",
    Down: "bg-red-100 text-red-700 border-red-200"
  };
  const icons: Record<MachineStatus, React.ReactNode> = {
    Running: <Play size={12} className="inline mr-1" />,
    Warning: <AlertTriangle size={12} className="inline mr-1" />,
    Idle: <Coffee size={12} className="inline mr-1" />,
    Down: <ShieldAlert size={12} className="inline mr-1" />
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border inline-flex items-center ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
};


const getShiftLabel = (shift: Shift) => {
  const labels: Record<Shift, string> = { MORNING: "Morning (6AM-2PM)", EVENING: "Evening (2PM-10PM)", NIGHT: "Night (10PM-6AM)" };
  return labels[shift];
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
  return date.toLocaleDateString();
};

// ==================== Main Component ====================
const ShopFloorExecution: React.FC = () => {
  // State
  const [stations] = useState<MachineStation[]>(initialStations);
  const [activities] = useState<Activity[]>(initialActivities);
  const [selectedStation, setSelectedStation] = useState<MachineStation | null>(null);
  const [showStationModal, setShowStationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [shiftFilter, setShiftFilter] = useState<string>("All");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);

  const statusOptions = ["All", "Running", "Warning", "Idle", "Down"];
  const shiftOptions = ["All", "MORNING", "EVENING", "NIGHT"];

  // Stats
  const stats = useMemo(() => ({
    total: stations.length,
    running: stations.filter(s => s.status === "Running").length,
    warning: stations.filter(s => s.status === "Warning").length,
    idle: stations.filter(s => s.status === "Idle").length,
    down: stations.filter(s => s.status === "Down").length,
    avgEfficiency: Math.round(stations.filter(s => s.efficiency > 0).reduce((acc, s) => acc + s.efficiency, 0) / stations.filter(s => s.efficiency > 0).length),
    totalOutput: stations.reduce((acc, s) => acc + s.completed, 0),
    totalTarget: stations.reduce((acc, s) => acc + s.total, 0),
  }), [stations]);

  // Filter stations
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
    return filtered;
  }, [stations, searchQuery, statusFilter, shiftFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleViewStation = (station: MachineStation) => {
    setSelectedStation(station);
    setShowStationModal(true);
  };

  const getStatusColor = (status: MachineStatus) => {
    switch(status) {
      case "Running": return "border-teal-500";
      case "Warning": return "border-amber-500";
      case "Idle": return "border-slate-400";
      case "Down": return "border-red-500";
      default: return "border-orange-500";
    }
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
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Real-time production monitoring and task execution 
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className="p-2.5 bg-white border border-slate-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium flex items-center gap-2">
              <QrCode size={16} /> Scan QR
            </button>
            <button className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg">
              <Camera size={16} /> Capture
            </button>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border-l-4 border-orange-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Plant OEE</p><Zap size={18} className="text-orange-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{stats.avgEfficiency}%</h3>
            <p className="text-xs text-green-600 mt-1">↑ 5% vs yesterday</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-teal-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Output Goal</p><Activity size={18} className="text-teal-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{overallProgress}%</h3>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${overallProgress}%` }} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Stations</p><Factory size={18} className="text-blue-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{stats.running}/{stats.total}</h3>
            <p className="text-xs text-gray-500 mt-1">{stats.warning} warning, {stats.idle} idle</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-l-4 border-purple-500 shadow-sm">
            <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Operators</p><User size={18} className="text-purple-500" /></div>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{new Set(stations.filter(s => s.operator !== "None").map(s => s.operatorId)).size}</h3>
            <p className="text-xs text-gray-500 mt-1">On shop floor</p>
          </div>
        </div>

        {/* Filters Bar - Matching other pages style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search by station, operator or task..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Status Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsStatusOpen(!isStatusOpen)} 
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <Filter size={14} />
                  {statusFilter === "All" ? "Status" : statusFilter} 
                  <ChevronDown size={14} className={isStatusOpen ? "rotate-180" : ""} />
                </button>
                {isStatusOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-2xl shadow-2xl z-50 py-2">
                    {statusOptions.map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => { setStatusFilter(opt); setIsStatusOpen(false); }} 
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Shift Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsShiftOpen(!isShiftOpen)} 
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${shiftFilter !== "All" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <Calendar size={14} />
                  {shiftFilter === "All" ? "Shift" : getShiftLabel(shiftFilter as Shift)} 
                  <ChevronDown size={14} className={isShiftOpen ? "rotate-180" : ""} />
                </button>
                {isShiftOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-2xl shadow-2xl z-50 py-2">
                    {shiftOptions.map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => { setShiftFilter(opt); setIsShiftOpen(false); }} 
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${shiftFilter === opt ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600"}`}
                      >
                        {opt === "All" ? "All Shifts" : getShiftLabel(opt as Shift)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Workstations Grid */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-orange-500" /> Active Workstations
              </h2>
              <p className="text-xs text-gray-400">{filteredStations.length} stations found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStations.map((station) => (
                <div key={station.id} className={`bg-white rounded-2xl p-6 border-l-4 ${getStatusColor(station.status)} shadow-sm hover:shadow-md transition-all duration-300 group`}>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-gray-400 mb-1">{station.id}</p>
                      <h3 className="text-lg font-bold text-gray-800">{station.name}</h3>
                      <StatusBadge status={station.status} />
                    </div>
                    <button onClick={() => handleViewStation(station)} className="p-2 text-gray-400 hover:text-orange-500 transition rounded-xl">
                      <Eye size={16} />
                    </button>
                  </div>

                  {/* Task Info */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Current Task</p>
                    <p className="text-sm font-semibold text-gray-800">{station.currentTask}</p>
                    <p className="text-xs text-gray-500 mt-1">PO: {station.productionOrderId || "N/A"}</p>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>PROGRESS</span>
                      <span className="text-gray-800">{station.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${station.status === "Running" ? "bg-teal-500" : station.status === "Warning" ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${station.progress}%` }} />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Output</p>
                      <p className="text-sm font-bold text-gray-800">{station.output}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">OEE</p>
                      <p className={`text-sm font-bold ${station.efficiency > 90 ? "text-teal-600" : "text-gray-800"}`}>{station.efficiency}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Operator</p>
                      <div className="flex items-center gap-1"><User size={12} className="text-gray-400" /><p className="text-xs font-medium">{station.operator === "None" ? "Unassigned" : station.operator}</p></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition">Adjust Setup</button>
                    <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition"><AlertTriangle size={18} /></button>
                    {station.status === "Idle" && <button className="p-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition"><Play size={18} /></button>}
                  </div>
                </div>
              ))}
            </div>

            {filteredStations.length === 0 && (
              <div className="bg-white rounded-2xl py-16 text-center">
                <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-4"><Factory className="text-gray-300" size={40} /></div>
                <h3 className="text-lg font-bold text-gray-800">No Stations Found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Team Activity Panel */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
                  <User size={18} className="text-orange-500" /> Team Activity
                </h2>
                <button onClick={() => setShowAllActivities(!showAllActivities)} className="text-[10px] font-bold text-orange-500 hover:text-orange-600">
                  {showAllActivities ? "Show Less" : "View All"}
                </button>
              </div>
              <div className="space-y-4">
                {displayedActivities.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">{activity.icon}</div>
                    <div className="flex-1"><p className="text-[11px] text-gray-800 leading-tight"><strong>{activity.operatorName}</strong> • {activity.action}</p><p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{formatTime(activity.timestamp)}</p></div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-5 py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:border-orange-200 hover:text-orange-500 transition">Log Activity</button>
            </div>

            {/* Shift Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={18} className="text-orange-500" /> Current Shift</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Shift:</span><span className="font-semibold">Morning (6AM - 2PM)</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Active Operators:</span><span className="font-semibold">{stations.filter(s => s.shift === "MORNING" && s.operator !== "None").length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Production Target:</span><span className="font-semibold">{Math.round(stations.filter(s => s.shift === "MORNING").reduce((acc, s) => acc + (s.total / 3), 0)).toLocaleString()} units</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs mb-1"><span>Shift Progress</span><span>65%</span></div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full" style={{ width: "65%" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Station Details Modal */}
      {showStationModal && selectedStation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div><h2 className="text-xl font-bold">{selectedStation.name}</h2><p className="text-sm text-gray-500 mt-1">{selectedStation.id}</p></div>
              <button onClick={() => setShowStationModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Status</label><StatusBadge status={selectedStation.status} /></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Operator</label><p className="font-semibold">{selectedStation.operator}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Current Task</label><p className="font-semibold">{selectedStation.currentTask}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Production Order</label><p className="font-semibold">{selectedStation.productionOrderId || "N/A"}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Shift</label><p className="font-semibold">{getShiftLabel(selectedStation.shift)}</p></div>
                <div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Last Updated</label><p className="font-semibold">{formatTime(selectedStation.lastUpdated)}</p></div>
              </div>
              <div><label className="text-xs text-gray-500 uppercase">Progress</label><div className="mt-2"><div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${selectedStation.status === "Running" ? "bg-teal-500" : "bg-orange-500"} rounded-full`} style={{ width: `${selectedStation.progress}%` }} /></div><p className="text-right text-sm mt-1">{selectedStation.progress}% Complete</p></div></div>
              <div className="grid grid-cols-2 gap-4"><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">Output</label><p className="text-2xl font-bold text-teal-600">{selectedStation.output}</p></div><div className="p-3 bg-gray-50 rounded-xl"><label className="text-xs text-gray-500 uppercase">OEE</label><p className="text-2xl font-bold text-orange-600">{selectedStation.efficiency}%</p></div></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
              <button onClick={() => setShowStationModal(false)} className="px-6 py-2 bg-gray-100 rounded-xl">Close</button>
              <button className="px-6 py-2 bg-orange-500 text-white rounded-xl">View Production Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFloorExecution;