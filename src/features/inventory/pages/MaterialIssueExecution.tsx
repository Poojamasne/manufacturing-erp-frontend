import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle2,
  ArrowRight,
  Edit,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type IssueStatus = "APPROVED" | "ISSUED" | "DELIVERED" | "REJECTED";

interface MaterialIssue {
  id: string;
  requestId: string;
  productionOrderId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unit: string;
  warehouseLocation: string;
  batchNumber: string;
  status: IssueStatus;
  createdAt: string;
}

// ==================== Mock Data ====================
const mockIssues: MaterialIssue[] = [
  { id: "1", requestId: "REQ-9001", productionOrderId: "PO-7721", materialName: "Steel Sheet 2mm", materialCode: "MAT-001", quantity: 150, unit: "kg", warehouseLocation: "WH-A / R-10", batchNumber: "BT-9920", status: "APPROVED", createdAt: new Date().toISOString() },
  { id: "2", requestId: "REQ-9005", productionOrderId: "PO-7725", materialName: "Aluminum Rod", materialCode: "MAT-088", quantity: 1200, unit: "m", warehouseLocation: "WH-B / R-04", batchNumber: "BT-8822", status: "ISSUED", createdAt: "2024-05-01T10:00:00Z" },
  { id: "3", requestId: "REQ-9009", productionOrderId: "PO-7730", materialName: "Copper Wire", materialCode: "MAT-042", quantity: 500, unit: "m", warehouseLocation: "WH-A / R-12", batchNumber: "BT-7741", status: "DELIVERED", createdAt: "2024-01-15T10:00:00Z" },
];

