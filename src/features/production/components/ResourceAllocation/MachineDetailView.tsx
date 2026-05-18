import {
  Settings,
  Settings2,
  Activity,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Zap,
  History,
} from "lucide-react";

interface MaintenanceLog {
  id: string;
  date: string;
  type: "Routine" | "Repair" | "Upgrade";
  technician: string;
  description: string;
  status: "Completed" | "Pending";
}

interface MachineDetail {
  id: string;
  name: string;
  type: string;
  status: "Available" | "In Use" | "Maintenance" | "Shutdown";
  model: string;
  manufacturer: string;
  purchaseDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  totalOperatingHours: number;
  powerConsumption: string;
  efficiency: number;
  healthScore: number;
  currentOperator?: string;
  currentTask?: string;
  maintenanceLogs: MaintenanceLog[];
}


const mockMachineDetail: MachineDetail = {
  id: "MAC-102",
  name: "Laser Cutter v2",
  type: "Precision Cutting",
  status: "In Use",
  model: "LC-X500-Pro",
  manufacturer: "OpticSystems Inc.",
  purchaseDate: "2023-01-15",
  lastMaintenance: "2024-03-10",
  nextMaintenance: "2024-06-10",
  totalOperatingHours: 1240,
  powerConsumption: "4.5 kW/h",
  efficiency: 94,
  healthScore: 88,
  currentOperator: "John Doe",
  currentTask: "Order #SO-992 - Aluminum Sheets",
  maintenanceLogs: [
    {
      id: "LOG-001",
      date: "2024-03-10",
      type: "Routine",
      technician: "Robert Fox",
      description: "Lens cleaning and alignment check.",
      status: "Completed",
    },
    {
      id: "LOG-002",
      date: "2023-12-05",
      type: "Repair",
      technician: "Jane Smith",
      description: "Replaced cooling fan motor.",
      status: "Completed",
    },
    {
      id: "LOG-003",
      date: "2024-06-10",
      type: "Routine",
      technician: "TBD",
      description: "Annual calibration and software update.",
      status: "Pending",
    },
  ],
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

const MachineDetailView = () => {
  const machine = mockMachineDetail;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-[#f3f4e6]0";
      case "In Use":
        return "bg-blue-500";
      case "Maintenance":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg ${getStatusColor(machine.status)}`}
              >
                <Settings size={40} className="animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-slate-800">
                    {machine.name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${getStatusColor(machine.status)}`}
                  >
                    {machine.status}
                  </span>
                </div>
                <p className="text-slate-400 font-mono text-sm">
                  {machine.id} • {machine.type}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition">
                Schedule Maintenance
              </button>
              <button className="px-6 py-3 bg-[#F59E0B] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-[#f67317] transition">
                Edit Details
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Efficiency",
              value: `${machine.efficiency}%`,
              icon: Activity,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Health Score",
              value: `${machine.healthScore}/100`,
              icon: Zap,
              color: "text-teal-600",
              bg: "bg-[#f3f4e6]",
            },
            {
              label: "Op. Hours",
              value: `${machine.totalOperatingHours}h`,
              icon: Clock,
              color: "text-amber-500",
              bg: "bg-orange-50",
            },
            {
              label: "Power Load",
              value: machine.powerConsumption,
              icon: Zap,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-4xl shadow-sm border border-gray-100"
            >
              <div
                className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}
              >
                <stat.icon size={24} />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Technical Specs & Current Status */}
          <div className="lg:col-span-2 space-y-8">
            {/* Technical Specifications */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Settings2 size={20} className="text-[#F59E0B]" /> Technical
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                {[
                  { label: "Manufacturer", value: machine.manufacturer },
                  { label: "Model Number", value: machine.model },
                  {
                    label: "Purchase Date",
                    value: formatDate(machine.purchaseDate),
                  },
                  {
                    label: "Last Service",
                    value: formatDate(machine.lastMaintenance),
                  },
                  {
                    label: "Next Service",
                    value: formatDate(machine.nextMaintenance),
                  },
                  { label: "Machine Type", value: machine.type },
                ].map((spec, i) => (
                  <div key={i} className="border-b border-slate-50 pb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {spec.label}
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <History size={20} className="text-[#F59E0B]" /> Maintenance
                History
              </h3>
              <div className="space-y-4">
                {machine.maintenanceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-xl ${log.status === "Completed" ? "bg-teal-100 text-teal-600" : "bg-amber-100 text-amber-600"}`}
                      >
                        {log.status === "Completed" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Clock size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {log.description}
                        </p>
                        <p className="text-xs text-slate-400">
                           {formatDate(log.date)} • Tech: {log.technician}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded border ${log.type === "Repair" ? "border-red-200 text-red-500" : "border-blue-200 text-blue-500"}`}
                    >
                      {log.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Real-time & Operator */}
          <div className="space-y-8">
            {/* Current Operation */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Activity size={20} className="text-[#F59E0B]" /> Live
                Operation
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">
                    Current Task
                  </p>
                  <p className="text-sm font-medium bg-white/10 p-3 rounded-xl border border-white/10">
                    {machine.currentTask || "No active task"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase">
                      Operator
                    </p>
                    <p className="text-sm font-bold">
                      {machine.currentOperator || "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Task Progress</span>
                    <span className="text-[#F59E0B] font-bold">65%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#F59E0B] h-full w-[65%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Health Warning */}
            <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-4 text-amber-700">
                <AlertTriangle size={24} />
                <h3 className="font-black text-sm uppercase tracking-widest">
                  System Note
                </h3>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                Machine is performing within normal parameters, but{" "}
                <strong>Next Service</strong> is approaching in 24 days.
                Consider pre-ordering replacement filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetailView;
