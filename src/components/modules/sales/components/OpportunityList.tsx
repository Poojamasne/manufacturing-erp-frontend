import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Plus,
    ChevronDown,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Calendar as CalendarIcon,
    Eye,
    FileEdit,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    formatDateForInput,
    isDateInRange,
    isDateWithinCustomRange,
    type DateRange,
} from "../utils/dateFilters";

// --- Types ---
type Priority = "High" | "Medium" | "Low" | "All";
type Stage = "Discovery" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost" | "All";
type Source = "Dealer" | "Website" | "Referral" | "Trade Show" | "Cold Call" | "All";
type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";
type Opportunity = {
    id: string;
    company: string;
    contact: string;
    number: string;
    email: string;
    expectedValue: string;
    source: Exclude<Source, "All">;
    stage: Exclude<Stage, "All">;
    priority: Exclude<Priority, "All">;
    assignedTo: string;
    expectedCloseDate: string; 
    createdAt: string; 
};

const INITIAL_OPPORTUNITIES: Opportunity[] = [
    // ... (Your existing mock data remains the same)
    { id: "OP001", company: "Rajesh Electronics", contact: "Rakesh Patil", number: "9869226825", email: "rajeshelectronics@gmail.com", expectedValue: "₹ 25.5L", source: "Dealer", stage: "Proposal", priority: "High", assignedTo: "Rahul Patil", expectedCloseDate: "2026-03-31", createdAt: "2026-03-18" },
    { id: "OP002", company: "Modern Appliances", contact: "Rohit Sharma", number: "9822334455", email: "modern@appl.com", expectedValue: "₹ 5.5L", source: "Website", stage: "Negotiation", priority: "Medium", assignedTo: "Sneha P.", expectedCloseDate: "2026-04-15", createdAt: "2026-03-10" },
    { id: "OP003", company: "Kitchen Hub", contact: "Anjali M.", number: "9123456789", email: "hub@kitchen.com", expectedValue: "₹ 11.2L", source: "Referral", stage: "Discovery", priority: "Low", assignedTo: "Rahul Patil", expectedCloseDate: "2026-05-10", createdAt: "2026-02-15" },
];

