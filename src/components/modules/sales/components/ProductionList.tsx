import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreHorizontal,
  Settings,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getProductions,
  deleteProduction,
  clearSalesErrors,
} from "../ModuleStateFiles/ProductionSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Types ---
type ProdStatus =
  | "Pending"
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Delayed"
  | "All";
type Stage =
  | "Pending"
  | "Raw Materials"
  | "Cutting"
  | "Assembly"
  | "Quality Check"
  | "Packaging"
  | "All";
type TimeTab =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

interface ProductionJob {
  id: number;
  job_id: string;
  product_name: string;
  status: string;
  order_id: string;
  quantity: number;
  stage: string;
  updated_at: string;
  customer_name: string;
  assigned_to_name: string;
}

const ProductionList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const calendarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { productions, pagination } = useAppSelector(
    (state: RootState) => state.SalesProduction,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
  const [statusFilter, setStatusFilter] = useState<ProdStatus>("All");
  const [stageFilter, setStageFilter] = useState<Stage>("All");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Status options
  const statusOptions = [
    "All",
    "Pending",
    "In Progress",
    "On Hold",
    "Completed",
    "Delayed",
  ];

  // Stage options
  const stageOptions: Stage[] = [
    "All",
    "Pending",
    "Raw Materials",
    "Cutting",
    "Assembly",
    "Quality Check",
    "Packaging",
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch productions with filters
  const fetchProductions = useCallback(() => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (statusFilter !== "All") params.status = statusFilter;
    if (stageFilter !== "All") params.stage = stageFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab !== "All Time" && activeTab !== "Custom")
      params.dateRange = activeTab;
    if (activeTab === "Custom" && customRange.start && customRange.end) {
      params.startDate = customRange.start;
      params.endDate = customRange.end;
    }

    dispatch(getProductions(params));
  }, [
    dispatch,
    currentPage,
    statusFilter,
    stageFilter,
    debouncedSearch,
    activeTab,
    customRange,
  ]);

  useEffect(() => {
    fetchProductions();
    return () => {
      dispatch(clearSalesErrors());
    };
  }, [fetchProductions]);

  useEffect(() => {
    //eslint-disable-next-line react-hooks/exhaustive-deps
    setCurrentPage(1);
  }, [statusFilter, stageFilter, debouncedSearch, activeTab, customRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle filter change - closes dropdown automatically
  const handleFilterChange = (value: TimeTab) => {
    if (value === "Custom") {
      setIsCalendarOpen(true);
      setIsDropdownOpen(false);
    } else {
      setActiveTab(value);
      setIsDropdownOpen(false);
      setIsCalendarOpen(false);
      setCustomRange({ start: "", end: "" });
    }
  };

  // Handle custom range application
  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select both start and end date");
      return;
    }
    setActiveTab("Custom");
    setIsCalendarOpen(false);
    setIsDropdownOpen(false);
    setCurrentPage(1);
    // Fetch will be triggered by the useEffect that depends on activeTab and customRange
  };

  // Get display text for filter button
  const getFilterDisplayText = () => {
    const formatDate = (dateStr: any) => {
      const date = new Date(dateStr);

      const day = date.getDate();
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });

      return `${day} ${month} ${year}`;
    };

    if (activeTab === "Custom" && customRange.start && customRange.end) {
      return `${formatDate(customRange.start)} to ${formatDate(customRange.end)}`;
    }

    return activeTab;
  };

  const totalPages = pagination?.pages || 0;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === productions.length && productions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productions.map((j: ProductionJob) => j.id));
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteProduction(id.toString()));
    fetchProductions();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await dispatch(deleteProduction(id.toString()));
    }
    setSelectedIds([]);
    fetchProductions();
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusStyle = (st: string) => {
    const base =
      "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ";
    switch (st) {
      case "Pending":
        return base + "bg-amber-50 text-amber-600 border-amber-100";
      case "In Progress":
        return base + "bg-blue-50 text-blue-600 border-blue-100";
      case "Completed":
        return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Delayed":
        return base + "bg-rose-50 text-rose-600 border-rose-100";
      case "On Hold":
        return base + "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return base + "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  const getStageStyle = (st: string) => {
    const base =
      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ";
    switch (st) {
      case "Raw Materials":
        return base + "text-purple-600 bg-purple-50";
      case "Cutting":
        return base + "text-indigo-600 bg-indigo-50";
      case "Assembly":
        return base + "text-teal-600 bg-[#f3f4e6]";
      case "Quality Check":
        return base + "text-blue-600 bg-blue-50";
      case "Packaging":
        return base + "text-emerald-600 bg-emerald-50";
      default:
        return base + "text-slate-500 bg-slate-50";
    }
  };


  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Production
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Real-time oversight of manufacturing floor stages.
            </p>
          </div>
          {/* --- Time Filters - With Filter Button (Matching OrderList) --- */}
          <section className="relative mb-3 flex justify-end">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 flex items-center gap-2 text-gray-700"
              >
                <Filter size={16} className="text-[#F59E0B]" />
                <span>{getFilterDisplayText()}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && !isCalendarOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                  {(
                    [
                      "All Time",
                      "Weekly",
                      "Monthly",
                      "Quarterly",
                      "Yearly",
                    ] as TimeTab[]
                  ).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleFilterChange(tab)}
                      className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${activeTab === tab
                        ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFilterChange("Custom")}
                    className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${activeTab === "Custom"
                      ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50"
                      : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    Custom
                  </button>
                </div>
              )}

              {/* Custom Date Range Popup - No pre-filled dates */}
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
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                      placeholder="Start Date"
                    />

                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) =>
                        setCustomRange({ ...customRange, end: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                      placeholder="End Date"
                    />

                    <button
                      onClick={handleCustomApply}
                      className="w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm hover:bg-[#004a40] transition-colors"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </header>



        {/* Main Data Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Job ID, Product..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
              {/* Status Filter */}
              <div className="relative min-w-35">
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${statusFilter !== "All" ? "bg-[#f3f4e6] border-teal-200 text-[#F59E0B]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  <span className="truncate">
                    {statusFilter === "All" ? "Status" : statusFilter}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isStatusOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setStatusFilter(opt as ProdStatus);
                          setIsStatusOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50" : "text-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stage Filter */}
              <div className="relative min-w-35">
                <button
                  onClick={() => setIsStageOpen(!isStageOpen)}
                  className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${stageFilter !== "All" ? "bg-[#f3f4e6] border-teal-200 text-[#F59E0B]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  <span className="truncate">
                    {stageFilter === "All" ? "Stage" : stageFilter}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isStageOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isStageOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {stageOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setStageFilter(opt);
                          setIsStageOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${stageFilter === opt ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50" : "text-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 disabled:opacity-20 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                      checked={
                        selectedIds.length === productions.length &&
                        productions.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    JOB ID
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ORDER ID
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    PRODUCT
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    QTY
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    STAGE
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    STATUS
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    UPDATED
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productions.map((j: ProductionJob) => (
                  <tr
                    key={j.id}
                    className="group hover:bg-[#f3f4e6]/20 transition-colors"
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                        checked={selectedIds.includes(j.id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(j.id)
                              ? prev.filter((i) => i !== j.id)
                              : [...prev, j.id],
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-medium text-slate-800 text-center">
                      {j.job_id}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-600 text-center">
                      {j.order_id || "-"}
                    </td>
                    <td
                      className="px-4 py-4 text-[13px] font-medium text-slate-800 truncate max-w-50"
                      title={j.product_name}
                    >
                      {j.product_name}
                    </td>
                    <td className="px-4 py-4 text-[13px] font-bold text-slate-800 text-center">
                      {j.quantity}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={getStageStyle(j.stage)}>{j.stage}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={getStatusStyle(j.status)}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-600 text-center whitespace-nowrap">
                      {formatDate(j.updated_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          title="Edit Production"
                          onClick={() =>
                            navigate(
                              `/sales/production/production-edit/${j.id}`,
                            )
                          }
                          className="outline-none p-2 hover:bg-white text-slate-500 hover:text-[#F59E0B] rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          title="Delete Job"
                          onClick={() => handleDelete(j.id)}
                          className="outline-none p-2 hover:bg-white text-slate-500 hover:text-rose-600 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {productions.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <Settings className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No Production Jobs
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  We couldn't find any manufacturing records matching these
                  filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                  Showing{" "}
                  <span className="text-slate-900">
                    {productions.length > 0
                      ? (currentPage - 1) * itemsPerPage + 1
                      : 0}
                  </span>{" "}
                  to{" "}
                  <span className="text-slate-900">
                    {Math.min(
                      currentPage * itemsPerPage,
                      pagination?.total || 0,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-900">
                    {pagination?.total || 0}
                  </span>{" "}
                  Jobs
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={i} className="px-2 text-slate-300">
                        <MoreHorizontal size={14} />
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => goToPage(page as number)}
                        className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-500/5 scale-105" : "bg-white text-slate-500 border border-slate-200"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionList;
