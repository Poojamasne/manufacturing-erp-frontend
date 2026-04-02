import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Plus, ChevronDown, Search, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eye, Download, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    formatDateForInput,
    isDateInRange,
    isDateWithinCustomRange,
    type DateRange,
    type TimeTab,
} from "../utils/dateFilters";

type TimeTabWithCustom = TimeTab | "Custom";

type Status = "Pending" | "Processing" | "Delivered" | "Cancelled" | "All";

type Order = {
    id: string;
    customer: string;
    date: string;
    amount: string;
    status: Exclude<Status, "All">;
    salesRep: string;
};

const INITIAL_ORDERS: Order[] = [
    { id: "ORD-001", customer: "Rajesh Electronics", date: "2026-03-25", amount: "₹ 25.5L", status: "Processing", salesRep: "Rahul Patil" },
    { id: "ORD-002", customer: "Modern Appliances", date: "2026-03-10", amount: "₹ 5.5L", status: "Pending", salesRep: "Sneha P." },
    { id: "ORD-003", customer: "Kitchen Hub", date: "2026-02-15", amount: "₹ 11.2L", status: "Delivered", salesRep: "Rahul Patil" },
    { id: "ORD-004", customer: "Elite Tech Solutions", date: "2026-03-19", amount: "₹ 18.75L", status: "Pending", salesRep: "Amit S." },
    { id: "ORD-005", customer: "Global Traders", date: "2026-01-05", amount: "₹ 42.0L", status: "Cancelled", salesRep: "Sneha P." },
    { id: "ORD-006", customer: "Oceanic Resorts", date: "2026-03-20", amount: "₹ 14.2L", status: "Processing", salesRep: "Rahul Patil" },
    { id: "ORD-007", customer: "Sunshine Schools", date: "2026-01-15", amount: "₹ 8.1L", status: "Delivered", salesRep: "Amit S." },
];

