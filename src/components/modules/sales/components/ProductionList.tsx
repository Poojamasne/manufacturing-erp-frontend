import React, { useState, useMemo, useRef, useEffect  } from "react";
import { 
    Search, 
    ChevronDown, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    Edit3, 
    X, 
} from "lucide-react";
import {
    formatDateForInput,
    isDateInRange,
    isDateWithinCustomRange,
    type DateRange,
    type TimeTab,
} from "../utils/dateFilters";
import { useNavigate } from "react-router-dom";

// --- Types ---
type ProdStatus = "In Progress" | "On Hold" | "Completed" | "Delayed" | "All";
type Stage = "Raw Materials" | "Cutting" | "Assembly" | "Quality Check" | "Packaging";

type ProductionJob = {
    id: string;
    orderRef: string;
    product: string;
    quantity: number;
    stage: Stage;
    status: Exclude<ProdStatus, "All">;
    updatedAt: string;
};

const INITIAL_JOBS: ProductionJob[] = [
    { id: "PROD-1029", orderRef: "ORD-001", product: "Standard Control Panel", quantity: 15, stage: "Assembly", status: "In Progress", updatedAt: "2026-03-25" },
    { id: "PROD-1030", orderRef: "ORD-002", product: "HVAC Unit V3", quantity: 5, stage: "Cutting", status: "Delayed", updatedAt: "2026-03-24" },
    { id: "PROD-1031", orderRef: "ORD-003", product: "Motor Assemblies", quantity: 100, stage: "Packaging", status: "Completed", updatedAt: "2026-03-23" },
    { id: "PROD-1032", orderRef: "ORD-006", product: "Copper Wiring Bundle", quantity: 50, stage: "Raw Materials", status: "On Hold", updatedAt: "2026-03-22" },
    { id: "PROD-1033", orderRef: "ORD-010", product: "Industrial Generator", quantity: 2, stage: "Quality Check", status: "In Progress", updatedAt: "2026-03-25" },
];

const ProductionList: React.FC = () => {
    const navigate = useNavigate();

    const calendarRef = useRef<HTMLDivElement>(null);
    const [jobs, setJobs] = useState<ProductionJob[]>(INITIAL_JOBS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<TimeTab | "Custom">("All Time");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<DateRange>({
        from: "",
        to: formatDateForInput(new Date()),
    });
    
    const [statusFilter, setStatusFilter] = useState<ProdStatus>("All");
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Handle clicking outside the calendar popup to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredJobs = useMemo(() => {
        return jobs.filter((j) => {
            const matchesSearch = Object.values(j).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusFilter === "All" || j.status === statusFilter;
            
            let matchesTime = true;
            if (activeTab === "Custom") {
                matchesTime = isDateWithinCustomRange(j.updatedAt, customDateRange);
            } else {
                matchesTime = isDateInRange(j.updatedAt, activeTab as TimeTab);
            }

            return matchesSearch && matchesStatus && matchesTime;
        });
    }, [jobs, searchQuery, statusFilter, activeTab, customDateRange]);

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedJobs.length) setSelectedIds([]);
        else setSelectedIds(paginatedJobs.map(j => j.id));
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const getStatusColor = (st: string) => {
        switch(st) {
            case "In Progress": return "bg-blue-50 text-blue-600 border-blue-200";
            case "Completed": return "bg-green-50 text-green-600 border-green-200";
            case "Delayed": return "bg-red-50 text-red-600 border-red-200";
            case "On Hold": return "bg-orange-50 text-orange-600 border-orange-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    }

    const getStageColor = (st: string) => {
        switch(st) {
            case "Raw Materials": return "text-purple-600 bg-purple-50 font-medium";
            case "Cutting": return "text-indigo-600 bg-indigo-50 font-medium";
            case "Assembly": return "text-teal-600 bg-teal-50 font-medium";
            case "Quality Check": return "text-blue-600 bg-blue-50 font-medium";
            case "Packaging": return "text-green-600 bg-green-50 font-medium";
            default: return "text-gray-600 bg-gray-50 font-medium";
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Production Tracking</h1>
                        <p className="text-sm text-gray-400 font-normal">Monitor live manufacturing stages</p>
                    </div>
                </header>

                {/* Tabs Row with Custom Range Popup - Matches Opportunity style */}
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

                    {/* Lead-Style Calendar Popup positioned below the button */}
                    {isCalendarOpen && (
                        <div 
                            ref={calendarRef} 
                            className="absolute top-full mt-2 left-0 lg:left-80 z-50 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 min-w-[320px] animate-in zoom-in-95 duration-200"
                        >
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
                                placeholder="Search by Job ID or Order Reference..."
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
                                    {statusFilter === "All" ? "Status" : statusFilter} <ChevronDown size={14} />
                                </button>
                                {isStatusOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-50 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                                        {["All", "In Progress", "On Hold", "Completed", "Delayed"].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setStatusFilter(opt as ProdStatus); setIsStatusOpen(false); setCurrentPage(1); }}
                                                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${statusFilter === opt ? "text-[#005d52] font-bold" : "text-gray-600"}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => {setJobs(prev => prev.filter(j => !selectedIds.includes(j.id))); setSelectedIds([])}}
                                disabled={selectedIds.length === 0} 
                                className="p-2.5 bg-red-50 text-red-500 rounded-xl disabled:opacity-20 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Table Area with Vertical Lines */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="w-12 p-4 text-center border-b border-gray-100 border-r">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4" checked={selectedIds.length === paginatedJobs.length && paginatedJobs.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 border-r ">
                                        Job ID
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 border-r ">
                                        Order Ref
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 border-r ">
                                        Product
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 border-">
                                        Qty
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 border-r ">
                                        Stage
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 border-r ">
                                        Status
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 border-r">
                                        Updated
                                    </th>
                                    <th className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 text-center ">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedJobs.map((j) => (
                                    <tr key={j.id} className="hover:bg-[#f8faf9]/80 transition-colors">
                                        <td className="p-4 text-center border-r border-gray-100">
                                            <input type="checkbox" className="accent-[#005d52] w-4 h-4" checked={selectedIds.includes(j.id)} onChange={() => toggleSelectOne(j.id)} />
                                        </td>
                                        <td className="p-4 text-xs font-bold text-[#005d52] border-r border-gray-100">
                                            {j.id}
                                        </td>
                                        <td className="p-4 text-xs font-bold text-gray-600 underline cursor-pointer hover:text-[#005d52] border-r border-gray-100">
                                            {j.orderRef}
                                        </td>
                                        <td className="p-4 text-xs text-gray-800 border-r border-gray-100">
                                            {j.product}
                                        </td>
                                        <td className="p-4 text-xs text-gray-600 border-r border-gray-100">
                                            {j.quantity}
                                        </td>
                                        <td className="p-4 border-r border-gray-100">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStageColor(j.stage)}`}>
                                                {j.stage}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r border-gray-100">
                                            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap ${getStatusColor(j.status)}`}>
                                                {j.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap border-r border-gray-100">
                                            {j.updatedAt}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1 justify-center">
                                                <button className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-[#005d52] rounded-md transition-all" onClick={() => navigate(`/sales/production-edit/${j.id}`)}>
                                                    <Edit3 size={15} />
                                                </button>
                                                <button className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all" onClick={() => setJobs(prev => prev.filter(x => x.id !== j.id))}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <footer className="p-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-900">{paginatedJobs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredJobs.length)}</span> of <span className="text-gray-900">{filteredJobs.length}</span> Results
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

export default ProductionList;