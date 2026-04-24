import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Play,
  X,
  ArrowRight,
  Clock,
  Factory,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";

type TimeFilter =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

interface ProductionOrder {
  id: string;
  productName: string;
  quantity: number;
  deadline: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  created_at?: string;
}

const mockOrders: ProductionOrder[] = [
  {
    id: "PO-1001",
    productName: "Industrial Bolt M12",
    quantity: 5000,
    deadline: "2024-05-20",
    priority: "HIGH",
    created_at: "2024-05-10",
  },
  {
    id: "PO-1002",
    productName: "Aluminum Frame 4x4",
    quantity: 250,
    deadline: "2024-05-18",
    priority: "HIGH",
    created_at: "2024-05-11",
  },
  {
    id: "PO-1003",
    productName: "Plastic Container L",
    quantity: 1000,
    deadline: "2024-05-22",
    priority: "MEDIUM",
    created_at: "2024-05-12",
  },
  {
    id: "PO-1004",
    productName: "Rubber Gasket Set",
    quantity: 3000,
    deadline: "2024-05-25",
    priority: "LOW",
    created_at: "2024-05-09",
  },
  {
    id: "PO-1005",
    productName: "Steel Plate 6mm",
    quantity: 1500,
    deadline: "2024-05-28",
    priority: "HIGH",
    created_at: "2024-05-13",
  },
  {
    id: "PO-1006",
    productName: "Copper Wire 2mm",
    quantity: 2000,
    deadline: "2024-05-30",
    priority: "MEDIUM",
    created_at: "2024-05-14",
  },
];

// ==================== Helper Components ====================
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles: { [key: string]: string } = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-teal-50 border-teal-100",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[priority] || styles.MEDIUM}`}
    >
      {priority}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

const ProductionScheduling: React.FC = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  // Data States
  const [orders, setOrders] = useState<ProductionOrder[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI States
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    shift: "Morning",
  });

  // Priority options
  const priorityOptions = ["All", "HIGH", "MEDIUM", "LOW"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTimeDropdownOpen(false);
      }
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
      if (
        priorityRef.current &&
        !priorityRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset page on filter change
  useEffect(() => {
    //eslint-disable-next-line react-hooks/exhaustive-deps
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, timeFilter, customRange]);

  // Handle time filter change
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

  // Handle custom range apply
  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
    setTimeFilter("Custom");
    setIsCalendarOpen(false);
    setIsTimeDropdownOpen(false);
  };

  // Get filter display text
  const getFilterDisplayText = () => {
    if (timeFilter === "Custom" && customRange.start && customRange.end) {
      return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    }
    return timeFilter;
  };

  // Filter Logic
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        priorityFilter === "All" || order.priority === priorityFilter;

      // Time Filter Logic
      const orderDate = new Date(order.created_at || order.deadline);
      const now = new Date();
      let matchesTime = true;

      if (timeFilter === "Weekly") {
        const diffDays =
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        matchesTime = diffDays <= 7 && diffDays >= 0;
      } else if (timeFilter === "Monthly") {
        matchesTime =
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === "Quarterly") {
        matchesTime =
          Math.floor(orderDate.getMonth() / 3) ===
            Math.floor(now.getMonth() / 3) &&
          orderDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === "Yearly") {
        matchesTime = orderDate.getFullYear() === now.getFullYear();
      } else if (
        timeFilter === "Custom" &&
        customRange.start &&
        customRange.end
      ) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        matchesTime = orderDate >= start && orderDate <= end;
      }

      return matchesSearch && matchesPriority && matchesTime;
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at || b.deadline).getTime() -
        new Date(a.created_at || a.deadline).getTime(),
    );
  }, [orders, searchQuery, priorityFilter, timeFilter, customRange]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenModal = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleViewDetails = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this production order?")) {
      setOrders(orders.filter((o) => o.id !== id));
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} order(s)?`)) {
      setOrders(orders.filter((o) => !selectedIds.includes(o.id)));
      setSelectedIds([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Production Scheduling
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Initiate and manage production runs
            </p>
          </div>

          {/* Time Filter - Matching Production Planning Style */}
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
                {["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                        timeFilter === tab
                          ? "text-orange-600 font-bold bg-orange-50/50"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ),
                )}
                <button
                  onClick={() => handleTimeFilterChange("Custom")}
                  className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                    timeFilter === "Custom"
                      ? "text-orange-600 font-bold bg-orange-50/50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
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

        {/* Main Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            {/* Search Bar - Left Side */}
            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by order ID or product..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters and Actions - Right Side */}
            <div className="flex flex-wrap gap-3">
              {/* Priority Filter */}
              <div className="relative" ref={priorityRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "priority" ? null : "priority")}
                  className={`px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${
                    priorityFilter !== "All"
                      ? "bg-orange-50 border-orange-200 text-orange-600"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {priorityFilter === "All" ? "Priority" : priorityFilter}
                  <ChevronDown
                    size={14}
                    className={activeDropdown === "priority" ? "rotate-180" : ""}
                  />
                </button>

                {activeDropdown === "priority" && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl z-50 py-2">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setPriorityFilter(opt);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${
                          priorityFilter === opt
                            ? "text-orange-600 font-bold bg-orange-50/50"
                            : "text-slate-600"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bulk Delete Button */}
              <button
                disabled={selectedIds.length === 0}
                onClick={handleBulkDelete}
                className={`p-3 rounded-xl ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}
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
                      className="accent-orange-500 w-4 h-4 cursor-pointer"
                      checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ORDER ID
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    PRODUCT
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    QUANTITY
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    DEADLINE
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    PRIORITY
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="group hover:bg-orange-50/20 transition-colors"
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="accent-orange-500 w-4 h-4 cursor-pointer"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => {
                          if (selectedIds.includes(order.id))
                            setSelectedIds(selectedIds.filter((id) => id !== order.id));
                          else setSelectedIds([...selectedIds, order.id]);
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      {order.productName}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      {formatDate(order.deadline)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <PriorityBadge priority={order.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(order)}
                          className="p-1.5 text-slate-400 hover:text-green-500 transition-colors"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <Factory className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No Production Orders Found
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  No production orders matching your filter criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing{" "}
                {filteredOrders.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to {Math.min(currentPage * itemsPerPage, filteredOrders.length)}{" "}
                of {filteredOrders.length} Orders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} />
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
                        className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          currentPage === page
                            ? "bg-orange-500 text-white shadow-lg"
                            : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Start Production Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                    <Factory size={18} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">
                    Start Production
                  </h2>
                </div>
                <p className="text-sm text-slate-400 font-medium">
                  Configure run for{" "}
                  <span className="text-orange-600 font-bold">
                    {selectedOrder.id}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">
                  Production Shift
                </label>
                <div className="flex gap-2">
                  {["Morning", "Afternoon", "Evening"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, shift: s })}
                      className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all border ${
                        formData.shift === s
                          ? "bg-orange-50 border-orange-300 text-orange-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
                <Clock size={16} className="text-slate-400 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Starting this production will notify the assigned operators
                  and update the machine load status automatically.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Run <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500">{selectedOrder.productName}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Product</label>
                  <p className="font-semibold">{selectedOrder.productName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Quantity</label>
                  <p className="font-semibold">{selectedOrder.quantity.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Deadline</label>
                  <p className="font-semibold">{formatDate(selectedOrder.deadline)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Priority</label>
                  <PriorityBadge priority={selectedOrder.priority} />
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Created At</label>
                  <p className="font-semibold">{formatDate(selectedOrder.created_at || "")}</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleOpenModal(selectedOrder);
                }}
                className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
              >
                Start Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionScheduling;