import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Plus,
    ChevronDown,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    MoreHorizontal,
    FileText,
    Loader2,
    Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getQuotations, deleteQuotation, bulkDeleteQuotations, clearSalesErrors } from "../ModuleStateFiles/QuotationSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type Status = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired" | "All";

interface Quotation {
    id: number;
    quote_id: string;
    company_name: string;
    quotation_date: string | null;
    valid_until: string | null;
    total: string | number;
    status: string;
    created_by_name: string;
}

const QuotationList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const calendarRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { quotations, loading, error } = useAppSelector((state: RootState) => state.SalesQuotation);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [statusFilter, setStatusFilter] = useState<Status>("All");
    const [customRange, setCustomRange] = useState({ start: "", end: "" });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchQuotations = () => {
        dispatch(getQuotations({
            status: statusFilter !== 'All' ? statusFilter : undefined,
            search: debouncedSearch || undefined,
            page: currentPage,
            limit: itemsPerPage
        }));
    };

    useEffect(() => {
        fetchQuotations();
        return () => { dispatch(clearSalesErrors()); };
    }, [dispatch, currentPage, statusFilter, debouncedSearch]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, activeTab, customRange]);

    const handleDelete = async (id: number) => {
        setDeleting(true);
        try {
            await dispatch(deleteQuotation(id.toString()));
            fetchQuotations();
            setSelectedIds(prev => prev.filter(pid => pid !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setDeleting(true);
        try {
            await dispatch(bulkDeleteQuotations(selectedIds.map(id => id.toString())));
            setSelectedIds([]);
            fetchQuotations();
        } catch (err) {
            console.error('Bulk delete failed:', err);
        } finally {
            setDeleting(false);
        }
    };

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

    const handleCustomApply = () => {
        if (!customRange.start || !customRange.end) {
            alert("Please select date range");
            return;
        }
        setActiveTab("Custom");
        setIsCalendarOpen(false);
        setIsDropdownOpen(false);
        setCurrentPage(1);
    };

    const getFilterDisplayText = () => {
        if (activeTab === "Custom" && customRange.start && customRange.end) {
            return `${customRange.start} to ${customRange.end}`;
        }
        return activeTab;
    };

    const quotationsArray = Array.isArray(quotations) ? quotations : [];

    const filteredQuotations = useMemo(() => {
        if (quotationsArray.length === 0) return [];

        return quotationsArray.filter((qt: Quotation) => {
            const matchesSearch = true;
            const matchesStatus = statusFilter === "All" || qt.status === statusFilter;

            let matchesTime = true;
            const quoteDate = qt.quotation_date ? new Date(qt.quotation_date) : new Date();
            const now = new Date();

            if (activeTab === "Custom") {
                const start = customRange.start ? new Date(customRange.start) : null;
                const end = customRange.end ? new Date(customRange.end) : null;
                if (start) {
                    const startOfRange = new Date(start);
                    startOfRange.setHours(0, 0, 0, 0);
                    matchesTime = matchesTime && quoteDate >= startOfRange;
                }
                if (end) {
                    const endOfRange = new Date(end);
                    endOfRange.setHours(23, 59, 59);
                    matchesTime = matchesTime && quoteDate <= endOfRange;
                }
            } else if (activeTab !== "All Time") {
                const diffInDays = (now.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24);
                if (activeTab === "Weekly") matchesTime = diffInDays <= 7 && diffInDays >= 0;
                if (activeTab === "Monthly") matchesTime = quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear();
                if (activeTab === "Yearly") matchesTime = quoteDate.getFullYear() === now.getFullYear();
            }

            return matchesSearch && matchesStatus && matchesTime;
        });
    }, [quotationsArray, searchQuery, statusFilter, activeTab, customRange]);

    const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
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
        if (selectedIds.length === paginatedQuotations.length && paginatedQuotations.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedQuotations.map(q => q.id));
        }
    };

    const getStatusStyle = (st: string) => {
        const base = "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ";
        switch (st) {
            case "Sent": return base + "bg-blue-50 text-blue-600 border-blue-100";
            case "Draft": return base + "bg-slate-50 text-slate-500 border-slate-200";
            case "Accepted": return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Rejected": return base + "bg-rose-50 text-rose-600 border-rose-100";
            case "Expired": return base + "bg-amber-50 text-amber-600 border-amber-100";
            default: return base + "bg-slate-50 text-slate-400 border-slate-100";
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (amount: string | number | undefined | null) => {
        if (amount === undefined || amount === null) return "₹0";
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        if (isNaN(num)) return "₹0";
        return `₹${num.toLocaleString("en-IN")}`;
    };

    const getSafeErrorMessage = (): string | null => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object') {
            const errObj = error as Record<string, unknown>;
            if (errObj.message && typeof errObj.message === 'string') return errObj.message;
        }
        return 'An unexpected error occurred';
    };

    const errorMessage = getSafeErrorMessage();

    if (loading && quotationsArray.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-[#005d52]" />
            </div>
        );
    }

    if (errorMessage && !loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Quotations</h2>
                    <p className="text-red-600 break-words">{errorMessage}</p>
                    <button
                        onClick={() => fetchQuotations()}
                        className="mt-6 px-6 py-2 bg-[#005d52] text-white rounded-xl hover:bg-[#004a41] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quotations</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Draft, track and manage client commercial proposals.</p>
                    </div>
                    <button
                        onClick={() => navigate(`/sales/quotation/quotation-create`)}
                        className="outline-none group flex items-center gap-2 bg-[#005d52] hover:bg-[#004a41] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-teal-900/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Create Quotation
                    </button>
                </header>

                {/* Time Filters */}
                <section className="relative mb-8 flex justify-end">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#005d52]/20 flex items-center gap-2 text-gray-700"
                        >
                            <Filter size={16} className="text-[#005d52]" />
                            <span>{getFilterDisplayText()}</span>
                            <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isDropdownOpen && !isCalendarOpen && (
                            <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-[160px]">
                                {(["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"] as TimeTab[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => handleFilterChange(tab)}
                                        className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                                            activeTab === tab ? "text-[#005d52] font-bold bg-teal-50/50" : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleFilterChange("Custom")}
                                    className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                                        activeTab === "Custom" ? "text-[#005d52] font-bold bg-teal-50/50" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    Custom
                                </button>
                            </div>
                        )}

                        {isCalendarOpen && (
                            <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                                <div className="space-y-3">
                                    <input
                                        type="date"
                                        value={customRange.start}
                                        onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005d52]/20"
                                    />
                                    <input
                                        type="date"
                                        value={customRange.end}
                                        min={customRange.start}
                                        onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005d52]/20"
                                    />
                                    <button
                                        onClick={handleCustomApply}
                                        className="w-full bg-[#005d52] text-white py-2 rounded-lg text-sm hover:bg-[#004a40] transition-colors"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Main Data Container */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search quote ID or company..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
                            <div className="relative min-w-35">
                                <button
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                    className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${statusFilter !== "All" ? "bg-teal-50 border-teal-200 text-[#005d52]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                                >
                                    <span className="truncate">{statusFilter === "All" ? "Status" : statusFilter}</span>
                                    <ChevronDown size={14} className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
                                </button>
                                {isStatusOpen && (
                                    <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                                        {(["All", "Draft", "Sent", "Accepted", "Rejected", "Expired"] as Status[]).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { setStatusFilter(s); setIsStatusOpen(false); setCurrentPage(1); }}
                                                className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === s ? "text-[#005d52] font-bold bg-teal-50/50" : "text-slate-600"}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                disabled={selectedIds.length === 0 || deleting}
                                className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 disabled:opacity-20 transition-colors"
                                onClick={handleBulkDelete}
                            >
                                {deleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="w-12 p-5 text-center border-b border-slate-100">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={paginatedQuotations.length > 0 && selectedIds.length === paginatedQuotations.length} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">QUOTE ID</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">DATE ISSUED</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">EXPIRY DATE</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">COMPANY NAME</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">TOTAL AMOUNT</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">STATUS</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedQuotations.map((qt) => (
                                    <tr key={qt.id} className="group hover:bg-teal-50/20 transition-colors">
                                        <td className="p-5 text-center">
                                            <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.includes(qt.id)} onChange={() => setSelectedIds(prev => prev.includes(qt.id) ? prev.filter(i => i !== qt.id) : [...prev, qt.id])} />
                                        </td>
                                        <td className="px-4 py-4 text-[13px] font-medium text-slate-800 text-center">{qt.quote_id}</td>
                                        <td className="px-4 py-4 text-[13px] text-slate-600 text-center whitespace-nowrap">{formatDate(qt.quotation_date)}</td>
                                        <td className="px-4 py-4 text-[13px] text-slate-600 text-center whitespace-nowrap">{formatDate(qt.valid_until)}</td>
                                        <td className="px-4 py-4 text-[13px] font-medium text-slate-800 text-center">{qt.company_name || "-"}</td>
                                        <td className="px-4 py-4 text-[14px] font-bold text-slate-800 text-center">{formatCurrency(qt.total)}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={getStatusStyle(qt.status)}>{qt.status}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => navigate(`/sales/quotation/quotation-view/${qt.id}`)} className="outline-none p-2 hover:bg-white text-slate-500 hover:text-[#005d52] rounded-xl transition-all">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(qt.id)} disabled={deleting} className="outline-none p-2 hover:bg-white text-slate-500 hover:text-rose-600 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!loading && filteredQuotations.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <div className="p-6 bg-slate-50 rounded-full mb-4">
                                    <FileText className="text-slate-200" size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No Quotations Found</h3>
                                <p className="text-slate-400 text-sm max-w-xs">We couldn't find any quotations matching your current filter criteria.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 0 && (
                        <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                                    Showing <span className="text-slate-900">{filteredQuotations.length > 0 ? startIndex + 1 : 0}</span> to <span className="text-slate-900">{Math.min(endIndex, filteredQuotations.length)}</span> of <span className="text-slate-900">{filteredQuotations.length}</span> Quotations
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handlePrevPage} 
                                    disabled={currentPage === 1} 
                                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={18} strokeWidth={2.5} />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {getPageNumbers().map((page, i) => (
                                        page === "..." ? 
                                            <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span> : 
                                            <button 
                                                key={i} 
                                                onClick={() => goToPage(page as number)} 
                                                className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20 scale-105" : "bg-white text-slate-500 border border-slate-200"}`}
                                            >
                                                {page}
                                            </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={handleNextPage} 
                                    disabled={currentPage === totalPages || totalPages === 0} 
                                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] disabled:opacity-30 transition-all"
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

export default QuotationList;