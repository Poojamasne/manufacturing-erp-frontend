import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Plus, ChevronDown, Search, Trash2, ChevronLeft, ChevronRight, 
    Calendar as CalendarIcon, Eye, Download, X, MoreHorizontal, ShoppingCart, IndianRupee, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders, clearSalesErrors, deleteOrder } from "../ModuleStateFiles/OrderSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";
import Swal from "sweetalert2";

// --- Types ---
type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
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

    const { orders, loading, pagination } = useAppSelector((state: RootState) => state.SalesOrder);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [statusFilter, setStatusFilter] = useState<Status>("All");
    const [customRange, setCustomRange] = useState({ start: "", end: new Date().toISOString().split("T")[0] });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch orders with filters
    const fetchOrders = useCallback(() => {
        const params: any = {
            page: currentPage,
            limit: itemsPerPage
        };
        
        if (statusFilter !== 'All') params.status = statusFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        if (activeTab !== 'All Time') params.dateRange = activeTab;
        if (activeTab === 'Custom' && customRange.start && customRange.end) {
            params.startDate = customRange.start;
            params.endDate = customRange.end;
        }
        
        dispatch(getOrders(params));
    }, [dispatch, currentPage, statusFilter, debouncedSearch, activeTab, customRange]);

    useEffect(() => {
        fetchOrders();
        return () => { dispatch(clearSalesErrors()); };
    }, [fetchOrders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, debouncedSearch, activeTab]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const toggleSelectAll = () => {
        if (selectedIds.length === orders.length) setSelectedIds([]);
        else setSelectedIds(orders.map((o: Order) => o.id));
    };

    const handleDeleteOrder = async (orderId: string, orderRef: string) => {
        const result = await Swal.fire({
            title: 'Delete Order?',
            html: `Are you sure you want to delete order <strong>${orderRef}</strong>?<br>This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (result.isConfirmed) {
            await dispatch(deleteOrder(orderId));
            setSelectedIds(prev => prev.filter(id => id !== orderId));
            fetchOrders();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        
        const result = await Swal.fire({
            title: `Delete ${selectedIds.length} orders?`,
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: `Yes, delete ${selectedIds.length} order${selectedIds.length > 1 ? 's' : ''}`
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
        const base = "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ";
        switch (st) {
            case "Pending": return base + "bg-amber-50 text-amber-600 border-amber-100";
            case "Processing": return base + "bg-blue-50 text-blue-600 border-blue-100";
            case "Delivered": return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Cancelled": return base + "bg-rose-50 text-rose-600 border-rose-100";
            default: return base + "bg-slate-50 text-slate-400 border-slate-100";
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-[#005d52] mx-auto mb-4" size={48} />
                    <p className="text-sm font-medium text-gray-500">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                            Orders
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Fulfillment tracking and order history management.</p>
                    </div>
                    <button onClick={() => navigate('/sales/orders/create')} className="group flex items-center gap-2 bg-[#005d52] hover:bg-[#004a41] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-teal-900/20 transition-all active:scale-95">
                        <Plus size={18} strokeWidth={3} /> Create Order
                    </button>
                </div>

                <section className="relative mb-8 flex flex-wrap items-center gap-3">
                    <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        {(["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"] as TimeTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab ? "bg-[#005d52] text-white shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className={`px-5 py-3 text-xs font-bold rounded-2xl border transition-all flex items-center gap-2 ${activeTab === "Custom" ? "bg-teal-50 border-teal-200 text-[#005d52]" : "bg-white border-slate-200 text-slate-500"}`}
                    >
                        <CalendarIcon size={14} /> Custom Range
                    </button>

                    {isCalendarOpen && (
                        <div ref={calendarRef} className="absolute top-full mt-3 left-0 z-50 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 min-w-[320px] animate-in fade-in zoom-in-95">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-slate-800">Date Range</h4>
                                <button onClick={() => setIsCalendarOpen(false)}><X size={18} className="text-slate-400" /></button>
                            </div>
                            <div className="space-y-4">
                                <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                <button onClick={() => { setActiveTab("Custom"); setIsCalendarOpen(false); fetchOrders(); }} className="w-full py-3.5 bg-[#005d52] text-white rounded-xl font-bold text-xs">Apply Selection</button>
                            </div>
                        </div>
                    )}
                </section>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Order ID or Customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                            <div className="relative min-w-35">
                                <button
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold ${statusFilter !== "All" ? "bg-teal-50 border-teal-200 text-[#005d52]" : "bg-white border-slate-200 text-slate-600"}`}
                                >
                                    {statusFilter === "All" ? "Status" : statusFilter}
                                    <ChevronDown size={14} className={isStatusOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                </button>
                                {isStatusOpen && (
                                    <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                                        {(["All", "Pending", "Processing", "Delivered", "Cancelled"] as Status[]).map(s => (
                                            <button key={s} onClick={() => { setStatusFilter(s); setIsStatusOpen(false); fetchOrders(); }} className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 ${statusFilter === s ? "text-[#005d52] font-bold" : "text-slate-600"}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleBulkDelete}
                                disabled={selectedIds.length === 0} 
                                className="p-3 bg-rose-50 text-rose-500 rounded-xl disabled:opacity-20 transition-colors hover:bg-rose-100"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="w-16 p-5 text-center border-b border-r border-slate-100">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.length === orders.length && orders.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100 text-center">Reference ID</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100">Order Date</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100">Customer Name</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100 text-center">Grand Total</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100 text-center">Status</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map((o: Order) => (
                                    <tr key={o.id} className="group hover:bg-teal-50/20 transition-colors">
                                        <td className="p-5 text-center border-r border-slate-50">
                                            <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.includes(o.id)} onChange={() => setSelectedIds(prev => prev.includes(o.id) ? prev.filter(i => i !== o.id) : [...prev, o.id])} />
                                        </td>
                                        <td className="px-4 py-5 text-[13px] text-slate-800 border-r border-slate-50 text-center">{o.order_id}</td>
                                        <td className="px-4 py-5 text-[13px] text-slate-500 whitespace-nowrap border-r border-slate-50 font-medium">
                                            {new Date(o.order_date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
                                        </td>
                                        <td className="px-4 py-5 text-[13px] text-slate-700 border-r border-slate-50">{o.customer_name}</td>
                                        <td className="px-4 py-5 text-[14px] font-black text-slate-800 border-r border-slate-50 text-center">
                                           <div className="flex items-center justify-center gap-1">
                                                <IndianRupee size={12} className="text-slate-400"/>
                                                {Number(o.total_amount).toLocaleString('en-IN')}
                                           </div>
                                        </td>
                                        <td className="px-4 py-5 border-r border-slate-50 text-center">
                                            <span className={getStatusStyle(o.status)}>{o.status}</span>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex justify-center gap-1">
                                                <button title="View" onClick={() => navigate(`/sales/orders/order-view/${o.id}`)} className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-[#005d52] rounded-xl transition-all"><Eye size={16} /></button>
                                                <button title="Download" className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-blue-600 rounded-xl transition-all"><Download size={16} /></button>
                                                <button 
                                                    title="Delete" 
                                                    onClick={() => handleDeleteOrder(o.id, o.order_id)}
                                                    className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && orders.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <div className="p-6 bg-slate-50 rounded-full mb-4">
                                    <ShoppingCart className="text-slate-200" size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
                                <p className="text-slate-400 text-sm max-w-xs">We couldn't find any orders matching your criteria.</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 0 && (
                        <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                                Showing <span className="text-slate-900">{orders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, pagination?.total || 0)}</span> of <span className="text-slate-900">{pagination?.total || 0}</span> Results
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] disabled:opacity-30 transition-all shadow-sm">
                                    <ChevronLeft size={18} strokeWidth={2.5} />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    {getPageNumbers().map((page, i) => (
                                        page === "..." ? <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span> : (
                                            <button key={i} onClick={() => setCurrentPage(page as number)} className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20 scale-105" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 shadow-sm"}`}>
                                                {page}
                                            </button>
                                        )
                                    ))}
                                </div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] disabled:opacity-30 transition-all shadow-sm">
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