// ==================== Helper Components ====================
const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const MaterialIssueExecution: React.FC = () => {
  // Refs
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // States
  const [issues, setIssues] = useState<MaterialIssue[]>(mockIssues);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [modalType, setModalType] = useState<"view" | "process" | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<MaterialIssue | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Global Outside Click Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(target)) setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(target)) setIsCalendarOpen(false);
      if (statusRef.current && !statusRef.current.contains(target)) setActiveDropdown(null);
      if (modalRef.current && !modalRef.current.contains(target)) {
        // Only close modal if target isn't inside a calendar or other sub-dropdown
        setModalType(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeFilterChange = (value: TimeFilter) => {
    if (value === "Custom") setIsCalendarOpen(true);
    else { setTimeFilter(value); setIsCalendarOpen(false); setCustomRange({ start: "", end: "" }); }
    setIsTimeDropdownOpen(false);
  };

  // Update Status Logic
  const handleUpdateStatus = (newStatus: IssueStatus) => {
    if (!selectedIssue) return;
    setIssues(prev => prev.map(item => item.id === selectedIssue.id ? { ...item, status: newStatus } : item));
    setModalType(null);
  };

  const filteredData = useMemo(() => {
    return issues.filter(item => {
      const matchesSearch = item.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requestId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => Number(b.id) - Number(a.id));
  }, [issues, searchQuery, statusFilter]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase leading-none">Issue Material</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage Material Execution Flow</p>
          </div>

          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="outline-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm flex items-center gap-2 text-gray-700 hover:border-amber-300 transition-all"
            >
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{timeFilter === 'Custom' && customRange.start ? `${formatDate(customRange.start)} - ${formatDate(customRange.end)}` : timeFilter}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-44 border border-slate-100 overflow-hidden">
                {["All Time", "Weekly", "Monthly", "Yearly"].map(t => (
                  <button key={t} onClick={() => handleTimeFilterChange(t as TimeFilter)} className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === t ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>{t}</button>
                ))}
                <button onClick={() => setIsCalendarOpen(true)} className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50">Custom Range</button>
              </div>
            )}
            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72 animate-in fade-in zoom-in-95">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Start Date</label>
                  <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 font-bold text-sm" />
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">End Date</label>
                  <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 font-bold text-sm" />
                  <button onClick={() => { setIsCalendarOpen(false); setTimeFilter("Custom"); }} className="w-full bg-[#F59E0B] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-100">Apply Range</button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Approved to Issue" value={issues.filter(i => i.status === "APPROVED").length} color="border-blue-500" />
          <StatCard label="Dispatched / Issued" value={issues.filter(i => i.status === "ISSUED").length} color="border-amber-500" />
          <StatCard label="Delivered Today" value={issues.filter(i => i.status === "DELIVERED").length} color="border-emerald-500" />
          <StatCard label="Rejected" value={issues.filter(i => i.status === "REJECTED").length} color="border-rose-500" />
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text" placeholder="Search Material or Req ID..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative min-w-48" ref={statusRef}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${statusFilter !== "All" ? "bg-[#f3f4e6] border-amber-400 text-[#F59E0B]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                <span className="truncate">{statusFilter === "All" ? "Filter by Status" : statusFilter}</span>
                <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
              </button>
              {activeDropdown === "status" && (
                <div className="absolute right-0 mt-2 w-full bg-white rounded-2xl shadow-2xl z-50 py-2 border border-slate-50 overflow-hidden">
                  {["All", "APPROVED", "ISSUED", "DELIVERED", "REJECTED"].map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setActiveDropdown(null); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === s ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Req ID</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Reference</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100">Material Specification</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Quantity</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="px-6 py-6 text-[13px] font-mono font-bold text-slate-800 text-center">{item.requestId}</td>
                    <td className="px-6 py-6 text-[13px] text-blue-600 text-center font-bold tracking-tight">{item.productionOrderId}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-white transition shadow-sm"><Package size={16} /></div>
                        <div>
                          <p className="text-[13px] font-extrabold text-slate-800 uppercase leading-tight">{item.materialName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.materialCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <p className="text-[13px] font-black text-slate-800">{item.quantity} <span className="text-[10px] text-amber-500 uppercase">{item.unit}</span></p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${item.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'ISSUED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          item.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{item.status}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setSelectedIssue(item); setModalType("view"); }} className="p-2 text-slate-400 hover:text-amber-500 transition-all hover:bg-white rounded-xl"><Eye size={18} /></button>
                        <button onClick={() => { setSelectedIssue(item); setModalType("process"); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all hover:bg-white rounded-xl"><Edit size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} Requests
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30 transition-all"><ChevronLeft size={18} /></button>
              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`min-w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#F59E0B] text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30 transition-all"><ChevronRight size={18} /></button>
            </div>
          </footer>
        </div>
      </div>

      {/* MODAL: VIEW DETAILS */}
      {modalType === "view" && selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Request Specs</h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-rose-500 text-2xl transition-colors">×</button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <ModalDetail label="Request ID" value={selectedIssue.requestId} />
                <ModalDetail label="Production ID" value={selectedIssue.productionOrderId} />
                <ModalDetail label="Material" value={selectedIssue.materialName} />
                <ModalDetail label="Batch Target" value={selectedIssue.batchNumber} />
                <ModalDetail label="Allocated Qty" value={`${selectedIssue.quantity} ${selectedIssue.unit}`} />
                <ModalDetail label="Storage" value={selectedIssue.warehouseLocation} />
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50/50 flex justify-end">
              <button onClick={() => setModalType(null)} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROCESS EXECUTION */}
      {modalType === "process" && selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div
            ref={modalRef}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >

            {/* HEADER */}
            <div className="border-b bg-blue-50/30 flex justify-between items-center px-5 py-4">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  Dispatch Action
                </h2>

                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                  Executing: {selectedIssue.requestId}
                </p>
              </div>

              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-rose-500 text-xl"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="px-4 py-3">

              {/* WORKFLOW CARD */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 mb-3">
                <Truck size={26} className="text-blue-500" />

                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Workflow Step
                  </p>

                  <p className="text-sm font-bold text-slate-800">
                    Dispatch to Production Floor
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2">

                {/* MARK AS ISSUED */}
                <button
                  onClick={() => handleUpdateStatus("ISSUED")}
                  className={`w-full flex items-center justify-between p-3 border rounded-xl group transition-all ${selectedIssue.status === "ISSUED"
                      ? "bg-blue-600 border-blue-700"
                      : "bg-blue-50 border-blue-100 hover:bg-blue-600"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition shadow-sm ${selectedIssue.status === "ISSUED"
                          ? "bg-white text-blue-600"
                          : "bg-white text-blue-600 group-hover:scale-110"
                        }`}
                    >
                      <Package size={18} />
                    </div>

                    <span
                      className={`font-black text-[11px] uppercase tracking-widest ${selectedIssue.status === "ISSUED"
                          ? "text-white"
                          : "text-blue-900 group-hover:text-white"
                        }`}
                    >
                      Mark as Issued
                    </span>
                  </div>

                  {selectedIssue.status === "ISSUED" ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    <ArrowRight size={16} className="text-blue-300 group-hover:text-white" />
                  )}
                </button>

                {/* CONFIRM DELIVERY */}
                <button
                  onClick={() => handleUpdateStatus("DELIVERED")}
                  className={`w-full flex items-center justify-between p-3 border rounded-xl group transition-all ${selectedIssue.status === "DELIVERED"
                      ? "bg-emerald-600 border-emerald-700"
                      : "bg-emerald-50 border-emerald-100 hover:bg-emerald-600"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition shadow-sm ${selectedIssue.status === "DELIVERED"
                          ? "bg-white text-emerald-600"
                          : "bg-white text-emerald-600 group-hover:scale-110"
                        }`}
                    >
                      <CheckCircle2 size={18} />
                    </div>

                    <span
                      className={`font-black text-[11px] uppercase tracking-widest ${selectedIssue.status === "DELIVERED"
                          ? "text-white"
                          : "text-emerald-900 group-hover:text-white"
                        }`}
                    >
                      Confirm Delivery
                    </span>
                  </div>

                  {selectedIssue.status === "DELIVERED" ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    <ArrowRight size={16} className="text-emerald-300 group-hover:text-white" />
                  )}
                </button>

                {/* REJECT ISSUE */}
                <button
                  onClick={() => handleUpdateStatus("REJECTED")}
                  className={`w-full flex items-center justify-between p-3 border rounded-xl group transition-all ${selectedIssue.status === "REJECTED"
                      ? "bg-rose-600 border-rose-700"
                      : "bg-rose-50 border-rose-100 hover:bg-rose-600"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition shadow-sm ${selectedIssue.status === "REJECTED"
                          ? "bg-white text-rose-600"
                          : "bg-white text-rose-400 group-hover:scale-110"
                        }`}
                    >
                      <Package size={18} />
                    </div>

                    <span
                      className={`font-black text-[11px] uppercase tracking-widest ${selectedIssue.status === "REJECTED"
                          ? "text-white"
                          : "text-rose-900 group-hover:text-white"
                        }`}
                    >
                      Reject Issue
                    </span>
                  </div>

                  {selectedIssue.status === "REJECTED" ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : (
                    <ArrowRight size={16} className="text-rose-300 group-hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t bg-slate-50/50">
              <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest mb-3">
                Inventory balances update automatically
              </p>

              <button
                onClick={() => setModalType(null)}
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-slate-700 transition-colors"
              >
                Discard Execution
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Sub-Components ====================
const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${color} shadow-sm hover:shadow-md transition-shadow`}>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
  </div>
);

const ModalDetail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
    <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">{value}</p>
  </div>
);

export default MaterialIssueExecution;