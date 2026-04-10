import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    ChevronDown,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileEdit,
    X,
    Calendar as CalendarIcon,
    MoreHorizontal,
    TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLeads, deleteLead, clearErrors } from "../ModuleStateFiles/LeadSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Types ---
type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

interface Product {
    product_name: string;
    quantity: number;
}

interface Lead {
    id: number;
    lead_id: string;
    company_name: string;
    contact_person: string;
    phone: string;
    email: string;
    city: string;
    status: string;
    priority: string;
    created_at: string;
    product_count: number;
    products: Product[];
    assigned_to_name: string | null;
    value?: number;
}

// Statuses that should appear in Opportunities (Qualified, Won, In Progress, etc.)
const OPPORTUNITY_STATUSES = ["Qualified", "Won", "In Progress", "Converted", "Contacted"];

const OpportunityList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux State - Using Leads state
    const { leads, loading } = useAppSelector((state: RootState) => state.SalesLeads) as { leads: Lead[]; loading: boolean };

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [customRange, setCustomRange] = useState({ start: "", end: new Date().toISOString().split("T")[0] });

    // Professional Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // UI States
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Status options for Opportunities (from leads with specific statuses)
    const statusOptions = ["All", ...OPPORTUNITY_STATUSES];

    // Fetch leads on mount
    const fetchLeads = async () => {
        
        await dispatch(getLeads());
        // setIsRefreshing(false);
    };

    useEffect(() => {
        fetchLeads();
        return () => { dispatch(clearErrors()); };
    }, [dispatch]);

    // Close calendar on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset page to 1 when filters change
    useEffect(() => {
    }, [searchQuery, statusFilter, activeTab]);

    // --- Filtering Logic - Only show leads with Opportunity statuses ---
    const opportunityLeads = useMemo(() => {
        if (!leads) return [];
        // Filter leads to only show those with status in OPPORTUNITY_STATUSES
        return leads.filter((lead) => OPPORTUNITY_STATUSES.includes(lead.status));
    }, [leads]);

    const filteredOpportunities = useMemo(() => {
        if (!opportunityLeads) return [];
        return opportunityLeads.filter((lead) => {
            const matchesSearch =
                lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.lead_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.contact_person?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

            let matchesTime = true;
            const leadDate = new Date(lead.created_at);
            const now = new Date();

            if (activeTab === "Custom") {
                const start = customRange.start ? new Date(customRange.start) : null;
                const end = customRange.end ? new Date(customRange.end) : null;
                if (start) matchesTime = matchesTime && leadDate >= start;
                if (end) {
                    const endOfRange = new Date(end);
                    endOfRange.setHours(23, 59, 59);
                    matchesTime = matchesTime && leadDate <= endOfRange;
                }
            } else if (activeTab !== "All Time") {
                const diffInDays = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24);
                if (activeTab === "Weekly") matchesTime = diffInDays <= 7 && diffInDays >= 0;
                if (activeTab === "Monthly") matchesTime = leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
                if (activeTab === "Quarterly") matchesTime = Math.floor(leadDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && leadDate.getFullYear() === now.getFullYear();
                if (activeTab === "Yearly") matchesTime = leadDate.getFullYear() === now.getFullYear();
            }
            return matchesSearch && matchesStatus && matchesTime;
        });
    }, [opportunityLeads, searchQuery, statusFilter, activeTab, customRange]);

    // --- Pagination Helpers ---
    const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
    const paginatedOpportunities = filteredOpportunities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === paginatedOpportunities.length ? [] : paginatedOpportunities.map(o => o.id));
    };

    const handleDelete = (id: number) => {
        dispatch(deleteLead(id));
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        selectedIds.forEach(id => dispatch(deleteLead(id)));
        setSelectedIds([]);
    };


    // Calculate total opportunity value (sum of product totals)
    const getOpportunityValue = (lead: Lead) => {
        if (lead.products && lead.products.length > 0) {
            return lead.products.reduce((total, product) => total + (product.quantity * (product as any).unit_price || 0), 0);
        }
        return 0;
    };

    // --- Dynamic Styles ---
    const getStatusStyle = (status: string) => {
        const base = "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ";
        switch (status) {
            case 'Won': return base + 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Converted': return base + 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Lost': return base + 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Qualified': return base + 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'In Progress': return base + 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Contacted': return base + 'bg-cyan-50 text-cyan-700 border-cyan-100';
            default: return base + 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getPriorityStyle = (priority: string) => {
        const base = "px-2 py-1 rounded text-[10px] font-black uppercase ";
        switch (priority) {
            case 'High': return base + 'text-red-600 bg-red-50';
            case 'Medium': return base + 'text-amber-600 bg-amber-50';
            case 'Low': return base + 'text-teal-600 bg-teal-50';
            default: return base + 'text-slate-500 bg-slate-50';
        }
    };

    const getValueStyle = (value: number) => {
        if (value >= 500000) return "text-emerald-600 font-black";
        if (value >= 100000) return "text-blue-600 font-bold";
        return "text-slate-600";
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* --- Header Section --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Opportunities</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Qualified Leads & Sales Pipeline</p>
                    </div>
                </header>

                {/* --- Time Filters --- */}
                <section className="relative mb-8 flex flex-wrap items-center gap-3">
                    <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        {(["Weekly", "Monthly", "Quarterly", "Yearly", "All Time"] as TimeTab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`outline-none px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab ? "bg-[#005d52] text-white shadow-md" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                            >
                                {tab}
                            </button>
                        ))}
                        <button
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={`outline-none px-5 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 ${activeTab === "Custom" ? "bg-[#005d52] text-white shadow-md" : " text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                        >
                            <CalendarIcon size={14} /> Custom
                        </button>
                    </div>

                    {isCalendarOpen && (
                        <div ref={calendarRef} className="absolute top-full mt-3 left-0 md:left-auto md:right-100 z-50 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 min-w-[320px] animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-slate-800">Custom Date Range</h4>
                                <button onClick={() => setIsCalendarOpen(false)} className="outline-none "><X size={18} className="outline-none text-slate-400 hover:text-red-500" /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                                    <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                                    <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                </div>
                                <button onClick={() => { setActiveTab("Custom"); setIsCalendarOpen(false); }} className="w-full py-3.5 bg-[#005d52] text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-900/10">Apply Selection</button>
                            </div>
                        </div>
                    )}
                </section>

                {/* --- Main Data Container --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search opportunities by company, lead ID, contact..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
                            {/* Status Filter */}
                            <div className="relative min-w-35">
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
                                    className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${statusFilter !== "All" ? "bg-teal-50 border-teal-200 text-[#005d52]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                                >
                                    <span className="truncate">{statusFilter === "All" ? "Status" : statusFilter}</span>
                                    <ChevronDown size={14} className={`transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`} />
                                </button>
                                {openDropdown === "status" && (
                                    <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95">
                                        {statusOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setStatusFilter(opt); setOpenDropdown(null); }}
                                                className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-[#005d52] font-bold bg-teal-50/50" : "text-slate-600"}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                disabled={selectedIds.length === 0}
                                className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 disabled:opacity-20 transition-colors"
                                onClick={handleBulkDelete}
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
                                    <th className="w-16 p-5 text-center border-b border-slate-100">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={paginatedOpportunities.length > 0 && selectedIds.length === paginatedOpportunities.length} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">OPP ID</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">CREATED</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">COMPANY</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">CONTACT</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">VALUE</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">STATUS</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">PRIORITY</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedOpportunities.map((lead) => {
                                    const opportunityValue = getOpportunityValue(lead);
                                    return (
                                        <tr key={lead.id} className="group hover:bg-teal-50/20 transition-colors">
                                            <td className="p-5 text-center">
                                                <input type="checkbox" className="accent-[#005d52] w-4 h-4 cursor-pointer" checked={selectedIds.includes(lead.id)} onChange={() => setSelectedIds(prev => prev.includes(lead.id) ? prev.filter(i => i !== lead.id) : [...prev, lead.id])} />
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-slate-800 text-center font-mono">{lead.lead_id}</td>
                                            <td className="px-4 py-4 text-[13px] text-slate-800 whitespace-nowrap text-center">
                                                {new Date(lead.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-slate-800 font-medium text-center">{lead.company_name}</td>
                                            <td className="px-4 py-4 text-[13px] text-slate-600 text-center">
                                                <div>{lead.contact_person}</div>
                                                <div className="text-[10px] text-slate-400">{lead.phone}</div>
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-center">
                                                <span className={`font-bold ${getValueStyle(opportunityValue)}`}>
                                                    ₹{opportunityValue.toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={getStatusStyle(lead.status)}>{lead.status}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={getPriorityStyle(lead.priority)}>{lead.priority}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => navigate("/sales/opportunities/opportunity-view/" + lead.id)} className="outline-none p-2 hover:bg-white text-slate-800 hover:text-[#005d52] rounded-xl transition-all">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={() => navigate("/sales/opportunities/opportunity-edit/" + lead.id)} className="outline-none p-2 hover:bg-white text-slate-800 hover:text-blue-600 rounded-xl transition-all">
                                                        <FileEdit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(lead.id)} className="outline-none p-2 hover:bg-white text-slate-800 hover:text-rose-600 rounded-xl transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {!loading && filteredOpportunities.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center text-center">
                                <div className="p-6 bg-slate-50 rounded-full mb-4">
                                    <TrendingUp className="text-slate-200" size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No Opportunities Found</h3>
                                <p className="text-slate-400 text-sm max-w-xs">
                                    No qualified leads available. Opportunities are created when leads are marked as Qualified, Won, or In Progress.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* --- Professional Pagination Footer --- */}
                    {totalPages > 0 && (
                        <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                                    Showing <span className="text-slate-900">{filteredOpportunities.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredOpportunities.length)}</span> of <span className="text-slate-900">{filteredOpportunities.length}</span> Opportunities
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] disabled:opacity-30 transition-all">
                                    <ChevronLeft size={18} strokeWidth={2.5} />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {getPageNumbers().map((page, i) => (
                                        page === "..." ? <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span> : (
                                            <button key={i} onClick={() => setCurrentPage(page as number)} className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20 scale-105" : "bg-white text-slate-500 border border-slate-200"}`}>
                                                {page}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#005d52] disabled:opacity-30 transition-all">
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

export default OpportunityList;