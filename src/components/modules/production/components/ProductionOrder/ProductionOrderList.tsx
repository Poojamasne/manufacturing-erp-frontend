import React, { useState, useMemo, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type ProductionOrderStatus = "DRAFT" | "PLANNED" | "SCHEDULED" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
type Priority = "HIGH" | "MEDIUM" | "LOW";

interface ProductionOrder {
  id: string;
  productionOrderId: string;
  salesOrderId: string;
  productName: string;
  quantity: number;
  deadline: string;
  status: ProductionOrderStatus;
  priority: Priority;
  createdAt: string;
}

const mockOrders: ProductionOrder[] = [
  { id: "1", productionOrderId: "PO-001", salesOrderId: "SO-001", productName: "Industrial Bolt M12", quantity: 5000, deadline: "2024-05-20", status: "IN_PROGRESS", priority: "HIGH", createdAt: "2024-05-14" },
  { id: "2", productionOrderId: "PO-002", salesOrderId: "SO-002", productName: "Aluminum Frame 4x4", quantity: 250, deadline: "2024-05-18", status: "PLANNED", priority: "HIGH", createdAt: "2024-05-12" },
  { id: "3", productionOrderId: "PO-003", salesOrderId: "SO-003", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "4", productionOrderId: "PO-004", salesOrderId: "SO-004", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "5", productionOrderId: "PO-005", salesOrderId: "SO-005", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "6", productionOrderId: "PO-006", salesOrderId: "SO-006", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "7", productionOrderId: "PO-007", salesOrderId: "SO-007", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "8", productionOrderId: "PO-008", salesOrderId: "SO-008", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "9", productionOrderId: "PO-009", salesOrderId: "SO-009", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "10", productionOrderId: "PO-010", salesOrderId: "SO-010", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "11", productionOrderId: "PO-011", salesOrderId: "SO-011", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
  { id: "12", productionOrderId: "PO-012", salesOrderId: "SO-0012", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", status: "ON_HOLD", priority: "MEDIUM", createdAt: "2024-05-13" },
];

// ==================== Helper Components ====================
const StatusBadge: React.FC<{ status: ProductionOrderStatus }> = ({ status }) => {
  const styles: Record<ProductionOrderStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    PLANNED: "bg-blue-100 text-blue-700 border-blue-200",
    SCHEDULED: "bg-purple-100 text-purple-700 border-purple-200",
    IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
    ON_HOLD: "bg-yellow-100 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
  };
  return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border whitespace-nowrap ${styles[status]}`}>{status}</span>;
};

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-[#f3f4e6] border-[#f3f4e6]",
  };
  return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[priority]}`}>{priority}</span>;
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const ProductionOrderList: React.FC = () => {
  // const navigate = useNavigate();
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const stats = useMemo(() => ({
    total: mockOrders.length,
    inProgress: mockOrders.filter(o => o.status === "IN_PROGRESS").length,
    completed: mockOrders.filter(o => o.status === "COMPLETED").length,
    planned: mockOrders.filter(o => o.status === "PLANNED" || o.status === "SCHEDULED").length,
    onHold: mockOrders.filter(o => o.status === "ON_HOLD").length,
  }), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (activeDropdown === "time" && timeDropdownRef.current && !timeDropdownRef.current.contains(target)) setActiveDropdown(null);
      if (activeDropdown === "status" && statusDropdownRef.current && !statusDropdownRef.current.contains(target)) setActiveDropdown(null);
      if (showDetailsModal && modalContentRef.current && !modalContentRef.current.contains(target)) setShowDetailsModal(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, showDetailsModal]);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(o =>
      (o.productName.toLowerCase().includes(searchQuery.toLowerCase()) || o.productionOrderId.includes(searchQuery)) &&
      (statusFilter === "All" || o.status === statusFilter)
    );
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Production Orders</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage and track all production orders</p>
          </div>

          <div className="relative" ref={timeDropdownRef}>
            <button onClick={() => setActiveDropdown(activeDropdown === "time" ? null : "time")} className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-[#F59E0B]" />
              <span>{timeFilter}</span>
              <ChevronDown size={14} className={activeDropdown === "time" ? "rotate-180" : ""} />
            </button>
            {activeDropdown === "time" && (
              <div className="absolute right-0 mt-2 bg-white rounded-2xl shadow-2xl z-50 py-2 min-w-40 border border-slate-50 overflow-hidden font-medium">
                {["All Time", "Weekly", "Monthly"].map(t => (
                  <button key={t} onClick={() => { setTimeFilter(t as TimeFilter); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 text-slate-600 transition-colors italic">{t}</button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Stats Cards - Matches Provided Logic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Orders" value={stats.total} color="border-orange-500" />
          <StatCard label="In Progress" value={stats.inProgress} color="border-blue-500" />
          <StatCard label="Completed" value={stats.completed} color="border-green-500" />
          <StatCard label="Planned/Scheduled" value={stats.planned} color="border-purple-500" />
          <StatCard label="On Hold" value={stats.onHold} color="border-yellow-500" />
        </div>

        {/* Main List Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search by PO ID or product..." className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <div className="relative" ref={statusDropdownRef}>
                <button onClick={() => setActiveDropdown(activeDropdown === "status" ? null : "status")} className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}>
                  {statusFilter === "All" ? "Status" : statusFilter}
                  <ChevronDown size={14} className={activeDropdown === "status" ? "rotate-180" : ""} />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl z-50 py-2 border border-slate-50 overflow-hidden font-medium">
                    {["All", "PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"].map(s => (
                      <button key={s} onClick={() => { setStatusFilter(s); setActiveDropdown(null); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 text-slate-600">{s}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className="p-3 rounded-xl bg-slate-100 text-slate-400"><Trash2 size={20} /></button>
            </div>
          </div>

          {/* Table - Exact Style From Provided Snippet */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100">
                    <input type="checkbox" className="h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-[#F59E0B] outline-none" />
                  </th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">PO ID</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Product</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Deadline</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Priority</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-4 text-[11px] text-slate-800 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center">
                      <input type="checkbox" className="h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-[#F59E0B] outline-none" />
                    </td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center whitespace-nowrap min-w-30">{order.productionOrderId}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.productName}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center font-bold">{order.quantity.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{formatDate(order.deadline)}</td>
                    <td className="px-4 py-4 text-center"><PriorityBadge priority={order.priority} /></td>
                    <td className="px-4 py-4 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }} className="p-1.5 text-slate-400 hover:text-[#F59E0B]"><Eye size={16} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-500"><Edit size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Exact Style From Provided Snippet */}
          <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-bold text-slate-800 uppercase">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} Orders
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30"><ChevronLeft size={18} /></button>
              <div className="flex gap-1.5">
                {getPageNumbers().map(n => (
                  <button key={n} onClick={() => setCurrentPage(n)} className={`min-w-10 h-10 rounded-xl text-xs font-bold ${currentPage === n ? "bg-[#F59E0B] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}>{n}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border bg-white text-slate-500 hover:text-amber-500 disabled:opacity-30"><ChevronRight size={18} /></button>
            </div>
          </footer>
        </div>
      </div>

      {/* Modal - Professional Theme + Rounded [2.5rem] + Outside Click */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div ref={modalContentRef} className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Production Order</h2>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <ModalDetail label="Product Details" value={selectedOrder.productName} />
              <ModalDetail label="Total Quantity" value={`${selectedOrder.quantity.toLocaleString()} Units`} />
              <ModalDetail label="Final Deadline" value={formatDate(selectedOrder.deadline)} />
              <ModalDetail label="Originating SO" value={selectedOrder.salesOrderId} />
            </div>
            <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center">
              <div className="flex gap-4"> Status: <StatusBadge status={selectedOrder.status} /></div>
              <div className="flex gap-4">Priority: <PriorityBadge priority={selectedOrder.priority} /></div>
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-[#F59E0B] hover:bg-[#f67317] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Sub-Components ====================
const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-4 ${color} shadow-sm`}>
    <p className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-bold text-gray-700">{value}</p>
  </div>
);

const ModalDetail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{label}</label>
    <p className="text-lg font-bold text-slate-800 leading-tight">{value}</p>
  </div>
);

export default ProductionOrderList;