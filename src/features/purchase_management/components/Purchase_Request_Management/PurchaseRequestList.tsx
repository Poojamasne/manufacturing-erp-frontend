import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Edit,
  Eye,
  Trash2,
  Plus,
  Building2,
  SearchAlert,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { deletePurchaseRequest, getAllPurchaseRequests } from "../../ModuleStateFiles/PurchaseRequestManagementSlice";
import type { RootState } from "../../../../app/store/store";

//  Types 
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";


// Helper Components 
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: { [key: string]: string } = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-[#f3f4e6] border-[#f3f4e6]",
    // PR Statuses
    Approved: "text-green-600 bg-green-50 border-green-100",
    Rejected: "text-red-600 bg-red-50 border-red-100",
    Submitted: "text-blue-600 bg-blue-50 border-blue-100",
    Draft: "text-slate-500 bg-slate-50 border-slate-100",
    "In Process": "text-orange-600 bg-orange-50 border-orange-100",
    Completed: "text-purple-600 bg-purple-50 border-purple-100",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status] || "text-slate-500 bg-slate-50 border-slate-100"}`}>
      {status}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const PurchaseRequestList: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  // State
  const { purchaseRequests } = useAppSelector((state: RootState) => state.purchaseRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(getAllPurchaseRequests());
  }, [dispatch]);

  // Filter Logic
  const filteredRequests = useMemo(() => {
    let filtered = [...purchaseRequests];
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.material_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (priorityFilter !== "All") filtered = filtered.filter((r) => r.priority === priorityFilter);

    // Time Filtering logic remains same as Production screen
    filtered = filtered.filter((r) => {
      const date = new Date(r.created_at);
      const now = new Date();
      if (timeFilter === "Weekly") return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
      if (timeFilter === "Monthly") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      if (timeFilter === "Custom" && customRange.start && customRange.end) {
        return date >= new Date(customRange.start) && date <= new Date(customRange.end);
      }
      return true;
    });

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [purchaseRequests, searchQuery, priorityFilter, timeFilter, customRange]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedData = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length && paginatedData.length > 0) setSelectedIds([]);
    else setSelectedIds(paginatedData.map((o) => o.id));
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Purchase Requests</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage material shortages and procurement requests</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Time Filter - Same Style as Production */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
              >
                <Filter size={16} className="text-[#F59E0B]" />
                <span>{timeFilter === "Custom" && customRange.start ? `${formatDate(customRange.start)}...` : timeFilter}</span>
                <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
              </button>

              {isTimeDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                  {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === "Custom") setIsCalendarOpen(true);
                        else setTimeFilter(tab as TimeFilter);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`outline-none w-full text-left px-4 py-2 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {isCalendarOpen && (
                <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                  <div className="space-y-3">
                    <input type="date" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20"
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
                    <input type="date" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20"
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
                    <button onClick={() => { setTimeFilter("Custom"); setIsCalendarOpen(false); }}
                      className="outline-none w-full bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-lg text-sm font-bold">Apply Range</button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/purchase/purchase-requests/create-purchase-request")}
              className="group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Create PR</span>
            </button>
          </div>
        </header>

        {/* Table Container - Style: [2.5rem] rounding */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search PR, Material or Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none"
              />
            </div>

            <div className="flex gap-3" ref={filterRef}>
              <button
                onClick={() => setActiveDropdown(activeDropdown === "priority" ? null : "priority")}
                className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${priorityFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}
              >
                {priorityFilter === "All" ? "Priority" : priorityFilter}
                <ChevronDown size={14} className={activeDropdown === "priority" ? "rotate-180" : ""} />
              </button>

              {activeDropdown === "priority" && (
                <div className="absolute mt-14 w-32 bg-white rounded-2xl shadow-2xl z-50 py-2">
                  {["All", "HIGH", "MEDIUM", "LOW"].map((opt) => (
                    <button key={opt} onClick={() => { setPriorityFilter(opt); setActiveDropdown(null); }}
                      className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${priorityFilter === opt ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}>{opt}</button>
                  ))}
                </div>
              )}

              <button disabled={selectedIds.length === 0} className={`outline-none p-3 rounded-xl ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400" : "bg-rose-600 text-white hover:bg-rose-700"}`}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Table - Same header and row styles */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                      checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">PR ID</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">Material</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">Quantity</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">Department</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">Required Date</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">Status</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">Priority</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.length > 0 ? paginatedData.map((pr) => (
                  <tr key={pr.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                        checked={selectedIds.includes(pr.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(pr.id) ? prev.filter(id => id !== pr.id) : [...prev, pr.id])}
                      />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{pr.id}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[13px] font-bold text-slate-700">{pr.material_name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">{pr.material_code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      <span className="font-bold">{pr.quantity}</span> <span className="text-slate-400">{pr.unit}</span>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Building2 size={14} className="text-slate-300" />
                        {pr.department}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{formatDate(pr.required_date)}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <StatusBadge status={pr.status} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className={`text-[10px] font-bold ${pr.priority === 'HIGH' ? 'text-red-500' : pr.priority === 'MEDIUM' ? 'text-amber-500' : 'text-slate-600'}`}>{pr.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate("/purchase/purchase-requests/view-purchase-request/" + pr.id)}
                          className="outline-none p-1.5 text-slate-400 hover:text-[#F59E0B] transition-colors"><Eye size={16} /></button>
                        <button
                          onClick={() => navigate("/purchase/purchase-requests/edit-purchase-request/" + pr.id)}
                          className="outline-none p-1.5 text-slate-400 hover:text-green-500 transition-colors"><Edit size={16} /></button>
                        <button
                          onClick={() => dispatch(deletePurchaseRequest(pr.id))}
                          className="outline-none p-1.5 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-slate-600 font-semibold text-lg"
                  >
                    <SearchAlert size={48} className="mx-auto mb-4 text-amber-600" />
                    Purchase Requests Not Found
                  </td>
                </tr>}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer - Replicating exactly */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} Requests
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                  className="outline-none p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1.5">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)}
                      className={`outline-none  min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                  className="outline-none p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30">
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestList;