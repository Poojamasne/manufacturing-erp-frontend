import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Plus,
    ChevronDown,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileEdit,
    X,
    Filter,
    Calendar as CalendarIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLeads, clearErrors } from "../ModuleStateFiles/LeadSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Types updated to match API JSON ---
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
}

const LeadList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux State , import error
    const { leads, loading } = useAppSelector((state: RootState) => state.SalesLeads) as { leads: Lead[]; loading: boolean };

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter States
    const [customRange, setCustomRange] = useState({ start: "", end: new Date().toISOString().split("T")[0] });
    const [priorityFilter, setPriorityFilter] = useState<string>("All");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    // UI Open States
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Initial Data Fetch
    useEffect(() => {
        dispatch(getLeads());
        return () => { dispatch(clearErrors()); };
    }, [dispatch]);

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

    // --- Filtering Logic ---
    const filteredLeads = useMemo(() => {
        if (!leads) return [];
        return (leads as Lead[]).filter((lead) => {
            const matchesSearch =
                lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.lead_id.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesPriority = priorityFilter === "All" || lead.priority === priorityFilter;
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
            return matchesSearch && matchesPriority && matchesStatus && matchesTime;
        });
    }, [leads, searchQuery, priorityFilter, statusFilter, activeTab, customRange]);

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === paginatedLeads.length ? [] : paginatedLeads.map(l => l.id));
    };

    const getStatusStyle = (status: string) => {
        const base = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ";
        switch (status) {
            case 'Won':
            case 'New': return base + 'bg-teal-50 text-teal-700 border-teal-200';
            case 'Contacted': return base + 'bg-teal-100 text-teal-700 border-teal-200';
            case 'Qualified': return base + 'bg-green-50 text-green-700 border-green-200';
            case 'Quotation': return base + 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Won': return base + 'bg-green-50 text-green-700 border-green-200';
            case 'Lost': return base + 'bg-red-50 text-red-700 border-red-200';
            default: return base + 'bg-gray-50 text-gray-600 border-gray-200';
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 text-gray-900 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Leads</h1>
                        <p className="text-sm text-gray-400 font-normal">Manage and track your customer conversions</p>
                    </div>
                    <button
                        onClick={() => navigate("/sales/leads/new-lead")}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={18} strokeWidth={3} /> New Lead
                    </button>
                </header>

                {/* Tabs */}
                <section className="relative mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

                    {isCalendarOpen && (
                        <div ref={calendarRef} className="absolute top-full mt-2 right-50 md:left-auto z-50 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 min-w-[320px] animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-gray-800">Select Date Range</h4>
                                <button onClick={() => setIsCalendarOpen(false)}><X size={18} className="text-gray-400" /></button>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
                                    <input
                                        type="date"
                                        value={customRange.start}
                                        onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                        className="w-full p-3 bg-gray-50 text-[#005d52] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
                                    <input
                                        type="date"
                                        value={customRange.end}
                                        onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                        className="w-full p-3 bg-gray-50 text-[#005d52] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
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
                {/* Main Table Container */}
                <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative min-h-[400px]">

                    {/* Toolbar */}
                    <div className="p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white border-b border-gray-50">

                        {/* Search */}
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#005d52]" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Lead ID or Company..."
                                className="w-full pl-12 pr-4 py-3 bg-[#F3F4F6] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#005d52]/10 text-sm outline-none"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
                            {[
                                { label: 'Priority', value: priorityFilter, options: ["All", "High", "Medium", "Low"], setter: setPriorityFilter },
                                { label: 'Status', value: statusFilter, options: ["All", "New", "Qualified", "Quotation", "Contacted"], setter: setStatusFilter }
                            ].map((f) => (
                                <div key={f.label} className="relative flex-1 sm:flex-none min-w-[120px]">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === f.label ? null : f.label)}
                                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold ${f.value !== "All"
                                            ? "bg-teal-50 border-[#005d52] text-[#005d52]"
                                            : "bg-white border-gray-100 text-gray-500"
                                            }`}
                                    >
                                        <span className="truncate">{f.value === "All" ? f.label : f.value}</span>
                                        <ChevronDown size={14} />
                                    </button>

                                    {openDropdown === f.label && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-50 rounded-2xl shadow-2xl z-50 py-1">
                                            {f.options.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { f.setter(opt as any); setOpenDropdown(null); setCurrentPage(1); }}
                                                    className={`w-full text-left px-4 py-2.5 text-[13px] ${f.value === opt ? "text-[#005d52] font-bold" : "text-gray-600"
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button
                                disabled={selectedIds.length === 0}
                                className="p-2.5 bg-red-50 text-red-500 rounded-xl disabled:opacity-20"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="w-full overflow-x-auto lg:overflow-visible border-t border-gray-100">
                        <table className="w-full text-left border-collapse table-auto">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="w-12 p-3 text-center border-b border-r border-gray-200">
                                        <input
                                            type="checkbox"
                                            className="accent-[#005d52] w-4 h-4 cursor-pointer"
                                            checked={paginatedLeads.length > 0 && selectedIds.length === paginatedLeads.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>

                                    <th className="px-3 py-3 text-[13px] font-bold border-b border-r border-gray-200 whitespace-nowrap text-gray-700">ID</th>
                                    <th className="px-3 py-3 text-[13px] font-bold border-b border-r border-gray-200 whitespace-nowrap text-gray-700">CREATED</th>
                                    <th className="px-3 py-3 text-[13px] font-bold border-b border-r border-gray-200 text-gray-700">Company</th>
                                    <th className="px- py-3 text-[13px] font-bold border-b border-r border-gray-200 text-gray-700">PRODUCT</th>
                                    <th className="px- py-3 text-[13px] font-bold border-b border-r border-gray-200 text-center text-gray-700">QTY</th>
                                    <th className="px-3 py-3 text-[13px] font-bold border-b border-r border-gray-200 text-center text-gray-700">Status</th>
                                    <th className="px-3 py-3 text-[13px] font-bold border-b border-gray-200 text-center text-gray-700">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {paginatedLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-[#f8faf9]/80 transition-colors">
                                        <td className="p-3 text-center border-r border-gray-200">
                                            <input
                                                type="checkbox"
                                                className="accent-[#005d52] w-4 h-4 cursor-pointer"
                                                checked={selectedIds.includes(lead.id)}
                                                onChange={() =>
                                                    setSelectedIds(prev =>
                                                        prev.includes(lead.id)
                                                            ? prev.filter(i => i !== lead.id)
                                                            : [...prev, lead.id]
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="px-3 py-2 text-[13px] font-bold text-[#005d52] border-r border-gray-200 whitespace-nowrap">
                                            {lead.lead_id}
                                        </td>

                                        <td className="px-3 py-2 text-[13px] border-r border-gray-200 whitespace-nowrap text-gray-600">
                                            {formatDate(lead.created_at)}
                                        </td>

                                        <td className="px-3 py-2 text-[13px] border-r border-gray-200 truncate max-w-[160px] text-gray-800" title={lead.company_name}>
                                            {lead.company_name}
                                        </td>

                                        <td className="px- py-2 text-[13px] text-center border-r border-gray-200 max-w-[180px] text-gray-800">
                                            {lead.products && lead.products.length > 0 ? (
                                                lead.products.map((p, i) => (
                                                    <div key={i} className="flex justify-between border-b text-center border-gray-300 last:border-0 py-1">
                                                        <span className="truncate text-center">{i + 1}. {p.product_name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>

                                        <td className="py-2 text-[12px] text-center border-r border-gray-200 text-gray-800">
                                            {lead.products && lead.products.length > 0 ? (
                                                lead.products.map((p, i) => (
                                                    <div key={i} className="border-b border-gray-300 last:border-0 py-1">
                                                        {p.quantity}
                                                    </div>
                                                ))
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        <td className="px-3 py-2 text-center border-r border-gray-200">
                                            <span className={getStatusStyle(lead.status)}>
                                                {lead.status}
                                            </span>
                                        </td>

                                        <td className="px-3 py-2">
                                            <div className="flex justify-center gap-1 flex-nowrap">
                                                <button onClick={() => navigate("/sales/leads/view-lead/" + lead.id)}
                                                    className="p-2 hover:bg-teal-50 text-gray-500 hover:text-[#005d52] rounded-lg transition-all">
                                                    <Eye size={15} />
                                                </button>
                                                <button onClick={() => navigate("/sales/leads/edit-lead/" + lead.id)}
                                                    className="p-2 hover:bg-teal-50 text-gray-500 hover:text-blue-600 rounded-lg transition-all">
                                                    <FileEdit size={15} />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition-all">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filteredLeads.length === 0 && (
                            <div className="py-20 text-center">
                                <div className="inline-flex p-5 bg-gray-50 rounded-full mb-3">
                                    <Filter className="text-gray-300" size={24} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800">No leads found</h3>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="p-4 sm:p-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">

                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
                            Showing <span className="text-gray-900 font-bold">
                                {paginatedLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                                {" - "}
                                {Math.min(currentPage * itemsPerPage, filteredLeads.length)}
                            </span> of <span className="text-gray-900 font-bold">{filteredLeads.length}</span> Results
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex gap-1 sm:gap-2 flex-wrap">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold ${currentPage === i + 1
                                            ? "bg-[#005d52] text-white"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </footer>

                </div>
            </div>
        </div>
    );
};

export default LeadList;