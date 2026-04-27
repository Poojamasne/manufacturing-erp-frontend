import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  MoreHorizontal,
  ShoppingCart,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getOrders,
  clearSalesErrors,
  deleteOrder,
} from "../ModuleStateFiles/OrderSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";


type TimeTab =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";
type Status = "Pending" | "Processing" | "Delivered" | "Cancelled" | "All";

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  order_date: string;
  total_amount: string;
  status: string;
  sales_rep_name: string;
}

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const calendarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { orders, pagination } = useAppSelector(
    (state: RootState) => state.SalesOrder,
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
  const [statusFilter, setStatusFilter] = useState<Status>("All");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [debouncedSearch, setDebouncedSearch] = useState("");


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  const fetchOrders = useCallback(() => {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (statusFilter !== "All") params.status = statusFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab !== "All Time") params.dateRange = activeTab;
    if (activeTab === "Custom" && customRange.start && customRange.end) {
      params.startDate = customRange.start;
      params.endDate = customRange.end;
    }

    dispatch(getOrders(params));
  }, [
    dispatch,
    currentPage,
    statusFilter,
    debouncedSearch,
    activeTab,
    customRange,
  ]);

  useEffect(() => {
    fetchOrders();
    return () => {
      dispatch(clearSalesErrors());
    };
  }, [fetchOrders]);

  useEffect(() => {
    //eslint-disable-next-line react-hooks/exhaustive-deps
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch, activeTab, customRange]);

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
      alert("Please select date range");
      return;
    }
    setActiveTab("Custom");
    setIsCalendarOpen(false);
    setIsDropdownOpen(false);
    setCurrentPage(1);
    fetchOrders();
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
    if (selectedIds.length === orders.length && orders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o: Order) => o.id));
    }
  };

  const handleDeleteOrder = async (orderId: string, orderRef: string) => {
    const result = await Swal.fire({
      title: "Delete Order?",
      html: `Are you sure you want to delete order <strong>${orderRef}</strong>?<br>This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await dispatch(deleteOrder(orderId));
      setSelectedIds((prev) => prev.filter((id) => id !== orderId));
      fetchOrders();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `Delete ${selectedIds.length} orders?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: `Yes, delete ${selectedIds.length} order${selectedIds.length > 1 ? "s" : ""}`,
    });

    if (result.isConfirmed) {
      for (const id of selectedIds) {
        await dispatch(deleteOrder(id));
      }
      setSelectedIds([]);
      fetchOrders();
    }
  };

  const getStatusStyle = (st: string) => {
    const base =
      "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ";
    switch (st) {
      case "Pending":
        return base + "bg-amber-50 text-amber-600 border-amber-100";
      case "Processing":
        return base + "bg-blue-50 text-blue-600 border-blue-100";
      case "Delivered":
        return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Cancelled":
        return base + "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return base + "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Fulfillment tracking and order history management.
            </p>
          </div>

          {/* Button Group Container */}
          <div className="flex items-center gap-3">
            {/* --- Filter Dropdown --- */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 flex items-center gap-1 text-gray-700 transition-all active:scale-95"
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
                  {(["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"] as TimeTab[]).map(
                    (tab) => (
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
                    )
                  )}
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

              {/* Custom Date Range Popup */}
              {isCalendarOpen && (
                <div
                  ref={calendarRef}
                  className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72"
                >
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                    />
                    <input
                      type="date"
                      value={customRange.end}
                      min={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                    />
                    <button
                      onClick={handleCustomApply}
                      className="w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#f67317] transition-colors"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* --- Create Order Button --- */}
            <button
              onClick={() => navigate("/sales/orders/create")}
              className="outline-none flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl shadow-orange-900/10 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              Create Order
            </button>
          </div>
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
                placeholder="Search by Order ID or Customer..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
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
                    {(
                      [
                        "All",
                        "Pending",
                        "Processing",
                        "Delivered",
                        "Cancelled",
                      ] as Status[]
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatusFilter(s);
                          setIsStatusOpen(false);
                          setCurrentPage(1);
                          fetchOrders();
                        }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === s ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50" : "text-slate-600"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                className={`p-3 rounded-xl transition-all ${selectedIds.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                  }`}
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
                      className="accent-[#F59E0B] w-4 h-4 cursor-pointer"
                      checked={
                        selectedIds.length === orders.length &&
                        orders.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ORDER ID
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ORDER DATE
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    CUSTOMER NAME
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    TOTAL AMOUNT
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    STATUS
                  </th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o: Order) => (
                  <tr
                    key={o.id}
                    className="group hover:bg-[#f3f4e6]/20 transition-colors"
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="accent-[#F59E0B] w-4 h-4 cursor-pointer"
                        checked={selectedIds.includes(o.id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(o.id)
                              ? prev.filter((i) => i !== o.id)
                              : [...prev, o.id],
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-medium text-slate-800 text-center">
                      {o.order_id}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-600 text-center whitespace-nowrap">
                      {o.order_date
                        ? formatDate(o.order_date)
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-[13px] font-medium text-slate-800 text-center">
                      {o.customer_name || "-"}
                    </td>
                    <td className="px-4 py-4 text-[14px] font-bold text-slate-800 text-center">
                      ₹{Number(o.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={getStatusStyle(o.status)}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          title="View"
                          onClick={() =>
                            navigate(`/sales/orders/order-view/${o.id}`)
                          }
                          className="outline-none p-2 hover:bg-white text-slate-500 hover:text-[#F59E0B] rounded-xl transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Download"
                          className="outline-none p-2 hover:bg-white text-slate-500 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDeleteOrder(o.id, o.order_id)}
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

            {orders.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <ShoppingCart className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No Orders Found
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  We couldn't find any orders matching your current filter
                  criteria.
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
                    {orders.length > 0
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
                  Orders
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

export default OrderList;
