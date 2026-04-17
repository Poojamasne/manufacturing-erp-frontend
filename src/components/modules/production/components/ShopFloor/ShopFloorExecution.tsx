import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Coffee,
  MoreHorizontal,
  Play,
  Settings,
  ShieldAlert,
  Zap
} from "lucide-react";

// ==================== Types ====================
interface MachineStation {
  id: string;
  name: string;
  status: "Running" | "Idle" | "Down" | "Warning";
  operator: string;
  currentTask: string;
  progress: number;
  output: string;
  efficiency: number;
}

// ==================== Mock Data ====================
const initialStations: MachineStation[] = [
  { id: "WS-01", name: "CNC Milling X1", status: "Running", operator: "John Doe", currentTask: "PO-1001: M12 Bolts", progress: 68, output: "3,400 / 5,000", efficiency: 94 },
  { id: "WS-02", name: "Laser Cutter v2", status: "Warning", operator: "Sarah Smith", currentTask: "PO-1002: Frames", progress: 24, output: "60 / 250", efficiency: 82 },
  { id: "WS-03", name: "Heavy Press 05", status: "Idle", operator: "None", currentTask: "Queue: PO-1003", progress: 0, output: "0 / 1,000", efficiency: 0 },
  { id: "WS-04", name: "Assembly Line A", status: "Down", operator: "Mike Ross", currentTask: "System Maintenance", progress: 0, output: "Blocked", efficiency: 0 },
];

// ==================== Main Component ====================
const ShopFloorExecution: React.FC = () => {
  const [stations] = useState<MachineStation[]>(initialStations);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Running": return "bg-teal-500 shadow-teal-500/20";
      case "Warning": return "bg-amber-500 shadow-amber-500/20";
      case "Down": return "bg-red-500 shadow-red-500/20";
      default: return "bg-slate-400 shadow-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top KPI Header */}
        <header className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="md:col-span-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Shop Floor</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
              Live Terminal 04
            </p>
          </div>
          {[
            { label: "Plant OEE", val: "92.4%", icon: Zap, color: "text-orange-500" },
            { label: "Output Goal", val: "84%", icon: Activity, color: "text-teal-500" },
            { label: "Active Downtime", val: "12m", icon: Clock, color: "text-red-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-white px-6 py-4 rounded-[1.8rem] shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-3 bg-slate-50 rounded-2xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-slate-800 leading-none">{stat.val}</p>
              </div>
            </div>
          ))}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Grid: Machine Workstations */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                <Settings size={20} className="text-orange-500" /> Active Workstations
              </h2>
              <div className="flex gap-2">
                 <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500">Filter By Area</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stations.map((ws) => (
                <div key={ws.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-300">
                  
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 h-16 w-16 bg-slate-50 transition-colors group-hover:bg-slate-100`} style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}></div>
                  <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${getStatusStyle(ws.status)}`}></div>

                  <div className="mb-6">
                    <p className="text-[10px] font-mono font-bold text-slate-400 mb-1">{ws.id}</p>
                    <h3 className="text-xl font-black text-slate-800">{ws.name}</h3>
                    <p className="text-xs font-bold text-orange-500 flex items-center gap-1.5 mt-1">
                      {ws.status === "Running" && <Play size={12} fill="currentColor" />}
                      {ws.status === "Warning" && <AlertTriangle size={12} />}
                      {ws.status === "Down" && <ShieldAlert size={12} />}
                      {ws.status === "Idle" && <Coffee size={12} />}
                      {ws.status.toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Task Info */}
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mb-1">Active Job</p>
                      <p className="text-sm font-bold text-slate-700">{ws.currentTask}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1">
                          <span>PROGRESS</span>
                          <span className="text-slate-800">{ws.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${ws.status === "Running" ? 'bg-teal-500' : ws.status === "Warning" ? 'bg-amber-500' : 'bg-red-400'}`} 
                            style={{ width: `${ws.progress}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end px-1">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 mb-1">OUTPUT COUNTER</p>
                        <p className="text-lg font-black text-slate-800">{ws.output}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 mb-1">OEE</p>
                        <p className={`text-lg font-black ${ws.efficiency > 90 ? 'text-teal-600' : 'text-slate-800'}`}>{ws.efficiency}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                       <button className="flex-1 bg-white border border-slate-200 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Adjust Setup</button>
                       <button className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors"><AlertTriangle size={20} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Activity & Alerts (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Real-time Alerts */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                <AlertTriangle size={20} className="text-orange-500" /> Plant Alerts
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Low Level Alert", msg: "Zinc Coating in Station WS-02 is < 15%", color: "text-amber-400", bg: "bg-amber-400/10" },
                  { title: "Sensor Malfunction", msg: "Line A: Hydraulic pressure threshold crossed.", color: "text-red-400", bg: "bg-red-400/10" },
                ].map((alert, i) => (
                  <div key={i} className={`p-4 rounded-2xl border border-white/10 ${alert.bg}`}>
                    <p className={`text-xs font-black uppercase tracking-widest ${alert.color}`}>{alert.title}</p>
                    <p className="text-xs text-white/60 mt-1">{alert.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Feed */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Team Activity</h2>
                <button className="text-slate-300"><MoreHorizontal size={20} /></button>
              </div>
              <div className="space-y-6">
                {[
                  { name: "John Doe", act: "Completed Setup", time: "2m ago", icon: <CheckCircle2 size={16} /> },
                  { name: "Mike Ross", act: "Requested Downtime", time: "15m ago", icon: <ShieldAlert size={16} /> },
                  { name: "Sarah Smith", act: "Break Start", time: "1h ago", icon: <Coffee size={16} /> },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      {act.icon}
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-800 leading-none mb-1"><strong>{act.name}</strong> • {act.act}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-100 rounded-[1.8rem] text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:border-orange-200 hover:text-orange-500 transition-all">View All Activity</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopFloorExecution;