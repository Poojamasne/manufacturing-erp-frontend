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
  SearchAlert,
  Clock,
  Download,

} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
  getAllQuotations,
  deleteQuotationEntry,
  deleteQuotationEntries,
  exportQuotationToPDF,
} from "../../ModuleStateFiles/VendorQuotationSlice";
import type { RootState } from "../../../../app/store/store";

type TimeFilter =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: { [key: string]: string } = {
    Draft: "text-slate-500 bg-slate-50 border-slate-100",
    Submitted: "text-blue-600 bg-blue-50 border-blue-100",
    "Under Review": "text-amber-600 bg-amber-50 border-amber-100",
    Accepted: "text-green-600 bg-green-50 border-green-100 font-black",
    Rejected: "text-red-600 bg-red-50 border-red-100",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status] || "text-slate-500 bg-slate-50"}`}
    >
      {status}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const VendorQuotationList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const { quotations } = useAppSelector(
    (state: RootState) => state.vendorQuotations,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    dispatch(getAllQuotations());
  }, [dispatch]);

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
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      )
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredQuotations = useMemo(() => {
    let filtered = [...quotations];
    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.quotation_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.rfq_ref.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (statusFilter !== "All")
      filtered = filtered.filter((q) => q.status === statusFilter);

    filtered = filtered.filter((q) => {
      const date = new Date(q.created_at);
      const now = new Date();
      if (timeFilter === "Weekly")
        return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
      if (timeFilter === "Monthly")
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      if (timeFilter === "Custom" && customRange.start && customRange.end)
        return (
          date >= new Date(customRange.start) &&
          date <= new Date(customRange.end)
        );
      return true;
    });
    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [quotations, searchQuery, statusFilter, timeFilter, customRange]);

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedData = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Vendor Quotations
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage and compare supplier commercial bids
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700 active:scale-95 transition-all"
              >
                <Filter size={16} className="text-[#F59E0B]" />
                <span>
                  {timeFilter === "Custom" && customRange.start
                    ? `${formatDate(customRange.start)}...`
                    : timeFilter}
                </span>
                <ChevronDown
                  size={14}
                  className={isTimeDropdownOpen ? "rotate-180" : ""}
                />
              </button>
              {isTimeDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                  {[
                    "All Time",
                    "Weekly",
                    "Monthly",
                    "Quarterly",
                    "Yearly",
                    "Custom",
                  ].map((tab) => (
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
                <div
                  ref={calendarRef}
                  className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72"
                >
                  <div className="space-y-3">
                    <input
                      type="date"
                      className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20"
                      onChange={(e) =>
                        setCustomRange({
                          ...customRange,
                          start: e.target.value,
                        })
                      }
                    />
                    <input
                      type="date"
                      className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20"
                      onChange={(e) =>
                        setCustomRange({ ...customRange, end: e.target.value })
                      }
                    />
                    <button
                      onClick={() => {
                        setTimeFilter("Custom");
                        setIsCalendarOpen(false);
                      }}
                      className="outline-none w-full bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() =>
                navigate("/purchase/vendor-quotations/create-vendor-quotation")
              }
              className="outline-none group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Create Quotation</span>
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search Bid ID, Vendor or RFQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
              />
            </div>
            <div className="flex gap-3" ref={filterRef}>
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === "status" ? null : "status",
                    )
                  }
                  className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 transition-all ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {statusFilter === "All" ? "Status" : statusFilter}
                  <ChevronDown
                    size={14}
                    className={activeDropdown === "status" ? "rotate-180" : ""}
                  />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute right-0 mt-2 w-25 bg-white rounded-2xl shadow-2xl z-50 py-2 border border-slate-50">
                    {[
                      "All",
                      "Under Review",
                      "Accepted",
                      "Rejected",
                      "Submitted",
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setStatusFilter(opt);
                          setActiveDropdown(null);
                        }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                disabled={selectedIds.length === 0}
                onClick={() => dispatch(deleteQuotationEntries(selectedIds))}
                className={`outline-none p-3 rounded-xl transition-all ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700 shadow-lg"}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                      checked={
                        selectedIds.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={() =>
                        setSelectedIds(
                          selectedIds.length === paginatedData.length
                            ? []
                            : paginatedData.map((v) => v.id),
                        )
                      }
                    />
                  </th>
                  <th className="px-4 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                    BID ID
                  </th>
                  <th className="px-4 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 font-bold">
                    Supplier / Context
                  </th>
                  <th className="px-4 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                    Unit Price
                  </th>
                  <th className="px-4 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                    Lead Time
                  </th>
                  <th className="px-4 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                    Status
                  </th>
                  <th className="px-4 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((q) => (
                    <tr
                      key={q.id}
                      className="group hover:bg-orange-50/20 transition-all"
                    >
                      <td className="p-5 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                          checked={selectedIds.includes(q.id)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(q.id)
                                ? prev.filter((i) => i !== q.id)
                                : [...prev, q.id],
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-5 text-[13px] font-mono font-black text-slate-800 text-center">
                        {q.quotation_id}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-slate-800 leading-tight group-hover:text-amber-600 transition-colors">
                            {q.vendor_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                            RFQ Ref: {q.rfq_ref}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center font-black text-slate-800">
                        ₹{q.unit_price.toLocaleString()}
                      </td>
                      <td className="px-4 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 bg-slate-50 py-1.5 rounded-xl border border-slate-100 px-3">
                          <Clock size={14} className="text-slate-300" />
                          <span className="text-[12px] font-bold text-slate-600">
                            {q.delivery_lead_time}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                "/purchase/vendor-quotations/view-vendor-quotation/" + q.id,
                              )
                            }
                            className="outline-none p-1.5 text-slate-400 hover:text-[#F59E0B] transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                "/purchase/vendor-quotations/edit-vendor-quotation/" + q.id,
                              )
                            }
                            className="outline-none p-1.5 text-slate-400 hover:text-green-500 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => dispatch(deleteQuotationEntry(q.id))}
                            className="outline-none p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => dispatch(exportQuotationToPDF(q.id))}
                            className="outline-none p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <SearchAlert
                        size={48}
                        className="mx-auto mb-4 text-amber-600 opacity-20"
                      />
                      <p className="text-slate-400 font-bold tracking-tight">
                        No Quotations Found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredQuotations.length,
                )}{" "}
                of {filteredQuotations.length} Bids Recorded
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="outline-none p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1.5">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`outline-none min-w-10 h-10 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${currentPage === i + 1 ? "bg-[#F59E0B] text-white" : "bg-white text-slate-500 border border-slate-200"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="outline-none p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                >
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

export default VendorQuotationList;
