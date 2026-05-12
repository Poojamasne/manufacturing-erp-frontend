import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShoppingCart,
  Eye,
  Trash2,
  Download,
} from "lucide-react";

type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type SalesOrderStatus = "PENDING" | "PROCESSING" | "DELIVERED" | "CANCELLED";
type Priority = "HIGH" | "MEDIUM" | "LOW";

interface SalesOrder {
  id: string;
  salesOrderId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  itemsCount: number;
  status: SalesOrderStatus;
  priority: Priority;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  createdAt: string;
}

const mockSalesOrders: SalesOrder[] = [
  {
    id: "1",
    salesOrderId: "SO-001",
    customerName: "Acme Industrial Corp",
    orderDate: "2026-05-10",
    deliveryDate: "2026-05-20",
    totalAmount: 15420.0,
    itemsCount: 5,
    status: "PROCESSING",
    priority: "HIGH",
    paymentStatus: "PAID",
    createdAt: "2026-05-10",
  },
  {
    id: "2",
    salesOrderId: "SO-002",
    customerName: "Global Manufacturing Ltd",
    orderDate: "2026-05-11",
    deliveryDate: "2026-05-18",
    totalAmount: 3200.5,
    itemsCount: 2,
    status: "PENDING",
    priority: "MEDIUM",
    paymentStatus: "UNPAID",
    createdAt: "2026-05-11",
  },
  {
    id: "3",
    salesOrderId: "SO-003",
    customerName: "BuildTech Solutions",
    orderDate: "2026-05-08",
    deliveryDate: "2026-05-22",
    totalAmount: 8900.0,
    itemsCount: 12,
    status: "CANCELLED",
    priority: "HIGH",
    paymentStatus: "PARTIAL",
    createdAt: "2026-05-08",
  },
  {
    id: "4",
    salesOrderId: "SO-004",
    customerName: "Apex Auto Parts",
    orderDate: "2026-05-05",
    deliveryDate: "2026-05-12",
    totalAmount: 24500.0,
    itemsCount: 25,
    status: "DELIVERED",
    priority: "LOW",
    paymentStatus: "PAID",
    createdAt: "2026-05-05",
  },
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: SalesOrderStatus }> = ({ status }) => {
  const styles: Record<SalesOrderStatus, string> = {
    PENDING: "bg-gray-100 text-gray-700 border-gray-200",
    PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border whitespace-nowrap ${styles[status]}`}>
      {status}
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

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const SalesOrderList: React.FC = () => {
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const viewSORef = useRef<HTMLDivElement>(null);

  const [orders, _setOrders] = useState<SalesOrder[]>(mockSalesOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = ["All", "PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];
  const priorityOptions = ["All", "HIGH", "MEDIUM", "LOW"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(target)) {
        setIsTimeDropdownOpen(false);
        setIsCalendarOpen(false);
      }

      if (viewSORef.current && !viewSORef.current.contains(target)) {
        setShowDetailsModal(false);
        setSelectedOrder(null);
      }
      if (activeDropdown === "status" && statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setActiveDropdown(null);
      }
      if (activeDropdown === "priority" && priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

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

  const handleCustomApply = () => {
    if (!customRange.start || !customRange.end) {
      alert("Please select date range");
      return;
    }
    setTimeFilter("Custom");
    setIsCalendarOpen(false);
    setIsTimeDropdownOpen(false);
  };

  const getFilterDisplayText = () => {
    if (timeFilter === "Custom" && customRange.start && customRange.end)
      return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
    return timeFilter;
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    if (searchQuery)
      filtered = filtered.filter(
        (o) =>
          o.salesOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (statusFilter !== "All") filtered = filtered.filter((o) => o.status === statusFilter);
    if (priorityFilter !== "All") filtered = filtered.filter((o) => o.priority === priorityFilter);

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (timeFilter === "Weekly") {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && diffDays >= 0;
      }
      if (timeFilter === "Monthly")
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Quarterly")
        return Math.floor(orderDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Yearly") return orderDate.getFullYear() === now.getFullYear();
      if (timeFilter === "Custom" && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, statusFilter, priorityFilter, timeFilter, customRange]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length && paginatedOrders.length > 0) setSelectedIds([]);
    else setSelectedIds(paginatedOrders.map((o) => o.id));
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sales Orders</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Incoming Sales Orders</p>
          </div>

          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{getFilterDisplayText()}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {isTimeDropdownOpen && !isCalendarOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-40 overflow-hidden">
                {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTimeFilterChange(tab as TimeFilter)}
                    className={`outline-none w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={() => handleTimeFilterChange("Custom")}
                  className={`outline-none w-full text-left px-4 py-2.5 text-[13px] ${timeFilter === "Custom" ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  Custom
                </button>
              </div>
            )}
            {isCalendarOpen && (
              <div className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-2xl z-50 w-72 border">
                <div className="space-y-3">
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <input
                    type="date"
                    value={customRange.end}
                    min={customRange.start}
                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
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
        </header>

        {/* Main Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search by SO ID or customer..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")}
                  className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {statusFilter === "All" ? "Status" : statusFilter}
                  <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setStatusFilter(opt); setActiveDropdown(null); }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Filter */}
              <div className="relative" ref={priorityDropdownRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "priority" ? null : "priority")}
                  className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${priorityFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {priorityFilter === "All" ? "Priority" : priorityFilter}
                  <ChevronDown size={14} className={activeDropdown === "priority" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "priority" && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setPriorityFilter(opt); setActiveDropdown(null); }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${priorityFilter === opt ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                disabled={selectedIds.length === 0}
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
                      checked={paginatedOrders.length > 0 && selectedIds.length === paginatedOrders.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">SO ID</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Customer</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Date</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Items</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Priority</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => {
                          if (selectedIds.includes(order.id)) setSelectedIds(selectedIds.filter((id) => id !== order.id));
                          else setSelectedIds([...selectedIds, order.id]);
                        }}
                      />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{order.salesOrderId}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.customerName}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{formatDate(order.orderDate)}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.itemsCount}</td>
                    <td className="px-4 py-4 text-center"><PriorityBadge priority={order.priority} /></td>
                    <td className="px-4 py-4 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }} className="outline-none p-1.5 text-slate-400 hover:text-[#F59E0B]">
                          <Eye size={16} />
                        </button>
                        {/* <button className="outline-none p-1.5 text-slate-400 hover:text-blue-500">
                          <Edit size={16} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="py-32 text-center">
                <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                  <ShoppingCart className="text-slate-200" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No Sales Orders Found</h3>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-[11px] font-bold text-slate-800 uppercase">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} Orders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="outline-none p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  <button className="outline-none min-w-10 h-10 rounded-xl text-xs font-bold bg-[#F59E0B] text-white shadow-lg">1</button>
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="outline-none p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* Details Modal (Theme Synced) */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={viewSORef} className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden">
            <div className="bg-white border-b p-6 flex justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedOrder.salesOrderId}</h2>
                <p className="text-sm text-gray-500">{selectedOrder.customerName}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 text-2xl hover:text-rose-500">×</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500">Order Date</label>
                  <p className="font-semibold">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500">Delivery Date</label>
                  <p className="font-semibold">{formatDate(selectedOrder.deliveryDate)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-xs text-gray-500">Total Items</label>
                  <p className="font-semibold">{selectedOrder.itemsCount}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-gray-50 rounded-xl flex-1">
                  <label className="text-xs text-gray-500">Status</label>
                  <div className="mt-1"><StatusBadge status={selectedOrder.status} /></div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex-1">
                  <label className="text-xs text-gray-500">Priority</label>
                  <div className="mt-1"><PriorityBadge priority={selectedOrder.priority} /></div>
                </div>
              </div>
            </div>
            <div className="bg-white border-t p-6 flex justify-end gap-3">
              <button
                onClick={() => { alert("Exporting Sales Order") }}
                className="px-4 py-2 border rounded-xl font-semibold text-sm text-white bg-slate-800 flex items-center gap-2 hover:bg-slate-900 transition-colors">
                <Download size={16} /> Export SO
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-[#F59E0B] text-white rounded-xl font-semibold text-sm shadow-md hover:bg-[#f67317] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderList;