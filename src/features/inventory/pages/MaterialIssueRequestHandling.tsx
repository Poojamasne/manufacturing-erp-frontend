import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Edit,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "PURCHASE_NOTIFIED";

interface IssueRequest {
  id: string;
  requestId: string;
  productionOrderId: string;
  materialName: string;
  materialCode: string;
  qtyRequired: number;
  qtyAvailable: number;
  unit: string;
  status: RequestStatus;
  createdAt: string;
}

// ==================== Mock Data ====================
const mockRequests: IssueRequest[] = [
  { id: "1", requestId: "REQ-4001", productionOrderId: "PO-7721", materialName: "Steel Sheet 2mm", materialCode: "MAT-001", qtyRequired: 150, qtyAvailable: 500, unit: "kg", status: "PENDING", createdAt: new Date().toISOString() },
  { id: "2", requestId: "REQ-4005", productionOrderId: "PO-7725", materialName: "Aluminum Rod", materialCode: "MAT-088", qtyRequired: 2000, qtyAvailable: 450, unit: "m", status: "PENDING", createdAt: "2024-05-01T10:00:00Z" },
  { id: "3", requestId: "REQ-4009", productionOrderId: "PO-7730", materialName: "Copper Wire", materialCode: "MAT-042", qtyRequired: 500, qtyAvailable: 1200, unit: "m", status: "APPROVED", createdAt: "2024-01-15T10:00:00Z" },
  { id: "4", requestId: "REQ-4012", productionOrderId: "PO-7735", materialName: "Polymer Resin", materialCode: "MAT-102", qtyRequired: 800, qtyAvailable: 0, unit: "kg", status: "PURCHASE_NOTIFIED", createdAt: "2024-02-10T10:00:00Z" },
];

const MaterialIssueRequestHandling: React.FC = () => {
  // Refs
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // States
  const [requests, setRequests] = useState<IssueRequest[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [_isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit" | null>(null);
  const [selectedReq, setSelectedReq] = useState<IssueRequest | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Handle Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(target)) setIsTimeDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) setIsStatusDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(target)) setIsCalendarOpen(false);
      if (modalRef.current && !modalRef.current.contains(target)) setModalType(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return requests.filter(item => {
      const matchesSearch = item.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productionOrderId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => Number(b.id) - Number(a.id));
  }, [requests, searchQuery, statusFilter]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const updateStatus = (newStatus: RequestStatus) => {
    if (!selectedReq) return;
    setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: newStatus } : r));
    setModalType(null);
  };

  // Helper for Status Badges in Table
  const getStatusBadge = (status: RequestStatus) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-600 border-amber-100",
      APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
      REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
      PURCHASE_NOTIFIED: "bg-blue-50 text-blue-600 border-blue-100",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase leading-none">Issue Request Handling</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Production Demand Log & Stock Verification</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Filter */}
            <div className="relative" ref={timeDropdownRef}>
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="outline-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm flex items-center gap-2 text-gray-700 hover:border-amber-300 transition-all"
              >
                <Filter size={16} className="text-[#F59E0B]" />
                <span>{timeFilter}</span>
                <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
              </button>
              {isTimeDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-44 border border-slate-100 overflow-hidden">
                  {["All Time", "Weekly", "Monthly", "Yearly"].map(t => (
                    <button key={t} onClick={() => { setTimeFilter(t as TimeFilter); setIsTimeDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === t ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}>{t}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text" placeholder="Search PO ID, Material..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dynamic Status Filter (Mirroring Batch Filter Style) */}
            <div className="relative min-w-40" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${statusFilter !== "All" ? "bg-[#f3f4e6] border-amber-400 text-[#F59E0B]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                <span className="truncate">{statusFilter === "All" ? "Filter by Status" : statusFilter.replace("_", " ")}</span>
                <ChevronDown size={14} className={isStatusDropdownOpen ? "rotate-180" : ""} />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                  <button onClick={() => { setStatusFilter("All"); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === "All" ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}>All</button>
                  {["PENDING", "APPROVED", "REJECTED", "PURCHASE_NOTIFIED"].map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s as RequestStatus); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === s ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}>{s.replace("_", " ")}</button>
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
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">PO - ID</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100">Material Requirement</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Quantity</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Status</th>
                  <th className="px-6 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((req) => (
                  <tr key={req.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="px-6 py-6 text-[13px] font-mono font-bold text-slate-800 text-center">{req.requestId}</td>
                    <td className="px-6 py-6 text-[13px] text-blue-600 text-center font-bold tracking-tight">{req.productionOrderId}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-white transition shadow-sm"><Package size={16} /></div>
                        <div>
                          <p className="text-[13px] font-extrabold text-slate-800 uppercase leading-tight">{req.materialName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{req.materialCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <p className="text-[13px] font-black text-slate-800">{req.qtyRequired.toLocaleString()} <span className="text-[10px] text-amber-500 uppercase">{req.unit}</span></p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          title="View Request"
                          onClick={() => { setSelectedReq(req); setModalType("view"); }} className="p-2 text-slate-400 hover:text-amber-500 transition-all hover:bg-white rounded-xl"><Eye size={18} /></button>
                        <button
                          title="Edit Request Status"
                          onClick={() => { setSelectedReq(req); setModalType("edit"); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all hover:bg-white rounded-xl"><Edit size={18} /></button>
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
              Showing {filteredData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} Requests
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30 transition-all shadow-sm"><ChevronLeft size={18} /></button>
              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`min-w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#F59E0B] text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-200'}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30 transition-all shadow-sm"><ChevronRight size={18} /></button>
            </div>
          </footer>
        </div>
      </div>

      {/* MODAL: VIEW DETAILS */}
      {modalType === "view" && selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Request Specifications</h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-rose-500 text-2xl transition-colors">×</button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <ModalDetail label="Production ID" value={selectedReq.productionOrderId} />
                <ModalDetail label="Request ID" value={selectedReq.requestId} />
                <ModalDetail label="Material" value={selectedReq.materialName} />
                <ModalDetail label="SKU Code" value={selectedReq.materialCode} />
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-end justify-between">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Volume Required</label>
                  <p className="text-4xl font-black text-slate-800">{selectedReq.qtyRequired.toLocaleString()} <span className="text-sm font-bold text-amber-500">{selectedReq.unit}</span></p>
                </div>
                <div className="text-right">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Current Stock</label>
                  <p className="text-xl font-bold text-blue-600">{selectedReq.qtyAvailable.toLocaleString()} {selectedReq.unit}</p>
                </div>
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50/50 flex justify-end">
              <button onClick={() => setModalType(null)} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STATUS / DECISION */}
      {modalType === "edit" && selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b bg-orange-50/30">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Issue Decision</h2>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Ref: {selectedReq.requestId}</p>
            </div>

            <div className="p-8 space-y-3">
              {/* Logic: Stock Check for Approval/Purchase */}
              {selectedReq.qtyAvailable >= selectedReq.qtyRequired ? (
                <button
                  onClick={() => updateStatus("APPROVED")}
                  className={`w-full flex items-center justify-between p-5 border rounded-2xl group transition-all ${selectedReq.status === "APPROVED" ? "bg-emerald-600 border-emerald-700" : "bg-emerald-50 border-emerald-100 hover:bg-emerald-600"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition shadow-sm ${selectedReq.status === "APPROVED" ? "bg-white text-emerald-600" : "bg-white text-emerald-600 group-hover:scale-110"}`}><CheckCircle2 size={24} /></div>
                    <div className="text-left">
                      <p className={`font-black text-sm uppercase tracking-tight ${selectedReq.status === "APPROVED" ? "text-white" : "text-emerald-900 group-hover:text-white"}`}>Approve Issue</p>
                      <p className={`text-[10px] font-bold ${selectedReq.status === "APPROVED" ? "text-emerald-100" : "text-emerald-600 group-hover:text-emerald-100"}`}>Stock Sufficient</p>
                    </div>
                  </div>
                  {selectedReq.status === "APPROVED" ? <CheckCircle2 size={20} className="text-white" /> : <ArrowRight size={20} className="text-emerald-300 group-hover:text-white" />}
                </button>
              ) : (
                <button
                  onClick={() => updateStatus("PURCHASE_NOTIFIED")}
                  className={`w-full flex items-center justify-between p-5 border rounded-2xl group transition-all ${selectedReq.status === "PURCHASE_NOTIFIED" ? "bg-blue-600 border-blue-700" : "bg-blue-50 border-blue-100 hover:bg-blue-600"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition shadow-sm ${selectedReq.status === "PURCHASE_NOTIFIED" ? "bg-white text-blue-600" : "bg-white text-blue-600 group-hover:scale-110"}`}><Truck size={24} /></div>
                    <div className="text-left">
                      <p className={`font-black text-sm uppercase tracking-tight ${selectedReq.status === "PURCHASE_NOTIFIED" ? "text-white" : "text-blue-900 group-hover:text-white"}`}>Notify Purchase</p>
                      <p className={`text-[10px] font-bold ${selectedReq.status === "PURCHASE_NOTIFIED" ? "text-blue-100" : "text-blue-600 group-hover:text-blue-100"}`}>Shortage: {selectedReq.qtyRequired - selectedReq.qtyAvailable} {selectedReq.unit}</p>
                    </div>
                  </div>
                  {selectedReq.status === "PURCHASE_NOTIFIED" ? <CheckCircle2 size={20} className="text-white" /> : <ArrowRight size={20} className="text-blue-300 group-hover:text-white" />}
                </button>
              )}

              {/* Manual Reject */}
              <button
                onClick={() => updateStatus("REJECTED")}
                className={`w-full flex items-center justify-between p-5 border rounded-2xl group transition-all ${selectedReq.status === "REJECTED" ? "bg-rose-600 border-rose-700" : "bg-rose-50 border-rose-100 hover:bg-rose-600"}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition shadow-sm ${selectedReq.status === "REJECTED" ? "bg-white text-rose-600" : "bg-white text-rose-400 group-hover:scale-110 group-hover:text-rose-600"}`}><XCircle size={24} /></div>
                  <div className="text-left">
                    <p className={`font-black text-sm uppercase tracking-tight ${selectedReq.status === "REJECTED" ? "text-white" : "text-rose-900 group-hover:text-white"}`}>Reject Request</p>
                    <p className={`text-[10px] font-bold ${selectedReq.status === "REJECTED" ? "text-rose-100" : "text-rose-400 group-hover:text-rose-100"}`}>Manual Decline</p>
                  </div>
                </div>
                {selectedReq.status === "REJECTED" ? <CheckCircle2 size={20} className="text-white" /> : <ArrowRight size={20} className="text-rose-300 group-hover:text-white" />}
              </button>

              {/* Revert to Pending */}
              <button
                onClick={() => updateStatus("PENDING")}
                className={`w-full flex items-center justify-between p-5 border rounded-2xl group transition-all ${selectedReq.status === "PENDING" ? "bg-slate-800 border-slate-900" : "bg-slate-50 border-slate-100 hover:bg-slate-800"}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition shadow-sm ${selectedReq.status === "PENDING" ? "bg-white text-slate-800" : "bg-white text-slate-400 group-hover:scale-110"}`}><Package size={24} /></div>
                  <div className="text-left">
                    <p className={`font-black text-sm uppercase tracking-tight ${selectedReq.status === "PENDING" ? "text-white" : "text-slate-700 group-hover:text-white"}`}>Reset to Pending</p>
                    <p className={`text-[10px] font-bold ${selectedReq.status === "PENDING" ? "text-slate-400" : "text-slate-400 group-hover:text-slate-400"}`}>Undo Decision</p>
                  </div>
                </div>
                {selectedReq.status === "PENDING" ? <CheckCircle2 size={20} className="text-white" /> : <ArrowRight size={20} className="text-slate-300 group-hover:text-white" />}
              </button>
            </div>

            <div className="p-8 border-t bg-slate-50/50 flex justify-center">
              <button onClick={() => setModalType(null)} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors">Discard Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ==================== Modal Helpers ====================
const ModalDetail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
    <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">{value}</p>
  </div>
);

export default MaterialIssueRequestHandling;