import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  Edit,
  Package,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";

// ==================== Types ====================
type TimeFilter =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

interface SalesOrder {
  id: string;
  productName: string;
  quantity: number;
  deliveryDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status?: string;
  created_at?: string;
}


// ==================== Mock Data ====================
const mockSalesOrders: SalesOrder[] = [
  {
    id: "SO-001",
    productName: "Industrial Bolt M12",
    quantity: 5000,
    deliveryDate: "2024-05-20",
    customerName: "ABC Industries",
    customerEmail: "contact@abc.com",
    customerPhone: "+91 98765 43210",
    priority: "HIGH",
    created_at: "2024-05-10",
  },
  {
    id: "SO-002",
    productName: "Aluminum Frame 4x4",
    quantity: 250,
    deliveryDate: "2024-05-18",
    customerName: "XYZ Corp",
    customerEmail: "sales@xyz.com",
    customerPhone: "+91 87654 32109",
    priority: "HIGH",
    created_at: "2024-05-11",
  },
  {
    id: "SO-003",
    productName: "Plastic Container L",
    quantity: 1000,
    deliveryDate: "2024-05-22",
    customerName: "PQR Ltd",
    customerEmail: "info@pqr.com",
    customerPhone: "+91 76543 21098",
    priority: "MEDIUM",
    created_at: "2024-05-12",
  },
  {
    id: "SO-004",
    productName: "Rubber Gasket Set",
    quantity: 3000,
    deliveryDate: "2024-05-25",
    customerName: "MNO Enterprises",
    customerEmail: "orders@mno.com",
    customerPhone: "+91 65432 10987",
    priority: "LOW",
    created_at: "2024-05-09",
  },
  {
    id: "SO-005",
    productName: "Steel Plate 6mm",
    quantity: 1500,
    deliveryDate: "2024-05-28",
    customerName: "DEF Ltd",
    customerEmail: "purchase@def.com",
    customerPhone: "+91 54321 09876",
    priority: "HIGH",
    created_at: "2024-05-13",
  },
];


// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: { [key: string]: string } = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-[#f3f4e6] border-[#f3f4e6]",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status] || styles.MEDIUM}`}
    >
      {status}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const ProductionPlanningScreen: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(mockSalesOrders);
  const [selectedOrder, _setSelectedOrder] = useState<SalesOrder | null>(null);
  const [viewOrder, _setViewOrder] = useState<SalesOrder | null>(null);
  const [_currentStep, _setCurrentStep] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter States
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...salesOrders];

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (priorityFilter !== "All") {
      filtered = filtered.filter((order) => order.priority === priorityFilter);
    }

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.created_at || order.deliveryDate);
      const now = new Date();

      if (timeFilter === "Weekly") {
        const diffDays =
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays >= 0;
      }
      if (timeFilter === "Monthly") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === "Quarterly") {
        return (
          Math.floor(orderDate.getMonth() / 3) ===
          Math.floor(now.getMonth() / 3) &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === "Yearly") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      if (timeFilter === "Custom" && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });

    return filtered.sort(
      (a, b) =>
        new Date(b.created_at || b.deliveryDate).getTime() -
        new Date(a.created_at || a.deliveryDate).getTime(),
    );
  }, [salesOrders, searchQuery, priorityFilter, timeFilter, customRange]);

  // Pagination
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

  const toggleSelectAll = () => {
    if (
      selectedIds.length === paginatedOrders.length &&
      paginatedOrders.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((o) => o.id));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this sales order?")) {
      setSalesOrders(salesOrders.filter((o) => o.id !== id));
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} order(s)?`)) {
      setSalesOrders(salesOrders.filter((o) => !selectedIds.includes(o.id)));
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
              Production Planning
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Plan production from confirmed sales orders
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Global Time Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
              >
                <Filter size={16} className="outline-none text-[#F59E0B]" />
                <span>{getFilterDisplayText()}</span>
                <ChevronDown
                  size={14}
                  className={isTimeDropdownOpen ? "outline-none rotate-180" : ""}
                />
              </button>

              {isTimeDropdownOpen && !isCalendarOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                  {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        {tab}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => handleTimeFilterChange("Custom")}
                    className={`outline-none w-full text-left px-4 py-2 text-[13px] ${timeFilter === "Custom" ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
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
                      className="outline-none w-full bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#f67317]"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Create New Plan Button */}
            <button
              onClick={() => navigate("/production/planning/new-plan")}
              className="outline-none group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-2.5 py-2 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/5 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create New Plan</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        {/* Main Data Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 outline-none text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by order ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl 
                 focus:bg-white focus:ring-4 focus:ring-orange-500/5 
                 text-sm outline-none"
              />
            </div>

            {/* Right side filters and actions */}
            <div className="flex flex-wrap gap-3">
              {/* Priority Filter */}
              <div className="relative" ref={priorityRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "priority" ? null : "priority")}
                  className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${priorityFilter !== "All"
                    ? "bg-orange-50 border-orange-200 text-amber-500"
                    : "bg-white border-slate-200 text-slate-600"
                    }`}
                >
                  {priorityFilter === "All" ? "Priority" : priorityFilter}
                  <ChevronDown
                    size={14}
                    className={activeDropdown === "priority" ? "outline-none rotate-180" : ""}
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
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${priorityFilter === opt
                          ? "text-amber-500 font-bold bg-orange-50/50"
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
                className={`outline-none p-3 rounded-xl ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}
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
                      className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                      checked={
                        paginatedOrders.length > 0 &&
                        selectedIds.length === paginatedOrders.length
                      }
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
                    DELIVERY DATE
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">
                    CUSTOMER
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
                        className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => {
                          if (selectedIds.includes(order.id))
                            setSelectedIds(
                              selectedIds.filter((id) => id !== order.id),
                            );
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
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center whitespace-nowrap">
                      {formatDate(order.deliveryDate)}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={order.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/production/planning/view-plan/${order.id}`)}
                          className="outline-none p-1.5 text-slate-400 hover:text-[#F59E0B] transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/production/planning/edit-plan/${order.id}`)}
                          className="outline-none p-1.5 text-slate-400 hover:text-green-500 transition-colors"
                          title="Plan Production"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="outline-none p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="outline-none" />
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
                  <Package className="outline-none text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No Sales Orders Found
                </h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  No confirmed sales orders matching your filter criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
                {filteredOrders.length} Orders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="outline-none p-2.5 rounded-xl border border-slate-500 bg-white text-slate-500 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30"
                >
                  <ChevronLeft size={18} className="outline-none " />
                </button>
                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={i} className="px-2 text-slate-300">
                        <MoreHorizontal size={14} className="outline-none" />
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => goToPage(page as number)}
                        className={`outline-none min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="outline-none p-2.5 rounded-xl border border-slate-500 bg-white text-slate-500 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30"
                >
                  <ChevronRight size={18} className="outline-none" />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between">
              <div>
                <h2 className="text-xl font-bold">{viewOrder.id}</h2>
                <p className="text-sm text-gray-500">{viewOrder.productName}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="outline-none text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Product</label>
                  <p className="font-semibold">{viewOrder.productName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Quantity</label>
                  <p className="font-semibold">{viewOrder.quantity.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Delivery Date</label>
                  <p className="font-semibold">{formatDate(viewOrder.deliveryDate)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Priority</label>
                  <StatusBadge status={viewOrder.priority} />
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Customer</label>
                  <p className="font-semibold">{viewOrder.customerName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Contact</label>
                  <p className="font-semibold">{viewOrder.customerPhone}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Email</label>
                  <p className="font-semibold text-sm">{viewOrder.customerEmail}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500 uppercase">Created At</label>
                  <p className="font-semibold">{formatDate(viewOrder.created_at || "")}</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="outline-none px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => navigate("/production/planning/edit-plan/" + (selectedOrder ? selectedOrder.id : "1"))}
                className="outline-none px-4 py-2 bg-[#F59E0B] text-white rounded-xl hover:bg-[#f67317] flex items-center gap-2"
              >
                <Edit size={14} /> Plan Production
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanningScreen;