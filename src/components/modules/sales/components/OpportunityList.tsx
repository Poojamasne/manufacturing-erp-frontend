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
    IndianRupee
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// --- Redux Imports ---
import { getOpportunities, clearSalesErrors } from "../ModuleStateFiles/OpportunitySlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Types ---
type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

interface Opportunity {
    id: number;
    lead_id: string;
    company_name: string;
    contact_person: string;
    phone: string;
    email: string;
    value: number;
    stage: string;
    priority: string;
    source: string;
    expected_close_date: string;
    assigned_to_name?: string;
    created_at: string;
}

const OpportunityList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux State
    const { opportunities } = useAppSelector((state: RootState) => state.SalesOpportunity);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [priorityFilter, setPriorityFilter] = useState<string>("All");
    const [stageFilter, setStageFilter] = useState<string>("All");
    const [customRange, setCustomRange] = useState({ start: "", end: new Date().toISOString().split("T")[0] });

    // Professional Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    setItemsPerPage(10)
    // UI States
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(getOpportunities());
        return () => { dispatch(clearSalesErrors()); };
    }, [dispatch]);

    // Handle outside click for calendar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, priorityFilter, stageFilter, activeTab, itemsPerPage]);

    // --- Filtering Logic ---
    const filteredOps = useMemo(() => {
        if (!opportunities) return [];
        return (opportunities as Opportunity[]).filter((op) => {
            const matchesSearch =
                op.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                op.lead_id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesPriority = priorityFilter === "All" || op.priority === priorityFilter;
            const matchesStage = stageFilter === "All" || op.stage === stageFilter;

            let matchesTime = true;
            const opDate = new Date(op.created_at || new Date());
            const now = new Date();

            if (activeTab === "Custom") {
                const start = customRange.start ? new Date(customRange.start) : null;
                const end = customRange.end ? new Date(customRange.end) : null;
                if (start) matchesTime = matchesTime && opDate >= start;
                if (end) {
                    const endOfRange = new Date(end);
                    endOfRange.setHours(23, 59, 59);
                    matchesTime = matchesTime && opDate <= endOfRange;
                }
            } else if (activeTab !== "All Time") {
                const diffInDays = (now.getTime() - opDate.getTime()) / (1000 * 60 * 60 * 24);
                if (activeTab === "Weekly") matchesTime = diffInDays <= 7 && diffInDays >= 0;
                if (activeTab === "Monthly") matchesTime = opDate.getMonth() === now.getMonth() && opDate.getFullYear() === now.getFullYear();
                if (activeTab === "Yearly") matchesTime = opDate.getFullYear() === now.getFullYear();
            }
            return matchesSearch && matchesPriority && matchesStage && matchesTime;
        });
    }, [opportunities, searchQuery, priorityFilter, stageFilter, activeTab, customRange]);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredOps.length / itemsPerPage);
    const paginatedData = filteredOps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

    // --- Dynamic Styles ---
    const getStageStyle = (stage: string) => {
        const base = "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ";
        switch (stage) {
            case 'Discovery': return base + 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Proposal': return base + 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Negotiation': return base + 'bg-purple-50 text-purple-700 border-purple-100';
            case 'Closed Won': return base + 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Closed Lost': return base + 'bg-rose-50 text-rose-700 border-rose-100';
            default: return base + 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getPriorityStyle = (priority: string) => {
        const base = "px-2 py-1 rounded text-[10px] font-black uppercase ";
        if (priority === 'High') return base + 'text-red-600 bg-red-50';
        if (priority === 'Medium') return base + 'text-amber-600 bg-amber-50';
        return base + 'text-teal-600 bg-teal-50';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Opportunities</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Track high-value deals and pipeline stages.</p>
                    </div>

                </header>

                {/* Time Tabs */}
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
                        <button
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={`px-5 py-3 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 ${activeTab === "Custom" ? "bg-[#005d52] text-white shadow-md" : "bg-white border-slate-200 text-slate-500"}`}
                        >
                            <CalendarIcon size={14} /> Custom
                        </button>
                    </div>

                    {isCalendarOpen && (
                        <div ref={calendarRef} className="absolute top-full mt-3 left-40  z-50 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 min-w-[320px] animate-in fade-in zoom-in-95">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-slate-800">Select Date Range</h4>
                                <button onClick={() => setIsCalendarOpen(false)}><X size={18} className="text-slate-400" /></button>
                            </div>
                            <div className="space-y-4">
                                <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
                                <button onClick={() => { setActiveTab("Custom"); setIsCalendarOpen(false); }} className="w-full py-3.5 bg-[#005d52] text-white rounded-xl font-bold text-xs">Apply</button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Main Table Area */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Company or ID..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
                            {[
                                { label: 'Stage', value: stageFilter, options: ["All", "Discovery", "Proposal", "Negotiation", "Closed Won", "Closed Lost"], setter: setStageFilter },
                                { label: 'Priority', value: priorityFilter, options: ["All", "High", "Medium", "Low", "Critical"], setter: setPriorityFilter }
                            ].map((f) => (
                                <div key={f.label} className="relative min-w-37.5">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === f.label ? null : f.label)}
                                        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold ${f.value !== "All" ? "bg-teal-50 border-teal-200 text-[#005d52]" : "bg-white border-slate-200 text-slate-600"}`}
                                    >
                                        <span className="truncate">{f.value === "All" ? f.label : f.value}</span>
                                        <ChevronDown size={14} />
                                    </button>
                                    {openDropdown === f.label && (
                                        <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                                            {f.options.map(opt => (
                                                <button key={opt} onClick={() => { f.setter(opt); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${f.value === opt ? "text-[#005d52] font-bold" : "text-slate-600"}`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ID </th>
                                    <th className="px-6 py-5 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Company</th>
                                    <th className="px-6 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Deal Value</th>
                                    <th className="px-6 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Stage</th>
                                    <th className="px-6 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Priority</th>
                                    <th className="px-6 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Expected Close</th>
                                    <th className="px-6 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedData.map((op) => (
                                    <tr key={op.id} className="group hover:bg-teal-50/20 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">{op?.id}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[13px] text-slate-800">{op.company_name}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-800 text-[13px]">
                                                <IndianRupee size={14} />
                                                {op.value.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={getStageStyle(op.stage)}>{op.stage}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={getPriorityStyle(op.priority)}>{op.priority}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="text-[13px] text-slate-800 text-center">
                                                {new Date(op.expected_close_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => navigate(`/sales/opportunities/opportunity-view/${op.id}`)} className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-[#005d52] rounded-xl transition-all"><Eye size={16} /></button>
                                                <button onClick={() => navigate(`/sales/opportunities/opportunity-edit/${op.id}`)} className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-blue-600 rounded-xl transition-all"><FileEdit size={16} /></button>
                                                <button className="p-2 hover:bg-white hover:shadow-md text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Professional Pagination Footer --- */}
                    <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">

                            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                                Showing <span className="text-slate-800">{paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredOps.length)}</span> of <span className="text-slate-900">{filteredOps.length}</span> Opportunities
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
                </div>
            </div>
        </div>
    );
};

export default OpportunityList;