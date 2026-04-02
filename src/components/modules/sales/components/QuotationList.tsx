import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Plus,
    ChevronDown,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,

    Calendar as CalendarIcon,
    Eye,
    X,
    Download
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

// --- Types ---
type Status = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired" | "All";
type Quotation = {
    id: string;
    company: string;
    date: string;
    validUntil: string;
    amount: string;
    status: Exclude<Status, "All">;
    createdBy: string;
};

// --- Mock Data ---
const INITIAL_QUOTATIONS: Quotation[] = [
    { id: "QT-001", company: "Rajesh Electronics", date: "2026-03-25", validUntil: "2026-04-25", amount: "₹ 25.5L", status: "Sent", createdBy: "Rahul Patil" },
    { id: "QT-002", company: "Modern Appliances", date: "2026-03-10", validUntil: "2026-04-10", amount: "₹ 5.5L", status: "Draft", createdBy: "Sneha P." },
    { id: "QT-003", company: "Kitchen Hub", date: "2026-02-15", validUntil: "2026-03-15", amount: "₹ 11.2L", status: "Accepted", createdBy: "Rahul Patil" },
    { id: "QT-004", company: "Elite Tech Solutions", date: "2026-03-19", validUntil: "2026-04-19", amount: "₹ 18.75L", status: "Draft", createdBy: "Amit S." },
    { id: "QT-005", company: "Global Traders", date: "2026-01-05", validUntil: "2026-02-05", amount: "₹ 42.0L", status: "Expired", createdBy: "Sneha P." },
    { id: "QT-006", company: "Oceanic Resorts", date: "2026-03-20", validUntil: "2026-04-20", amount: "₹ 14.2L", status: "Sent", createdBy: "Rahul Patil" },
    { id: "QT-007", company: "Sunshine Schools", date: "2026-01-15", validUntil: "2026-02-15", amount: "₹ 8.1L", status: "Accepted", createdBy: "Amit S." },
    { id: "QT-008", company: "Apex Hospitals", date: "2026-03-27", validUntil: "2026-04-27", amount: "₹ 35.8L", status: "Rejected", createdBy: "Sneha P." },
];

const QuotationList: React.FC = () => {
    const navigate = useNavigate();
    const calendarRef = useRef<HTMLDivElement>(null);
    const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<TimeTabWithCustom>("All Time");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<DateRange>({
        from: "",
        to: formatDateForInput(new Date()),
    });
    
    // Filter States
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

    const filteredQuotations = useMemo(() => {
        return quotations.filter((qt) => {
            const matchesSearch = qt.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 qt.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || qt.status === statusFilter;
            
            let matchesTime = true;
            if (activeTab === "Custom") {
                matchesTime = isDateWithinCustomRange(qt.date, customDateRange);
            } else {
                matchesTime = isDateInRange(qt.date, activeTab);
            }

            return matchesSearch && matchesStatus && matchesTime;
        });
    }, [quotations, searchQuery, statusFilter, activeTab, customDateRange]);

    const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
    const paginatedQuotations = filteredQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedQuotations.length) setSelectedIds([]);
        else setSelectedIds(paginatedQuotations.map(q => q.id));
    };

    const getStatusColor = (st: string) => {
        switch(st) {
            case "Sent": return "bg-blue-50 text-blue-600 border-blue-200";
            case "Draft": return "bg-gray-50 text-gray-600 border-gray-200";
            case "Accepted": return "bg-green-50 text-green-600 border-green-200";
            case "Rejected": return "bg-red-50 text-red-600 border-red-200";
            case "Expired": return "bg-orange-50 text-orange-600 border-orange-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Quotations</h1>
                        <p className="text-sm text-gray-400 font-normal">Manage and track your sales quotes</p>
                    </div>
                    <button
                        onClick={() => navigate(`/sales/quotation-create`)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={18} strokeWidth={3} /> New Quotation
                    </button>
                </div>

                {/* Tabs & Custom Range Button */}
                <section className="relative mb-8 flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-sm w-fit">
                        {(["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"] as const).map((tab) => (
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

                {/* Table Area */}
                <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="p-6 flex flex-col xl:flex-row justify-between items-center gap-4 border-b border-gray-50">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#005d52] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search quotations..."
                                value={searchQuery}
                                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                                className="w-full pl-12 pr-4 py-3 bg-[#f8faf9] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#005d52]/10 text-sm outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
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
                                        {(["All", "Draft", "Sent", "Accepted", "Rejected", "Expired"] as Status[]).map(s => (
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

                            <button onClick={() => {setQuotations(prev => prev.filter(q => !selectedIds.includes(q.id))); setSelectedIds([])}} disabled={selectedIds.length === 0} className="p-2.5 bg-red-50 text-red-500 rounded-xl disabled:opacity-20 hover:bg-red-100 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Table with Vertical Lines */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="w-12 p-4 text-center border-b border-gray-100 border-r">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.length === paginatedQuotations.length && paginatedQuotations.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r">
                                        Quote ID
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r">
                                        Date Created
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r ">
                                        Valid Until
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r ">
                                        Company
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r ">
                                        Total Amount
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 border-r">
                                        Status
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedQuotations.map((qt) => (
                                    <tr key={qt.id} className="hover:bg-[#f8faf9]/80 transition-colors group">
                                        <td className="p-4 text-center border-r border-gray-100">
                                            <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.includes(qt.id)} onChange={() => setSelectedIds(prev => prev.includes(qt.id) ? prev.filter(i => i !== qt.id) : [...prev, qt.id])} />
                                        </td>
                                        <td className="p-4 text-xs font-bold text-[#005d52] border-r border-gray-100">
                                            {qt.id}
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 border-r border-gray-100">
                                            {qt.date}
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 border-r border-gray-100">
                                            {qt.validUntil}
                                        </td>
                                        <td className="p-4 text-xs text-gray-800 border-r border-gray-100">
                                            {qt.company}
                                        </td>
                                        <td className="p-4 text-xs text-gray-800 font-bold border-r border-gray-100">
                                            {qt.amount}
                                        </td>
                                        <td className="p-4 border-r border-gray-100">
                                            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold ${getStatusColor(qt.status)}`}>
                                                {qt.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-0.5 justify-center">
                                                <button title="View" onClick={() => navigate(`/sales/quotation-view/${qt.id}`)} className="p-1.5 hover:bg-teal-50 text-gray-400 hover:text-[#005d52] rounded-md transition-all">
                                                    <Eye size={15}/>
                                                </button>
                                                <button title="Download" className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-all">
                                                    <Download size={15}/>
                                                </button>
                                                <button title="Delete" className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all" onClick={() => {setQuotations(prev => prev.filter(q => q.id !== qt.id))}}>
                                                    <Trash2 size={15}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {paginatedQuotations.length === 0 && (
                            <div className="py-20 text-center text-gray-400 italic text-sm">No quotations found.</div>
                        )}
                    </div>

                    {/* Pagination */}
                    <footer className="p-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-900">{paginatedQuotations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredQuotations.length)}</span> of <span className="text-gray-900">{filteredQuotations.length}</span> Results
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

export default QuotationList;