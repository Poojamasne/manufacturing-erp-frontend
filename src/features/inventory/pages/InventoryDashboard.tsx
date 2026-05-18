import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Filter,
  Package,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight, // Added for receipt icon
  ClipboardList,
  MapPin,
  Search,
  // MoreVertical,
  Clock,
  ArrowRight,
  Check,
  Truck // Added for receipt section
} from "lucide-react";

type TimeFilter =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

interface InventoryStats {
  totalSkus: number;
  lowStockItems: number;
  outOfStock: number;
  pendingIssueRequests: number;
  warehouseCapacity: number;
  monthlyInward: number;
}

interface StockItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: "NORMAL" | "LOW" | "OUT_OF_STOCK";
  location: string;
}

interface IssueRequest {
  id: string;
  productionOrderId: string;
  material: string;
  quantity: number;
  unit: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  timestamp: string;
}

// Added interface for Recent Receipts
interface RecentReceipt {
  id: string;
  material: string;
  batch: string;
  quantity: number;
  unit: string;
  supplier: string;
  timestamp: string;
}

const mockInventoryStats: InventoryStats = {
  totalSkus: 452,
  lowStockItems: 14,
  outOfStock: 3,
  pendingIssueRequests: 8,
  warehouseCapacity: 72,
  monthlyInward: 12400,
};

const mockStockItems: StockItem[] = [
  { id: "1", code: "MAT-001", name: "Steel Grade A", category: "Raw Material", quantity: 3200, unit: "kg", status: "LOW", location: "WH-1 / R-04" },
  { id: "2", code: "MAT-042", name: "Copper Wire 2mm", category: "Raw Material", quantity: 150, unit: "m", status: "OUT_OF_STOCK", location: "WH-1 / R-02" },
  { id: "3", code: "MAT-088", name: "Aluminum Sheet", category: "Raw Material", quantity: 850, unit: "sheets", status: "NORMAL", location: "WH-2 / R-01" },
  { id: "4", code: "MAT-102", name: "Plastic Resin", category: "Raw Material", quantity: 500, unit: "kg", status: "LOW", location: "WH-1 / R-09" },
  { id: "5", code: "MAT-205", name: "Industrial Adhesive", category: "Consumable", quantity: 1200, unit: "L", status: "NORMAL", location: "WH-2 / R-05" },
];

const mockPendingRequests: IssueRequest[] = [
  { id: "REQ-901", productionOrderId: "PO-2024-001", material: "Steel Grade A", quantity: 500, unit: "kg", urgency: "HIGH", timestamp: "2024-05-16 10:15 AM" },
  { id: "REQ-902", productionOrderId: "PO-2024-006", material: "Aluminum Sheet", quantity: 120, unit: "sheets", urgency: "MEDIUM", timestamp: "2024-05-16 11:30 AM" },
  { id: "REQ-903", productionOrderId: "PO-2024-009", material: "Copper Wire 2mm", quantity: 200, unit: "m", urgency: "HIGH", timestamp: "2024-05-16 01:45 PM" },
];

// Added mock data for Receipts
const mockRecentReceipts: RecentReceipt[] = [
  { id: "1", material: "Steel Grade A", batch: "B-8821", quantity: 2500, unit: "kg", supplier: "Global Steels", timestamp: "Today, 09:30 AM" },
  { id: "2", material: "Industrial Adhesive", batch: "B-9902", quantity: 500, unit: "L", supplier: "ChemCorp", timestamp: "Yesterday, 04:15 PM" },
];

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const InventoryDashboard: React.FC = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredStock = mockStockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node))
        setIsCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  };

  const getFilterDisplayText = () => {
    if (timeFilter === "Custom" && customRange.start && customRange.end)
      return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    return timeFilter;
  };

  const handleIssueMaterial = (requestId: string) => {
    setSuccessMessage(`Material Issued successfully for ${requestId}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {successMessage && (
          <div className="fixed top-21 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Check size={18} />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Material receipt, stock tracking, and production issues</p>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>

            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                    className={`outline-none w-full text-left px-4 py-2 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={() => handleTimeFilterChange("Custom")}
                  className={`outline-none w-full text-left px-4 py-2 text-[13px] ${timeFilter === "Custom" ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
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
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none"
                  />
                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none"
                  />
                  <button
                    onClick={handleCustomApply}
                    className="w-full bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#f67317]"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-l-4 border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Total Materials</p>
              <Package size={20} className="text-[#F59E0B]" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{mockInventoryStats.totalSkus}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">SKUs in Catalog</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Low Stock Alert</p>
              <AlertCircle size={20} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{mockInventoryStats.lowStockItems}</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Requires Reorder</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Pending Issues</p>
              <ClipboardList size={20} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{mockInventoryStats.pendingIssueRequests}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Production Orders</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Monthly Inward</p>
              <ArrowDownLeft size={20} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-700">{mockInventoryStats.monthlyInward.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">Received this month</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Critical Material Status Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Critical Material Status</h2>
                  <p className="text-sm text-gray-500 font-medium">Real-time availability for planning</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by SKU or Name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Material</th>
                      <th className="px-6 py-4 text-center">Stock Level</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Status</th>
                      {/* <th className="px-6 py-4">Action</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStock.length > 0 ? (
                      filteredStock.map((item) => (
                        <tr key={item.id} className="hover:bg-orange-50/20 transition group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium">{item.code} • {item.category}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="font-bold text-slate-700">{item.quantity.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.unit}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-gray-500 text-[13px] font-medium">
                              <MapPin size={14} className="text-gray-400" />
                              {item.location}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'NORMAL' ? 'bg-green-100 text-green-700' :
                                item.status === 'LOW' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                          {/* <td className="px-6 py-4 text-right">
                            <button className="p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200">
                              <MoreVertical size={16} className="text-gray-400" />
                            </button>
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                          No materials found matching "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Recently Received Materials (NEW SECTION) - SRS 3.3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Recently Received</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Stock Entry Logs</p>
                </div>
                <button className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1 uppercase tracking-widest">
                  View Ledger <ArrowRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockRecentReceipts.map((receipt) => (
                  <div key={receipt.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md transition">
                    <div className="p-3 bg-white rounded-xl text-green-600 shadow-sm group-hover:scale-110 transition">
                      <ArrowUpRight size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Batch {receipt.batch}</p>
                        <span className="text-[10px] font-bold text-gray-400">{receipt.timestamp}</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-800">{receipt.material}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs font-bold text-slate-600">{receipt.quantity.toLocaleString()} {receipt.unit}</span>
                         <span className="text-[10px] text-gray-400">•</span>
                         <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1 truncate">
                           <Truck size={10} /> {receipt.supplier}
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-widest">Pending Requests</h3>
                <span className="bg-[#F59E0B] text-white px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">ACTION REQ.</span>
              </div>
              <div className="divide-y divide-gray-100">
                {mockPendingRequests.map((req) => (
                  <div key={req.id} className="p-5 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-black px-2 py-1 rounded tracking-widest uppercase ${req.urgency === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                        {req.urgency} Priority
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Clock size={12} /> {req.timestamp.split(' ')[2]} {req.timestamp.split(' ')[3]}
                      </span>
                    </div>
                    <p className="text-[15px] font-extrabold text-slate-800 mb-1">{req.material}</p>
                    <p className="text-xs text-gray-500 font-medium">{req.quantity} {req.unit} for <span className="text-blue-600">{req.productionOrderId}</span></p>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => handleIssueMaterial(req.id)}
                        className="flex-1 bg-slate-800 text-white text-[12px] font-bold py-2.5 rounded-xl hover:bg-slate-700 transition shadow-sm"
                      >
                        Approve & Issue
                      </button>
                      <button className="px-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition">
                        <ArrowRight size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-[11px] font-bold text-gray-400 hover:text-amber-600 border-t border-gray-50 transition uppercase tracking-widest bg-gray-50/30">
                View All Requests
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-widest mb-5">Warehouse Map</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-tighter">WH-1 (Raw Materials)</span>
                    <span className="font-black text-slate-800">82%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-tighter">WH-2 (Consumables)</span>
                    <span className="font-black text-slate-800">45%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-2xl group hover:bg-orange-100 transition border border-orange-100">
                  <ArrowDownLeft size={20} className="text-amber-600 mb-1" />
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-tight">Stock Receipt</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition border border-slate-100">
                  <Package size={20} className="text-slate-600 mb-1" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Inventory Log</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;