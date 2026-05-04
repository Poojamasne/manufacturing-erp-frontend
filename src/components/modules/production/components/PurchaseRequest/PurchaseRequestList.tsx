import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

type TimeFilter =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

type PurchaseRequestStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "ORDERED"
  | "RECEIVED"
  | "CANCELLED";

type Priority = "HIGH" | "MEDIUM" | "LOW";

interface PurchaseRequest {
  id: string;
  prId: string;
  materialName: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  targetDate: string;
  status: PurchaseRequestStatus;
  priority: Priority;
  relatedProductionOrder?: string;
  createdAt: string;
}

const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: "1",
    prId: "PR-101",
    materialName: "Steel Rods 12mm",
    quantity: 500,
    unit: "kg",
    requestedBy: "Production Planner",
    targetDate: "2024-05-25",
    status: "PENDING",
    priority: "HIGH",
    relatedProductionOrder: "PO-001",
    createdAt: "2024-05-14",
  },
  {
    id: "2",
    prId: "PR-102",
    materialName: "Zinc Coating Liquid",
    quantity: 25,
    unit: "Liters",
    requestedBy: "System Auto-Gen",
    targetDate: "2024-05-28",
    status: "APPROVED",
    priority: "MEDIUM",
    relatedProductionOrder: "PO-003",
    createdAt: "2024-05-15",
  },
  {
    id: "3",
    prId: "PR-103",
    materialName: "Industrial Bolts",
    quantity: 2000,
    unit: "pcs",
    requestedBy: "Admin",
    targetDate: "2024-05-20",
    status: "RECEIVED",
    priority: "LOW",
    createdAt: "2024-05-10",
  },
  {
    id: "4",
    prId: "PR-104",
    materialName: "Aluminum Sheets",
    quantity: 150,
    unit: "Sheets",
    requestedBy: "Production Planner",
    targetDate: "2024-06-01",
    status: "ORDERED",
    priority: "HIGH",
    relatedProductionOrder: "PO-005",
    createdAt: "2024-05-16",
  }
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: PurchaseRequestStatus }> = ({ status }) => {
  const styles: Record<PurchaseRequestStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
    ORDERED: "bg-purple-100 text-purple-700 border-purple-200",
    RECEIVED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border whitespace-nowrap ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-[#f3f4e6] border-[#f3f4e6]",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const PurchaseRequestList: React.FC = () => {
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  const [requests, _setRequests] = useState<PurchaseRequest[]>(mockPurchaseRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [_customRange, __setCustomRange] = useState({ start: "", end: "" });
  const [currentPage, _setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [_isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, _setSelectedIds] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    ordered: requests.filter((r) => r.status === "ORDERED").length,
    received: requests.filter((r) => r.status === "RECEIVED").length,
  }), [requests]);

  // Handle outside clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(t)) {
        setIsTimeDropdownOpen(false);
        setIsCalendarOpen(false);
      }
      if (activeDropdown === "status" && statusDropdownRef.current && !statusDropdownRef.current.contains(t)) setActiveDropdown(null);
      if (activeDropdown === "priority" && priorityDropdownRef.current && !priorityDropdownRef.current.contains(t)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeDropdown]);

  const filteredRequests = useMemo(() => {
    let filtered = requests.filter((r) => 
      r.materialName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.prId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (statusFilter !== "All") filtered = filtered.filter(r => r.status === statusFilter);
    if (priorityFilter !== "All") filtered = filtered.filter(r => r.priority === priorityFilter);
    return filtered;
  }, [requests, searchQuery, statusFilter, priorityFilter]);

  const paginatedData = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//   const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Purchase Requests</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage material procurement for production</p>
          </div>

          <div className="relative" ref={timeDropdownRef}>
            <button onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)} className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{timeFilter}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-40 overflow-hidden">
                {["All Time", "Weekly", "Monthly", "Custom"].map(t => (
                  <button key={t} onClick={() => { setTimeFilter(t as TimeFilter); setIsTimeDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 text-slate-600 transition-colors italic font-medium">{t}</button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Requests" value={stats.total} border="border-orange-500" />
          <StatCard label="Pending Approval" value={stats.pending} border="border-yellow-500" />
          <StatCard label="Approved" value={stats.approved} border="border-blue-500" />
          <StatCard label="Ordered" value={stats.ordered} border="border-purple-500" />
          <StatCard label="Received" value={stats.received} border="border-green-500" />
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search material or PR ID..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <DropdownFilter 
                label="Status" 
                value={statusFilter} 
                options={["All", "PENDING", "APPROVED", "ORDERED", "RECEIVED"]} 
                active={activeDropdown === "status"}
                onToggle={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                onSelect={(val:any) => { setStatusFilter(val); setActiveDropdown(null); }}
                refObj={statusDropdownRef}
              />
              <DropdownFilter 
                label="Priority" 
                value={priorityFilter} 
                options={["All", "HIGH", "MEDIUM", "LOW"]} 
                active={activeDropdown === "priority"}
                onToggle={() => setActiveDropdown(activeDropdown === "priority" ? null : "priority")}
                onSelect={(val:any) => { setPriorityFilter(val); setActiveDropdown(null); }}
                refObj={priorityDropdownRef}
              />
              <button disabled={selectedIds.length === 0} className={`p-3 rounded-xl transition-all ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400" : "bg-rose-600 text-white shadow-lg shadow-rose-100"}`}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100">
                    <input type="checkbox" className="h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-[#F59E0B] relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:left-0.5 checked:after:top-0 outline-none cursor-pointer" />
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PR ID</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest">Material</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Priority</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Target Date</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((req) => (
                  <tr key={req.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center">
                      <input type="checkbox" className="h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-[#F59E0B] relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:left-0.5 checked:after:top-0 outline-none cursor-pointer" />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{req.prId}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 font-medium">{req.materialName}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center font-bold">{req.quantity} {req.unit}</td>
                    <td className="px-4 py-4 text-center"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{formatDate(req.targetDate)}</td>
                    <td className="px-4 py-4 text-center"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelectedRequest(req); setShowDetailsModal(true); }} className="p-1.5 text-slate-400 hover:text-[#F59E0B] transition-colors"><Eye size={16} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><Edit size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Showing {paginatedData.length} of {filteredRequests.length} Requests</span>
            <div className="flex gap-1.5">
                <button className="p-2.5 rounded-xl border bg-white text-slate-500 disabled:opacity-30"><ChevronLeft size={18}/></button>
                <button className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white font-bold text-xs">1</button>
                <button className="p-2.5 rounded-xl border bg-white text-slate-500 disabled:opacity-30"><ChevronRight size={18}/></button>
            </div>
          </footer>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedRequest.prId} Details</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Requested by: {selectedRequest.requestedBy}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 text-2xl">×</button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Material</label>
                    <p className="font-bold text-slate-800">{selectedRequest.materialName}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantity</label>
                    <p className="font-bold text-slate-800">{selectedRequest.quantity} {selectedRequest.unit}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                    <div className="mt-1"><StatusBadge status={selectedRequest.status}/></div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Priority</label>
                    <div className="mt-1"><PriorityBadge priority={selectedRequest.priority}/></div>
                </div>
            </div>
            <div className="p-6 border-t bg-slate-50/50 flex justify-end">
                <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2.5 bg-[#F59E0B] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-[#f67317] transition-all">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Shared Sub-Components ====================
const StatCard = ({ label, value, border }: { label: string; value: number; border: string }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${border} shadow-sm`}>
    <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-bold text-gray-700">{value}</p>
  </div>
);

const DropdownFilter = ({ label, value, options, active, onToggle, onSelect, refObj }: any) => (
  <div className="relative" ref={refObj}>
    <button onClick={onToggle} className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${value !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
      {value === "All" ? label : value.replace("_", " ")}
      <ChevronDown size={14} className={active ? "rotate-180" : ""} />
    </button>
    {active && (
      <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl z-50 py-2 border border-slate-50 overflow-hidden transition-all">
        {options.map((opt: string) => (
          <button key={opt} onClick={() => onSelect(opt)} className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 ${value === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}>
            {opt === "All" ? "All" : opt.replace("_", " ")}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default PurchaseRequestList;