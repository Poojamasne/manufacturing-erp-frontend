import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Search,
    ChevronDown,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Edit3,
    X,
    MoreHorizontal,
    Settings,
    Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProductions, deleteProduction, clearSalesErrors } from "../ModuleStateFiles/ProductionSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Types ---
type ProdStatus = "Pending" | "In Progress" | "On Hold" | "Completed" | "Delayed" | "All";
type Stage = "Pending" |"Raw Materials" | "Cutting" | "Assembly" | "Quality Check" | "Packaging" | "All";
type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

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

    const { productions, loading, pagination } = useAppSelector((state: RootState) => state.SalesProduction);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [statusFilter, setStatusFilter] = useState<ProdStatus>("All");
    const [stageFilter, setStageFilter] = useState<Stage>("All");
    const [customRange, setCustomRange] = useState({ start: "", end: "" });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isStageOpen, setIsStageOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Status options
    const statusOptions = ["All", "Pending", "In Progress", "On Hold", "Completed", "Delayed"];
    
    // Stage options
    const stageOptions: Stage[] = ["All", "Pending","Raw Materials", "Cutting", "Assembly", "Quality Check", "Packaging"];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch productions with filters
    const fetchProductions = useCallback(() => {
        const params: any = {
            page: currentPage,
            limit: itemsPerPage
        };
        
        if (statusFilter !== 'All') params.status = statusFilter;
        if (stageFilter !== 'All') params.stage = stageFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        if (activeTab !== 'All Time') params.dateRange = activeTab;
        if (activeTab === 'Custom' && customRange.start && customRange.end) {
            params.startDate = customRange.start;
            params.endDate = customRange.end;
        }
        
        console.log("Fetching with params:", params);
        dispatch(getProductions(params));
    }, [dispatch, currentPage, statusFilter, stageFilter, debouncedSearch, activeTab, customRange]);

    useEffect(() => {
        fetchProductions();
        return () => { dispatch(clearSalesErrors()); };
    }, [fetchProductions]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, stageFilter, debouncedSearch, activeTab]);

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
        if (selectedIds.length === productions.length) setSelectedIds([]);
        else setSelectedIds(productions.map((j: ProductionJob) => j.id));
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

    const getStatusStyle = (st: string) => {
        const base = "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ";
        switch (st) {
            case "Pending": return base + "bg-gray-50 text-gray-600 border-gray-200";
            case "In Progress": return base + "bg-blue-50 text-blue-600 border-blue-100";
            case "Completed": return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Delayed": return base + "bg-rose-50 text-rose-600 border-rose-100";
            case "On Hold": return base + "bg-amber-50 text-amber-600 border-amber-100";
            default: return base + "bg-slate-50 text-slate-400 border-slate-100";
        }
    }

    const getStageStyle = (st: string) => {
        const base = "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ";
        switch (st) {
            case "Raw Materials": return base + "text-purple-600 bg-purple-50";
            case "Cutting": return base + "text-indigo-600 bg-indigo-50";
            case "Assembly": return base + "text-teal-600 bg-teal-50";
            case "Quality Check": return base + "text-blue-600 bg-blue-50";
            case "Packaging": return base + "text-emerald-600 bg-emerald-50";
            default: return base + "text-slate-500 bg-slate-50";
        }
    }

    if (loading && productions.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#005d52]" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                            Production
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Real-time oversight of manufacturing floor stages.</p>
                    </div>
                </header>

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
                                <h4 className="text-sm font-bold text-slate-800">Custom Date Filter</h4>
                                <button onClick={() => setIsCalendarOpen(false)}><X size={18} className="text-slate-400" /></button>
                            </div>
                            <div className="space-y-4">
                                <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                <button onClick={() => { setActiveTab("Custom"); setIsCalendarOpen(false); fetchProductions(); }} className="w-full py-3.5 bg-[#005d52] text-white rounded-xl font-bold text-xs shadow-lg">Apply Selection</button>
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
                                placeholder="Search by Job ID, Order or Product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
                            {/* Status Filter */}
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
                                        {statusOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setStatusFilter(opt as ProdStatus); setIsStatusOpen(false); fetchProductions(); }}
                                                className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-[#005d52] font-bold bg-teal-50/50" : "text-slate-600"}`}
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
                                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold ${stageFilter !== "All" ? "bg-teal-50 border-teal-200 text-[#005d52]" : "bg-white border-slate-200 text-slate-600"}`}
                                >
                                    {stageFilter === "All" ? "Stage" : stageFilter} 
                                    <ChevronDown size={14} className={isStageOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                </button>
                                {isStageOpen && (
                                    <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                                        {stageOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setStageFilter(opt); setIsStageOpen(false); fetchProductions(); }}
                                                className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-slate-50 ${stageFilter === opt ? "text-[#005d52] font-bold bg-teal-50/50" : "text-slate-600"}`}
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
                                className="p-3 bg-rose-50 text-rose-500 rounded-xl disabled:opacity-20 transition-colors hover:bg-rose-100"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="w-16 p-5 text-center border-b border-r border-slate-100">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.length === productions.length && productions.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-r border-slate-100 text-center">Job ID</th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-r border-slate-100">Order ID</th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-r border-slate-100">Product</th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-r border-slate-100 text-center">Qty</th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-r border-slate-100 text-center">Stage</th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-r border-slate-100 text-center">Status</th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-r border-slate-100">Updated</th>
                                    <th className="px-4 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {productions.map((j: ProductionJob) => (
                                    <tr key={j.id} className="group hover:bg-teal-50/20 transition-colors">
                                        <td className="p-5 text-center border-r border-slate-50">
                                            <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.includes(j.id)} onChange={() => setSelectedIds(prev => prev.includes(j.id) ? prev.filter(i => i !== j.id) : [...prev, j.id])} />
                                        </td>
                                        <td className="px-4 py-5 text-[13px] text-slate-800 border-r border-slate-50 text-center">{j.job_id}</td>
                                        <td className="px-4 py-5 text-[13px] text-slate-800 border-r border-slate-50 text-center">{j.order_id || '-'}</td>
                                        <td className="px-4 py-5 text-[13px] font-bold text-slate-900 border-r border-slate-50 truncate max-w-45" title={j.product_name}>
                                            {j.product_name}
                                        </td>
                                        <td className="px-4 py-5 text-[13px] font-black text-slate-800 border-r border-slate-50 text-center">
                                            {j.quantity}
                                        </td>
                                        <td className="px-4 py-5 border-r border-slate-50 text-center">
                                            <span className={getStageStyle(j.stage)}>{j.stage}</span>
                                        </td>
                                        <td className="px-4 py-5 border-r border-slate-50 text-center">
                                            <span className={getStatusStyle(j.status)}>{j.status}</span>
                                        </td>
                                        <td className="px-4 py-5 text-[12px] text-slate-800 whitespace-nowrap border-r border-slate-50">
                                            {new Date(j.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex justify-center gap-1">
                                                <button title="Edit Production" className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-[#005d52] rounded-xl transition-all" onClick={() => navigate(`/sales/production/production-edit/${j.id}`)}>
                                                    <Edit3 size={16} />
                                                </button>
                                                <button title="Delete Job" onClick={() => handleDelete(j.id)} className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-rose-600 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && productions.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <div className="p-6 bg-slate-50 rounded-full mb-4">
                                    <Settings className="text-slate-200" size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No Production Jobs</h3>
                                <p className="text-slate-400 text-sm max-w-xs">We couldn't find any manufacturing records matching these filters.</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 0 && (
                        <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                                Showing <span className="text-slate-900">{productions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, pagination?.total || 0)}</span> of <span className="text-slate-900">{pagination?.total || 0}</span> Jobs
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

export default ProductionList;