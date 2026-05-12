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
import { useAppDispatch } from "../../../app/store/hook";
import type { RootState } from "../../../app/store/store";
import { useAppSelector } from "../../common/ReduxMainHooks";
import { updateRequestStatus } from "../ModuleStateFiles/MaterialIssueAndExecutionSlice";

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

const MaterialIssueRequestHandling: React.FC = () => {
  // Refs
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const { requests } = useAppSelector((state: RootState) => state.inventoryMaterialIssueAndExecution);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [modalType, setModalType] = useState<"view" | "edit" | null>(null);
  const [selectedReq, setSelectedReq] = useState<IssueRequest | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Helper: Format Date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  const handleTimeFilterChange = (value: TimeFilter) => {
    if (value === "Custom") {
      setIsCalendarOpen(true);
    } else {
      setTimeFilter(value);
      setCustomRange({ start: "", end: "" });
      setIsCalendarOpen(false);
    }
    setIsTimeDropdownOpen(false);
  };

  // Filter Logic (Search + Status + Time)
  const filteredData = useMemo(() => {
    return requests.filter((item) => {
      // 1. Search Filter
      const matchesSearch =
        item.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productionOrderId.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status Filter
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      // 3. Time Filter
      let matchesTime = true;
      const recordDate = new Date(item.createdAt).getTime();
      const now = new Date().getTime();

      if (timeFilter === "Weekly") matchesTime = recordDate > now - 7 * 24 * 60 * 60 * 1000;
      else if (timeFilter === "Monthly") matchesTime = recordDate > now - 30 * 24 * 60 * 60 * 1000;
      else if (timeFilter === "Yearly") matchesTime = recordDate > now - 365 * 24 * 60 * 60 * 1000;
      else if (timeFilter === "Custom" && customRange.start && customRange.end) {
        const start = new Date(customRange.start).setHours(0, 0, 0, 0);
        const end = new Date(customRange.end).setHours(23, 59, 59, 999);
        matchesTime = recordDate >= start && recordDate <= end;
      }

      return matchesSearch && matchesStatus && matchesTime;
    }).sort((a, b) => Number(b.id) - Number(a.id));
  }, [requests, searchQuery, statusFilter, timeFilter, customRange]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const updateStatus = (newStatus: RequestStatus) => {
    if (!selectedReq) return;
    dispatch(updateRequestStatus(selectedReq.id, newStatus));
    setModalType(null);
  };

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
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none">Issue Request Handling</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">Production Demand Log & Stock Verification</p>
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
                <button onClick={() => setIsCalendarOpen(true)} className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50">Custom</button>
              </div>
            )}

            {isCalendarOpen && (
              <div
                ref={calendarRef}
                className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72 animate-in fade-in zoom-in-95"
              >
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        start: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none"
                  />

                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        end: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none"
                  />

                  <button
                    onClick={() => {
                      setIsCalendarOpen(false);
                      setTimeFilter("Custom");
                    }}
                    className="w-full bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#f67317]"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search PO ID, Material..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none font-bold transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative min-w-40" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${statusFilter !== "All" ? "bg-[#f3f4e6] border-amber-400 text-[#F59E0B]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                <span className="truncate">{statusFilter === "All" ? "Filter Status" : statusFilter.replace("_", " ")}</span>
                <ChevronDown size={14} className={isStatusDropdownOpen ? "rotate-180" : ""} />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                  <button onClick={() => { setStatusFilter("All"); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-[11px] uppercase hover:bg-slate-50 ${statusFilter === "All" ? "bg-[#f3f4e6] border-amber-400 text-[#F59E0B] text-[13px] font-bold" : ""}`}>All</button>
                  {["PENDING", "APPROVED", "REJECTED", "PURCHASE_NOTIFIED"].map((s) => (
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
                          <p className="text-[13px] font-extrabold text-slate-800 uppercase">{req.materialName}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{req.materialCode}</p>
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
                        <button onClick={() => { setSelectedReq(req); setModalType("view"); }} className="p-2 text-slate-400 hover:text-amber-500 transition-all hover:bg-white rounded-xl"><Eye size={18} /></button>
                        <button onClick={() => { setSelectedReq(req); setModalType("edit"); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all hover:bg-white rounded-xl"><Edit size={18} /></button>
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
              Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} Requests
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30 transition-all shadow-sm"><ChevronLeft size={18} /></button>
              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`min-w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? "bg-[#F59E0B] text-white shadow-lg shadow-orange-100" : "bg-white text-slate-500 border border-slate-200 hover:border-amber-200"}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30 transition-all shadow-sm"><ChevronRight size={18} /></button>
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

      {/* MODAL: EDIT DECISION */}
      {modalType === "edit" && selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b bg-orange-50/30">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Issue Decision</h2>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Ref: {selectedReq.requestId}</p>
            </div>
            <div className="p-8 space-y-3">
              {selectedReq.qtyAvailable >= selectedReq.qtyRequired ? (
                <button onClick={() => updateStatus("APPROVED")} className={`w-full flex items-center justify-between p-5 border rounded-2xl group transition-all ${selectedReq.status === "APPROVED" ? "bg-emerald-600 border-emerald-700" : "bg-emerald-50 border-emerald-100 hover:bg-emerald-600"}`}>
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
                <button onClick={() => updateStatus("PURCHASE_NOTIFIED")} className={`w-full flex items-center justify-between p-5 border rounded-2xl group transition-all ${selectedReq.status === "PURCHASE_NOTIFIED" ? "bg-blue-600 border-blue-700" : "bg-blue-50 border-blue-100 hover:bg-blue-600"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition shadow-sm ${selectedReq.status === "PURCHASE_NOTIFIED" ? "bg-white text-blue-600" : "bg-white text-blue-600 group-hover:scale-110"}`}><Truck size={24} /></div>
                    <div className="text-left">
                      <p className={`font-black text-sm uppercase tracking-tight ${selectedReq.status === "PURCHASE_NOTIFIED" ? "text-white" : "text-blue-900 group-hover:text-white"}`}>Notify Purchase</p>
                      <p className={`text-[10px] font-bold ${selectedReq.status === "PURCHASE_NOTIFIED" ? "text-blue-100" : "text-blue-600 group-hover:text-blue-100"}`}>Shortage Found</p>
                    </div>
                  </div>
                  {selectedReq.status === "PURCHASE_NOTIFIED" ? <CheckCircle2 size={20} className="text-white" /> : <ArrowRight size={20} className="text-blue-300 group-hover:text-white" />}
                </button>
              )}
              <button onClick={() => updateStatus("REJECTED")} className={`w-full flex items-center justify-between p-5 border rounded-2xl group transition-all ${selectedReq.status === "REJECTED" ? "bg-rose-600 border-rose-700" : "bg-rose-50 border-rose-100 hover:bg-rose-600"}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition shadow-sm ${selectedReq.status === "REJECTED" ? "bg-white text-rose-600" : "bg-white text-rose-400 group-hover:scale-110"}`}><XCircle size={24} /></div>
                  <div className="text-left text-white">
                    <p className={`font-black text-sm uppercase tracking-tight ${selectedReq.status === "REJECTED" ? "text-white" : "text-rose-900 group-hover:text-white"}`}>Reject Request</p>
                    <p className={`text-[10px] font-bold ${selectedReq.status === "REJECTED" ? "text-rose-100" : "text-rose-400 group-hover:text-rose-100"}`}>Manual Decline</p>
                  </div>
                </div>
              </button>
            </div>
            <div className="p-8 border-t bg-slate-50/50 flex justify-center">
              <button onClick={() => setModalType(null)} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600">Discard Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModalDetail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
    <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">{value}</p>
  </div>
);

export default MaterialIssueRequestHandling;