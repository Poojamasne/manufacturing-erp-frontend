import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  Clock,
  Factory,
  CheckCircle,
  AlertTriangle,
  Package,
  Calendar,
  Users,
  Play,
  Eye,
  ArrowRight,
  X,
  Check,
} from "lucide-react";

type TimeFilter =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

interface ProductionStats {
  pendingOrders: number;
  inProgress: number;
  completedOrders: number;
  materialShortages: number;
  totalProduction: number;
  efficiency: number;
  onTimeDelivery: number;
  activeMachines: number;
  totalMachines: number;
  activeOperators: number;
  totalOperators: number;
  defectRate: number;
}

interface MaterialAlert {
  id: number;
  material: string;
  required: number;
  available: number;
  shortage: number;
  unit: string;
  status: "CRITICAL" | "LOW" | "OK";
  poCreated?: boolean;
}

interface RecentActivity {
  id: string;
  type:
  | "ORDER_CREATED"
  | "ORDER_STARTED"
  | "ORDER_COMPLETED"
  | "MATERIAL_ALERT"
  | "WORK_ORDER_ASSIGNED";
  title: string;
  description: string;
  timestamp: string;
  orderId?: string;
}

interface ProductionTrend {
  day: string;
  planned: number;
  actual: number;
}

const mockStats: ProductionStats = {
  pendingOrders: 12,
  inProgress: 8,
  completedOrders: 1245,
  materialShortages: 3,
  totalProduction: 1265,
  efficiency: 87,
  onTimeDelivery: 92,
  activeMachines: 8,
  totalMachines: 12,
  activeOperators: 15,
  totalOperators: 20,
  defectRate: 3.2,
};

const mockMaterialAlerts: MaterialAlert[] = [
  {
    id: 1,
    material: "Steel Grade A",
    required: 5000,
    available: 3200,
    shortage: 1800,
    unit: "kg",
    status: "CRITICAL",
    poCreated: false,
  },
  {
    id: 2,
    material: "Plastic Resin",
    required: 2500,
    available: 500,
    shortage: 2000,
    unit: "kg",
    status: "CRITICAL",
    poCreated: false,
  },
  {
    id: 3,
    material: "Copper Wire",
    required: 8000,
    available: 2500,
    shortage: 5500,
    unit: "m",
    status: "CRITICAL",
    poCreated: false,
  },
  {
    id: 4,
    material: "Aluminum Sheet",
    required: 1000,
    available: 850,
    shortage: 150,
    unit: "sheets",
    status: "LOW",
    poCreated: false,
  },
];

const mockRecentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "ORDER_CREATED",
    title: "New Production Order",
    description: "PO-006 created for Copper Wires",
    timestamp: "2024-05-16 09:30 AM",
    orderId: "PO-006",
  },
  {
    id: "2",
    type: "ORDER_STARTED",
    title: "Production Started",
    description: "PO-001 (Steel Bolts) started on CNC Machine B",
    timestamp: "2024-05-16 08:00 AM",
    orderId: "PO-001",
  },
  {
    id: "3",
    type: "WORK_ORDER_ASSIGNED",
    title: "Work Order Assigned",
    description: "WO-004 assigned to John Doe for Frame Assembly",
    timestamp: "2024-05-15 04:30 PM",
  },
  {
    id: "4",
    type: "ORDER_COMPLETED",
    title: "Order Completed",
    description: "PO-004 (Rubber Gaskets) completed successfully",
    timestamp: "2024-05-15 05:00 PM",
    orderId: "PO-004",
  },
  {
    id: "5",
    type: "MATERIAL_ALERT",
    title: "Material Shortage",
    description: "Steel Grade A running low - 1800kg shortage",
    timestamp: "2024-05-15 02:30 PM",
  },
  {
    id: "6",
    type: "ORDER_CREATED",
    title: "New Production Order",
    description: "PO-005 created for Steel Plates",
    timestamp: "2024-05-15 11:00 AM",
    orderId: "PO-005",
  },
];

const mockProductionTrend: ProductionTrend[] = [
  { day: "Mon", planned: 850, actual: 820 },
  { day: "Tue", planned: 850, actual: 890 },
  { day: "Wed", planned: 850, actual: 780 },
  { day: "Thu", planned: 850, actual: 910 },
  { day: "Fri", planned: 850, actual: 850 },
  { day: "Sat", planned: 500, actual: 480 },
  { day: "Sun", planned: 300, actual: 290 },
];

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "ORDER_CREATED":
      return <Package size={16} className="text-green-500" />;
    case "ORDER_STARTED":
      return <Play size={16} className="text-blue-500" />;
    case "ORDER_COMPLETED":
      return <CheckCircle size={16} className="text-green-500" />;
    case "MATERIAL_ALERT":
      return <AlertTriangle size={16} className="text-red-500" />;
    case "WORK_ORDER_ASSIGNED":
      return <Users size={16} className="text-purple-500" />;
    default:
      return <Clock size={16} className="text-gray-500" />;
  }
};

const ProductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State
  const [stats] = useState<ProductionStats>(mockStats);
  const [materialAlerts, setMaterialAlerts] =
    useState<MaterialAlert[]>(mockMaterialAlerts);
  const [recentActivities] = useState<RecentActivity[]>(mockRecentActivities);
  const [productionTrend] = useState<ProductionTrend[]>(mockProductionTrend);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter States
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsTimeDropdownOpen(false);
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      )
        setIsCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  const parseDate = (dateStr: string) => {
    try {
      const parts = dateStr.split(" ");
      if (parts.length < 3) return new Date(dateStr);

      const date = parts[0];
      const time = parts[1];
      const modifier = parts[2];

      //eslint-disable-next-line
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const isoString = `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

      const parsed = new Date(isoString);

      return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch {
      return new Date();
    }
  };

  const sortedActivities = [...recentActivities].sort(
    (a, b) =>
      parseDate(b.timestamp).getTime() - parseDate(a.timestamp).getTime(),
  );

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
    if (timeFilter === "Custom" && customRange.start && customRange.end)
      return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    return timeFilter;
  };

  const displayedActivities = showAllActivities
    ? sortedActivities
    : sortedActivities.slice(0, 4);

  // Handle Create Purchase Order action
  const handleCreatePO = (alertId: number) => {
    setMaterialAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, poCreated: true, status: "OK" as const }
          : alert,
      ),
    );

    setSuccessMessage("Purchase Order created successfully!");

    const remainingCritical = materialAlerts.filter(
      (a) => a.status === "CRITICAL" && a.id !== alertId,
    ).length;
    stats.materialShortages = remainingCritical;
  };

  // Handle dismiss entire alert banner
  const handleDismissAlert = () => {
    setIsAlertDismissed(true);
  };

  const criticalMaterials = materialAlerts.filter(
    (m) => m.status === "CRITICAL" && !m.poCreated,
  );

  const maxValue = Math.max(
    ...productionTrend.map((d) => Math.max(d.planned, d.actual)),
  );

  const yAxisSteps = 5; // number of lines
  const yAxisValues = Array.from({ length: yAxisSteps + 1 }, (_, i) =>
    Math.round((maxValue / yAxisSteps) * i),
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Success Toast Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Check size={18} />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Monitor and manage production activities
            </p>
          </div>

          {/* Global Time Filter */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-orange-500" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown
                size={14}
                className={isTimeDropdownOpen ? "rotate-180" : ""}
              />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tab}
                    </button>
                  ),
                )}
                <button
                  onClick={() => handleTimeFilterChange("Custom")}
                  className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === "Custom" ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Custom
                </button>
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
                    className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Stats Cards - SRS 3.2 Dashboard Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-l-4 border-orange-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Pending Orders
              </p>
              <Clock size={20} className="text-orange-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800">
              {stats.pendingOrders}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Awaiting production</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                In Progress
              </p>
              <Factory size={20} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800">
              {stats.inProgress}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Currently manufacturing
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Completed Orders
              </p>
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800">
              {stats.completedOrders.toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Finished products</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Material Shortages
              </p>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800">
              {
                materialAlerts.filter(
                  (a) => a.status === "CRITICAL" && !a.poCreated,
                ).length
              }
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Need immediate attention
            </p>
          </div>
        </div>

        {/* Material Shortages Alert - SRS 3.2 */}
        {!isAlertDismissed && criticalMaterials.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 relative">
            {/* Dismiss button for entire alert */}
            <button
              onClick={handleDismissAlert}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition"
              title="Dismiss alert"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={22} />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-3">
                  Critical Material Shortages Alert
                </h4>
                <div className="space-y-3">
                  {criticalMaterials.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl"
                    >
                      <span className="font-medium text-gray-800">
                        {alert.material}
                      </span>
                      <div className="flex gap-4 text-sm">
                        <span>
                          Required:{" "}
                          <strong>
                            {alert.required.toLocaleString()} {alert.unit}
                          </strong>
                        </span>
                        <span>
                          Available:{" "}
                          <strong>
                            {alert.available.toLocaleString()} {alert.unit}
                          </strong>
                        </span>
                        <span className="text-red-600">
                          Shortage:{" "}
                          <strong>
                            {alert.shortage.toLocaleString()} {alert.unit}
                          </strong>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreatePO(alert.id)}
                          className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition"
                        >
                          Create PO
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Production Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">
                  Production Trend
                </h3>
                <p className="text-sm text-gray-400 font-normal mt-1">
                  Weekly planned vs actual output
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-orange-500" /> Planned
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Actual
                </div>
              </div>
            </div>
            <div className="h-64 flex">
              {/* Y-Axis */}
              <div className="flex flex-col justify-between h-full text-[11px] text-gray-400 mr-2">
                {[...yAxisValues].reverse().map((val, i) => (
                  <div key={i} className="flex items-start">
                    <span className="-translate-y-1/2">{val}</span>
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
                  {productionTrend.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full"
                    >
                      <div
                        className="w-full h-full flex items-end justify-center gap-1"
                        title={`Day: ${day.day}
Planned: ${day.planned}
Actual: ${day.actual}`}
                      >
                        <div
                          className="w-4 bg-orange-500 rounded-t"
                          style={{
                            height: `${(day.planned / maxValue) * 100}%`,
                          }}
                        />

                        <div
                          className="w-4 bg-blue-500 rounded-t"
                          style={{
                            height: `${(day.actual / maxValue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* X-axis Labels */}
                <div className="flex mt-2">
                  {productionTrend.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex-1 text-center text-[10px] text-gray-500"
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resource Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-4">
              Resource Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Machines</span>
                  <span className="font-semibold">
                    {stats.activeMachines}/{stats.totalMachines} Active
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${(stats.activeMachines / stats.totalMachines) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Operators</span>
                  <span className="font-semibold">
                    {stats.activeOperators}/{stats.totalOperators} Active
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(stats.activeOperators / stats.totalOperators) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Overall Equipment Effectiveness
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {stats.efficiency}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${stats.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Recent Activities
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Latest production events
                </p>
              </div>
              <button
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                {showAllActivities ? "Show Less" : "View All"}{" "}
                <ArrowRight size={14} className="inline" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {displayedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-orange-50/20 transition flex items-start gap-3"
                >
                  <div className="p-2 bg-gray-100 rounded-xl">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isNaN(parseDate(activity.timestamp).getTime())
                        ? activity.timestamp
                        : formatDate(
                          parseDate(activity.timestamp).toISOString(),
                        )}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (activity.orderId) {
                        navigate(`/production/orders/${activity.orderId}`);
                      } else if (activity.type === "WORK_ORDER_ASSIGNED") {
                        navigate("/production/work-orders");
                      } else if (activity.type === "MATERIAL_ALERT") {
                        navigate("/production/inventory");
                      } else {
                        navigate("/production");
                      }
                    }}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Common production tasks
              </p>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => navigate("/production/planning")}
                className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition group"
              >
                <span className="font-medium text-gray-800">
                  New Production Planning
                </span>
                <Factory size={18} className="text-orange-500" />
              </button>
              <button
                onClick={() => navigate("/production/orders")}
                className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition group"
              >
                <span className="font-medium text-gray-800">
                  View Production Orders
                </span>
                <Package size={18} className="text-blue-500" />
              </button>
              <button
                onClick={() => navigate("/production/shop-floor")}
                className="w-full flex items-center justify-between p-3 bg-green-50 rounded-xl hover:bg-green-100 transition group"
              >
                <span className="font-medium text-gray-800">
                  Shop Floor View
                </span>
                <Eye size={18} className="text-green-500" />
              </button>
              <button
                onClick={() => navigate("/production/scheduling")}
                className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition group"
              >
                <span className="font-medium text-gray-800">
                  Production Scheduling
                </span>
                <Calendar size={18} className="text-purple-500" />
              </button>
              <button
                onClick={() => navigate("/production/resources")}
                className="w-full flex items-center justify-between p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition group"
              >
                <span className="font-medium text-gray-800">
                  Resource Allocation
                </span>
                <Users size={18} className="text-yellow-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Warning */}
        {materialAlerts.filter((m) => m.status === "LOW").length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">
                  Low Stock Warning
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                  {materialAlerts
                    .filter((m) => m.status === "LOW")
                    .map((alert) => (
                      <div key={alert.id} className="text-sm text-yellow-700">
                        {alert.material}:{" "}
                        <strong>
                          {alert.available.toLocaleString()} {alert.unit}
                        </strong>{" "}
                        remaining
                      </div>
                    ))}
                </div>
              </div>
              <button className="text-sm text-yellow-700 hover:text-yellow-800 font-medium">
                Review Inventory →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionDashboard;