const OpportunityList: React.FC = () => {
    const navigate = useNavigate();
    const calendarRef = useRef<HTMLDivElement>(null);
    const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [customDateRange, setCustomDateRange] = useState<DateRange>({
        from: "",
        to: formatDateForInput(new Date()),
    });
    
    const [priorityFilter, setPriorityFilter] = useState<Priority>("All");
    const [stageFilter, setStageFilter] = useState<Stage>("All");
    const [sourceFilter, setSourceFilter] = useState<Source>("All");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

    const filteredOpportunities = useMemo(() => {
        return opportunities.filter((opp) => {
            const matchesSearch = opp.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 opp.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = priorityFilter === "All" || opp.priority === priorityFilter;
            const matchesStage = stageFilter === "All" || opp.stage === stageFilter;
            const matchesSource = sourceFilter === "All" || opp.source === sourceFilter;
            
            let matchesTime = true;
            if (activeTab === "Custom") {
                matchesTime = isDateWithinCustomRange(opp.createdAt, customDateRange);
            } else {
                matchesTime = isDateInRange(opp.createdAt, activeTab);
            }

            return matchesSearch && matchesPriority && matchesStage && matchesSource && matchesTime;
        });
    }, [opportunities, searchQuery, priorityFilter, stageFilter, sourceFilter, activeTab, customDateRange]);

    const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
    const paginatedOpportunities = filteredOpportunities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedOpportunities.length) setSelectedIds([]);
        else setSelectedIds(paginatedOpportunities.map(o => o.id));
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Opportunities</h1>
                        <p className="text-sm text-gray-400 font-normal">Track and manage prospective deals</p>
                    </div>
                    <button
                        onClick={() => navigate("/sales/new-opportunity")}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={18} strokeWidth={3} /> New Opportunity
                    </button>
                </header>

                {/* Tabs Row with Custom Range Popup */}
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
                            <CalendarIcon size={14} /> Custom Range
                        </button>
                    </div>

                    {/* Lead-Style Calendar Popup */}
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
                                placeholder="Search by Opportunity ID or Company..."
                                value={searchQuery}
                                onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                                className="w-full pl-12 pr-4 py-3 bg-[#f8faf9] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#005d52]/10 text-sm outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 w-full">
                            {/* Filter Dropdowns logic (Similar to Lead List) */}
                            {[
                                { label: 'Source', value: sourceFilter, options: ["All", "Dealer", "Website", "Referral", "Trade Show", "Cold Call"], setter: setSourceFilter },
                                { label: 'Priority', value: priorityFilter, options: ["All", "High", "Medium", "Low"], setter: setPriorityFilter },
                                { label: 'Stage', value: stageFilter, options: ["All", "Discovery", "Proposal", "Negotiation", "Closed Won", "Closed Lost"], setter: setStageFilter }
                            ].map((f) => (
                                <div key={f.label} className="relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === f.label ? null : f.label)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${f.value !== "All" ? "bg-teal-50 border-[#005d52] text-[#005d52]" : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"}`}
                                    >
                                        {f.value === "All" ? f.label : f.value} <ChevronDown size={14} />
                                    </button>
                                    {openDropdown === f.label && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-50 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                                            {f.options.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { f.setter(opt as any); setOpenDropdown(null); setCurrentPage(1); }}
                                                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${f.value === opt ? "text-[#005d52] font-bold" : "text-gray-600"}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button 
                                onClick={() => {setOpportunities(prev => prev.filter(o => !selectedIds.includes(o.id))); setSelectedIds([])}}
                                disabled={selectedIds.length === 0} 
                                className="p-2.5 bg-red-50 text-red-500 rounded-xl disabled:opacity-20 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="w-12 p-4 text-center border-b border-gray-100">
                                        <input type="checkbox" className="accent-[#005d52] w-4 h-4" checked={selectedIds.length === paginatedOpportunities.length && paginatedOpportunities.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    {["Opp ID", "Date Created", "Company Name", "Est. Value", "Priority", "Exp. Close Date", "Actions"].map((col) => (
                                        <th key={col} className="p-4 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100">
                                            <div className="flex items-center gap-1">
                                                {col} <ChevronsUpDown size={12} className="text-gray-300" />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedOpportunities.map((opp) => (
                                    <tr key={opp.id} className="hover:bg-[#f8faf9]/80 transition-colors">
                                        <td className="p-4 text-center">
                                            <input type="checkbox" className="accent-[#005d52] w-4 h-4" checked={selectedIds.includes(opp.id)} onChange={() => setSelectedIds(prev => prev.includes(opp.id) ? prev.filter(i => i !== opp.id) : [...prev, opp.id])} />
                                        </td>
                                        <td className="p-4 text-xs font-bold text-[#005d52]">{opp.id}</td>
                                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{opp.createdAt}</td>
                                        <td className="p-4 text-xs text-gray-800 font-medium">{opp.company}</td>
                                        <td className="p-4 text-xs text-gray-800">{opp.expectedValue}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${opp.priority === 'High' ? 'bg-red-50 text-red-600' : opp.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {opp.priority}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-600">{opp.expectedCloseDate}</td>
                                        <td className="p-4">
                                            <div className="flex gap-1 justify-end">
                                                <button className="p-1.5 hover:bg-teal-50 text-gray-400 hover:text-[#005d52] rounded-md transition-all"><Eye size={15}/></button>
                                                <button className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-all"><FileEdit size={15}/></button>
                                                <button className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all" onClick={() => setOpportunities(prev => prev.filter(o => o.id !== opp.id))}><Trash2 size={15}/></button>
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
                            Showing <span className="text-gray-900">{paginatedOpportunities.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredOpportunities.length)}</span> of <span className="text-gray-900">{filteredOpportunities.length}</span> Results
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 text-gray-400 hover:text-[#005d52] disabled:opacity-20 transition-colors"><ChevronLeft size={20} /></button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20" : "text-gray-400 hover:bg-gray-100"}`}>{i + 1}</button>
                                ))}
                            </div>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 text-gray-400 hover:text-[#005d52] disabled:opacity-20 transition-colors"><ChevronRight size={20} /></button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default OpportunityList;