const OrderList: React.FC = () => {
    const navigate = useNavigate();
    const calendarRef = useRef<HTMLDivElement>(null);
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<TimeTabWithCustom>("All Time");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<DateRange>({
        from: "",
        to: formatDateForInput(new Date()),
    });
    
    const [statusFilter, setStatusFilter] = useState<Status>("All");
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((o) => {
            const matchesSearch = o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 o.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || o.status === statusFilter;
            
            let matchesTime = true;
            if (activeTab === "Custom") {
                matchesTime = isDateWithinCustomRange(o.date, customDateRange);
            } else {
                matchesTime = isDateInRange(o.date, activeTab);
            }

            return matchesSearch && matchesStatus && matchesTime;
        });
    }, [orders, searchQuery, statusFilter, activeTab, customDateRange]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedOrders.length) setSelectedIds([]);
        else setSelectedIds(paginatedOrders.map(q => q.id));
    };

    const getStatusColor = (st: string) => {
        switch(st) {
            case "Pending": return "bg-orange-50 text-orange-600 border-orange-200";
            case "Processing": return "bg-blue-50 text-blue-600 border-blue-200";
            case "Delivered": return "bg-green-50 text-green-600 border-green-200";
            case "Cancelled": return "bg-red-50 text-red-600 border-red-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Sales Orders</h1>
                        <p className="text-sm text-gray-400 font-normal">Manage and actively track customer orders</p>
                    </div>
                    <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:scale-105 transition-transform">
                        <Plus size={18} strokeWidth={3} /> Create Order
                    </button>
                </div>

                {/* Tabs & Custom Range Button */}
                <section className="relative mb-8 flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-sm w-fit">
                        {(["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"] as TimeTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); setIsCalendarOpen(false); }}
                                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                {tab}
                            </button>
                        ))}
                        <button
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "Custom" ? "bg-[#d1e9e7] text-[#005d52] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            <CalendarIcon size={14} /> Custom 
                        </button>
                    </div>

                    {/* Animated Calendar Popup */}
                    {isCalendarOpen && (
                        <div ref={calendarRef} className="absolute top-full mt-2 left-0 lg:left-80 z-50 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 min-w-[320px] animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-gray-800">Select Date Range</h4>
                                <button onClick={() => setIsCalendarOpen(false)}><X size={18} className="text-gray-400" /></button>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
                                    <input
                                        type="date"
                                        value={customDateRange.from}
                                        onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
                                    <input
                                        type="date"
                                        value={customDateRange.to}
                                        onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <button
                                    onClick={() => { setActiveTab("Custom"); setIsCalendarOpen(false); setCurrentPage(1); }}
                                    className="w-full py-3 bg-[#005d52] text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-900/20"
                                >
                                    Apply Range
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Table Container */}
                <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="p-6 flex flex-col xl:flex-row justify-between items-center gap-4 bg-white border-b border-gray-50">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#005d52] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                                className="w-full pl-12 pr-4 py-3 bg-[#f8faf9] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#005d52]/10 text-sm outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 w-full">
                            <div className="relative">
                                <button 
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${statusFilter !== "All" ? "bg-teal-50 border-[#005d52] text-[#005d52]" : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"}`}
                                >
                                    {statusFilter === "All" ? "Status" : statusFilter}
                                    <ChevronDown size={14} className={isStatusOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                </button>
                                {isStatusOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-50 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in zoom-in-95 duration-200">
                                        {(["All", "Pending", "Processing", "Delivered", "Cancelled"] as Status[]).map(s => (
                                            <button 
                                                key={s} 
                                                onClick={() => {setStatusFilter(s); setIsStatusOpen(false); setCurrentPage(1)}}
                                                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${statusFilter === s ? "text-[#005d52] font-bold" : "text-gray-600"}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={() => {setOrders(prev => prev.filter(o => !selectedIds.includes(o.id))); setSelectedIds([])}} disabled={selectedIds.length === 0} className="p-2.5 bg-red-50 text-red-500 rounded-xl disabled:opacity-20 hover:bg-red-100 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Table with Vertical Lines */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="w-12 p-4 text-center border-b border-gray-100 border-r border-gray-100">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.length === paginatedOrders.length && paginatedOrders.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r border-gray-100">
                                        Order ID
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r border-gray-100">
                                        Order Date
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r border-gray-100">
                                        Customer
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r border-gray-100">
                                        Total Amount
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r border-gray-100">
                                        Status
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-[#f8faf9]/80 transition-colors group">
                                        <td className="p-4 text-center border-r border-gray-100">
                                            <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.includes(o.id)} onChange={() => setSelectedIds(prev => prev.includes(o.id) ? prev.filter(i => i !== o.id) : [...prev, o.id])} />
                                        </td>
                                        <td className="p-4 text-xs font-bold text-[#005d52] border-r border-gray-100">
                                            {o.id}
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap border-r border-gray-100">
                                            {o.date}
                                        </td>
                                        <td className="p-4 text-xs text-gray-800 border-r border-gray-100">
                                            {o.customer}
                                        </td>
                                        <td className="p-4 text-xs text-gray-800 font-bold border-r border-gray-100">
                                            {o.amount}
                                        </td>
                                        <td className="p-4 border-r border-gray-100">
                                            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap ${getStatusColor(o.status)}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-0.5 justify-center">
                                                <button title="View" onClick={() => navigate(`/sales/order-view/${o.id}`)} className="p-1.5 hover:bg-teal-50 text-gray-400 hover:text-[#005d52] rounded-md transition-all">
                                                    <Eye size={15}/>
                                                </button>
                                                <button title="Download" className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-all">
                                                    <Download size={15}/>
                                                </button>
                                                <button title="Delete" className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all" onClick={() => setOrders(prev => prev.filter(x => x.id !== o.id))}>
                                                    <Trash2 size={15}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {paginatedOrders.length === 0 && (
                            <div className="py-20 text-center text-gray-400 italic text-sm">No orders found.</div>
                        )}
                    </div>

                    {/* Pagination */}
                    <footer className="p-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-900">{paginatedOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="text-gray-900">{filteredOrders.length}</span> Results
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 text-gray-400 hover:text-[#005d52] disabled:opacity-20 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20" : "text-gray-400 hover:bg-gray-100"}`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 text-gray-400 hover:text-[#005d52] disabled:opacity-20 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default OrderList;