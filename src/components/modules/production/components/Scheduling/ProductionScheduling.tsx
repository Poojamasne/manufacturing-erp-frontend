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
  
} from "lucide-react";

// ==================== Types ====================
type TimeFilter = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

interface ProductionOrder {
  id: string;
  productName: string;
  quantity: number;
  deadline: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  created_at?: string;
}

// ==================== Mock Data ====================
const mockOrders: ProductionOrder[] = [
  { id: "PO-1001", productName: "Industrial Bolt M12", quantity: 5000, deadline: "2024-05-20", priority: "HIGH", created_at: "2024-05-10" },
  { id: "PO-1002", productName: "Aluminum Frame 4x4", quantity: 250, deadline: "2024-05-18", priority: "HIGH", created_at: "2024-05-11" },
  { id: "PO-1003", productName: "Plastic Container L", quantity: 1000, deadline: "2024-05-22", priority: "MEDIUM", created_at: "2024-05-12" },
  { id: "PO-1004", productName: "Rubber Gasket Set", quantity: 3000, deadline: "2024-05-25", priority: "LOW", created_at: "2024-05-09" },
  { id: "PO-1005", productName: "Steel Plate 6mm", quantity: 1500, deadline: "2024-05-28", priority: "HIGH", created_at: "2024-05-13" },
  { id: "PO-1006", productName: "Copper Wire 2mm", quantity: 2000, deadline: "2024-05-30", priority: "MEDIUM", created_at: "2024-05-14" },
];

// ==================== Helper Components ====================
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles: { [key: string]: string } = {
    HIGH: "text-red-600 bg-red-50 border-red-100",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
    LOW: "text-teal-600 bg-teal-50 border-teal-100",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[priority] || styles.MEDIUM}`}>
      {priority}
    </span>
  );
};

const formatDate = (date: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
};

// ==================== Main Component ====================
const ProductionScheduling: React.FC = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Data States
  const [orders] = useState<ProductionOrder[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    shift: "Morning"
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsTimeDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            order.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "All" || order.priority === priorityFilter;
      
      // Time Filter Logic
      const orderDate = new Date(order.created_at || order.deadline);
      const now = new Date();
      let matchesTime = true;

      if (timeFilter === "Weekly") {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
        matchesTime = diffDays <= 7 && diffDays >= 0;
      } else if (timeFilter === "Monthly") {
        matchesTime = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === "Custom" && customRange.start && customRange.end) {
        matchesTime = orderDate >= new Date(customRange.start) && orderDate <= new Date(customRange.end);
      }

      return matchesSearch && matchesPriority && matchesTime;
    });
    return filtered;
  }, [orders, searchQuery, priorityFilter, timeFilter, customRange]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  const handleOpenModal = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Production Scheduling</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Initiate and manage production runs</p>
          </div>
        </header>

        {/* Time Filters Section */}
        <section className="relative mb-8 flex justify-end">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
            >
              <Filter size={16} className="text-orange-500" />
              <span>{timeFilter === "Custom" && customRange.start ? `${formatDate(customRange.start)} - ${formatDate(customRange.end)}` : timeFilter}</span>
              <ChevronDown size={14} className={isTimeDropdownOpen ? "rotate-180" : ""} />
            </button>

            {isTimeDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                {["Weekly", "Monthly", "Quarterly", "Yearly", "All Time", "Custom"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === "Custom") setIsCalendarOpen(true);
                      else setTimeFilter(tab as TimeFilter);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${timeFilter === tab ? "text-orange-600 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {isCalendarOpen && (
              <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                <div className="space-y-3">
                  <input type="date" className="w-full p-2 border rounded-lg text-sm" onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
                  <input type="date" className="w-full p-2 border rounded-lg text-sm" onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
                  <button onClick={() => { setIsCalendarOpen(false); setTimeFilter("Custom"); }} className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-bold">Apply Range</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Main Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search by order ID or product..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative min-w-35">
              <button onClick={() => setIsPriorityOpen(!isPriorityOpen)} className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold text-slate-600">
                {priorityFilter === "All" ? "Priority" : priorityFilter} <ChevronDown size={14} />
              </button>
              {isPriorityOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                  {["All", "HIGH", "MEDIUM", "LOW"].map(opt => (
                    <button key={opt} onClick={() => { setPriorityFilter(opt); setIsPriorityOpen(false); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50">{opt}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100"><input type="checkbox" className="accent-orange-500" /></th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ORDER ID</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">PRODUCT</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">QUANTITY</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">DEADLINE</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">PRIORITY</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-orange-50/20 transition-colors">
                    <td className="p-5 text-center"><input type="checkbox" className="accent-orange-500" /></td>
                    <td className="px-4 py-4 text-[13px] font-mono font-bold text-slate-800 text-center">{order.id}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.productName}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{order.quantity.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-700 text-center">{formatDate(order.deadline)}</td>
                    <td className="px-4 py-4 text-center"><PriorityBadge priority={order.priority} /></td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleOpenModal(order)} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2 mx-auto">
                        <Play size={14} fill="currentColor" /> Start
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              Showing {filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} Orders
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all"><ChevronLeft size={18} /></button>
              <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, i) => (
                  <button key={i} onClick={() => setCurrentPage(page)} className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-orange-500 text-white shadow-lg shadow-orange-900/20" : "bg-white text-slate-500 border border-slate-200"}`}>{page}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-orange-600 disabled:opacity-30 transition-all"><ChevronRight size={18} /></button>
            </div>
          </footer>
        </div>
      </div>

      {/* Start Production Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Factory size={18} /></div>
                  <h2 className="text-xl font-black text-slate-800">Start Production</h2>
                </div>
                <p className="text-sm text-slate-400 font-medium">Configure run for <span className="text-orange-600 font-bold">{selectedOrder.id}</span></p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/5 focus:bg-white transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Production Shift</label>
                <div className="flex gap-2">
                  {["Morning", "Afternoon", "Evening"].map((s) => (
                    <button key={s} type="button" onClick={() => setFormData({...formData, shift: s})} className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all border ${formData.shift === s ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
                <Clock size={16} className="text-slate-400 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">Starting this production will notify the assigned operators and update the machine load status automatically.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="flex-[1.5] py-3.5 bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2">Confirm Run <ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionScheduling;