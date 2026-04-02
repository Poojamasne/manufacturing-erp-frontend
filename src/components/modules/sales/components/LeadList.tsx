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
    Calendar as CalendarIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Robust Types ---
type Priority = "Hot" | "Warm" | "Cold" | "All";
type Status = "New Lead" | "Contacted" | "Converted" | "Quotation" | "Won" | "Lost" | "All";
type Source = "Dealer" | "Website" | "Referral" | "Trade Show" | "Cold Call" | "All";
type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

interface Lead {
    id: string;
    company: string;
    contact: string;
    number: string;
    email: string;
    gst: string;
    state: string;
    product: string;
    variant: string;
    quantity: number;
    unit: string;
    estValue: string;
    source: Exclude<Source, "All">;
    status: Exclude<Status, "All">;
    priority: Exclude<Priority, "All">;
    assignedTo: string;
    followUp: string;
    createdAt: string;
}

const INITIAL_LEADS: Lead[] = [
    { id: "L001", company: "Rajesh Electronics", contact: "Rakesh Patil", number: "9869226825", email: "rajeshelectronics@gmail.com", gst: "NPSS91543234342", state: "Maharashtra", product: "Refrigerator", variant: "4-door 500L", quantity: 10, unit: "Units", estValue: "₹ 18.5L", source: "Dealer", status: "New Lead", priority: "Hot", assignedTo: "Rahul Patil", followUp: "21-03-2026", createdAt: "2026-03-18" },
    { id: "L002", company: "Modern Appliances", contact: "Rohit Sharma", number: "9822334455", email: "modern@appl.com", gst: "GSTIN2233445566", state: "Delhi", product: "AC", variant: "1.5 Ton Split", quantity: 5, unit: "Units", estValue: "₹ 2.5L", source: "Website", status: "Quotation", priority: "Warm", assignedTo: "Sneha P.", followUp: "22-03-2026", createdAt: "2026-03-10" },
    { id: "L003", company: "Sunshine Solar", contact: "Amit Varma", number: "9123456789", email: "contact@sunshine.in", gst: "SUNS8877665544", state: "Gujarat", product: "Solar Panel", variant: "300W Mono", quantity: 50, unit: "Panels", estValue: "₹ 12.0L", source: "Referral", status: "Won", priority: "Hot", assignedTo: "Rahul Patil", followUp: "15-03-2026", createdAt: "2026-03-19" },
    { id: "L004", company: "Tech Logistics", contact: "Sarah Khan", number: "9988776655", email: "sarah@techlog.com", gst: "TLOG1122334455", state: "Karnataka", product: "Forklift", variant: "Electric 2T", quantity: 2, unit: "Units", estValue: "₹ 15.0L", source: "Trade Show", status: "Contacted", priority: "Warm", assignedTo: "Sneha P.", followUp: "25-03-2026", createdAt: "2026-03-14" },
    { id: "L005", company: "Blue Water Corp", contact: "John Doe", number: "9000112233", email: "info@bluewater.com", gst: "BWTR9900112233", state: "Goa", product: "Water Purifier", variant: "Industrial RO", quantity: 3, unit: "Units", estValue: "₹ 4.2L", source: "Cold Call", status: "Lost", priority: "Cold", assignedTo: "Rahul Patil", followUp: "10-03-2026", createdAt: "2026-03-02" },
    { id: "L006", company: "Green Earth Ltd", contact: "Priya Singh", number: "9876543210", email: "priya@greenearth.org", gst: "GELT5566778899", state: "Sikkim", product: "Compost Bin", variant: "Large 500L", quantity: 20, unit: "Units", estValue: "₹ 1.8L", source: "Website", status: "Converted", priority: "Hot", assignedTo: "Sneha P.", followUp: "28-03-2026", createdAt: "2026-02-20" },
    { id: "L007", company: "Swift Mart", contact: "Kevin Peter", number: "9223344556", email: "kevin@swiftmart.com", gst: "SWFT3344556677", state: "Tamil Nadu", product: "Deep Freezer", variant: "Double Door", quantity: 8, unit: "Units", estValue: "₹ 6.4L", source: "Dealer", status: "Quotation", priority: "Warm", assignedTo: "Rahul Patil", followUp: "24-03-2026", createdAt: "2026-02-05" },
    { id: "L008", company: "Heritage Foods", contact: "Meera Nair", number: "9556677889", email: "meera@heritage.in", gst: "HERI0011223344", state: "Kerala", product: "Cooler", variant: "Walk-in", quantity: 1, unit: "Units", estValue: "₹ 9.5L", source: "Referral", status: "New Lead", priority: "Cold", assignedTo: "Sneha P.", followUp: "30-03-2026", createdAt: "2026-01-15" },
    { id: "L009", company: "Urban Stay Hotels", contact: "Rahul Dev", number: "9445566778", email: "ops@urbanstay.com", gst: "URBN7788990011", state: "Rajasthan", product: "Television", variant: "Smart 55-inch", quantity: 25, unit: "Units", estValue: "₹ 13.5L", source: "Trade Show", status: "Won", priority: "Hot", assignedTo: "Rahul Patil", followUp: "12-03-2026", createdAt: "2026-03-17" },
    { id: "L010", company: "Global Traders", contact: "Linda M.", number: "9112233445", email: "linda@global.com", gst: "GLOB2233445566", state: "Punjab", product: "Air Purifier", variant: "HEPA Filter X", quantity: 15, unit: "Units", estValue: "₹ 3.0L", source: "Cold Call", status: "Contacted", priority: "Warm", assignedTo: "Sneha P.", followUp: "19-03-2026", createdAt: "2025-12-10" },
    { id: "L011", company: "Apex Buildtech", contact: "Sanjay Jha", number: "9667788990", email: "sanjay@apex.com", gst: "APEX4455667788", state: "Haryana", product: "Generator", variant: "Silent 5kVA", quantity: 4, unit: "Units", estValue: "₹ 5.8L", source: "Website", status: "Converted", priority: "Hot", assignedTo: "Rahul Patil", followUp: "22-03-2026", createdAt: "2026-03-12" },
    { id: "L012", company: "Elite Motors", contact: "Vicky Kaushal", number: "9778899001", email: "vicky@elitemotors.in", gst: "ELIT9988776655", state: "Madhya Pradesh", product: "Washing Machine", variant: "Top Load 10kg", quantity: 6, unit: "Units", estValue: "₹ 2.1L", source: "Dealer", status: "New Lead", priority: "Cold", assignedTo: "Sneha P.", followUp: "27-03-2026", createdAt: "2026-02-28" }
];

const LeadList: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter States
    const [customRange, setCustomRange] = useState({ start: "", end: "" });
    const [priorityFilter, setPriorityFilter] = useState<Priority>("All");
    const [statusFilter, setStatusFilter] = useState<Status>("All");
    const [sourceFilter, setSourceFilter] = useState<Source>("All");

    // UI Open States
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

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
        return leads.filter((lead) => {
            const matchesSearch = lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = priorityFilter === "All" || lead.priority === priorityFilter;
            const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
            const matchesSource = sourceFilter === "All" || lead.source === sourceFilter;

            let matchesTime = true;
            const leadDate = new Date(lead.createdAt);
            const now = new Date("2026-03-20");

            if (activeTab === "Custom") {
                const start = customRange.start ? new Date(customRange.start) : null;
                const end = customRange.end ? new Date(customRange.end) : null;
                if (start) matchesTime = matchesTime && leadDate >= start;
                if (end) {
                    // Set end to end of day
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
            return matchesSearch && matchesPriority && matchesStatus && matchesSource && matchesTime;
        });
    }, [leads, searchQuery, priorityFilter, statusFilter, sourceFilter, activeTab, customRange]);

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleSelectAll = () => {
        setSelectedIds(selectedIds.length === paginatedLeads.length ? [] : paginatedLeads.map(l => l.id));
    };

    const getStatusStyle = (status: string) => {
        const base = "px-3 py-1 rounded-full text-[10px] font-medium border ";
        switch (status) {
            case 'Won': return base + 'bg-green-50 text-green-700 border-green-200';
            case 'Lost': return base + 'bg-red-50 text-red-700 border-red-200';
            case 'Quotation': return base + 'bg-blue-50 text-blue-700 border-blue-200';
            default: return base + 'bg-gray-50 text-gray-600 border-gray-200';
        }
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
                        onClick={() => navigate("/sales/new-lead")}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={18} strokeWidth={3} /> New Lead
                    </button>
                </header>

                {/* Tabs */}
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

                    {/* Calendar Popup */}
                    {isCalendarOpen && (
                        <div ref={calendarRef} className="absolute top-full mt-2 left-90 z-50 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 min-w-[320px] animate-in zoom-in-95 duration-200">
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
                                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
                                    <input
                                        type="date"
                                        value={customRange.end}
                                        onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
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

                {/* Main Table Container */}
                <div className="bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-6 flex flex-col xl:flex-row justify-between items-center gap-4 bg-white border-b border-gray-50">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#005d52] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Lead ID or Company..."
                                className="w-full pl-12 pr-4 py-3 bg-[#f8faf9] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#005d52]/10 text-sm outline-none transition-all font-normal"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 w-full">
                            {[
                                { label: 'Source', value: sourceFilter, options: ["All", "Dealer", "Website", "Referral", "Trade Show", "Cold Call"], setter: setSourceFilter },
                                { label: 'Priority', value: priorityFilter, options: ["All", "Hot", "Warm", "Cold"], setter: setPriorityFilter },
                                { label: 'Status', value: statusFilter, options: ["All", "New Lead", "Contacted", "Converted", "Quotation", "Won", "Lost"], setter: setStatusFilter }
                            ].map((f) => (
                                <div key={f.label} className="relative">
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === f.label ? null : f.label)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${f.value !== "All" ? "bg-teal-50 border-[#005d52] text-[#005d52]" : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"}`}
                                    >
                                        {f.value === "All" ? f.label : f.value} <ChevronDown size={14} className={openDropdown === f.label ? "rotate-180 transition-transform" : "transition-transform"} />
                                    </button>
                                    {openDropdown === f.label && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-50 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in zoom-in-95 duration-200">
                                            {f.options.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { f.setter(opt as any); setOpenDropdown(null); setCurrentPage(1); }}
                                                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${f.value === opt ? "text-[#005d52] font-bold" : "text-gray-600 font-normal"}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => { setLeads(prev => prev.filter(l => !selectedIds.includes(l.id))); setSelectedIds([]) }}
                                disabled={selectedIds.length === 0}
                                className="p-2.5 bg-red-50 text-red-500 rounded-xl disabled:opacity-20 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="w-full overflow-hidden border-t border-gray-100">
                        <table className="w-full text-left border-separate border-spacing-0 table-fixed">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    {/* Selection Column - Narrowest */}
                                    <th className="w-12 p-3 text-center border-b border-r border-gray-100">
                                        <input
                                            type="checkbox"
                                            className="accent-[#005d52] w-4 h-4 cursor-pointer"
                                            checked={selectedIds.length === paginatedLeads.length && paginatedLeads.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>

                                    {/* Lead ID - Small fixed width */}
                                    <th className="w-20 p-3 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-r border-gray-100">
                                        ID
                                    </th>

                                    {/* Date Created - Medium fixed width */}
                                    <th className="w-28 p-3 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-r border-gray-100">
                                        Created
                                    </th>

                                    {/* Company Name - Flexible width */}
                                    <th className="p-3 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-r border-gray-100">
                                        Company
                                    </th>

                                    {/* Product Name - Flexible width */}
                                    <th className="p-3 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-r border-gray-100">
                                        Product
                                    </th>

                                    {/* Quantity - Small fixed width */}
                                    <th className="w-20 p-3 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-r border-gray-100 text-center">
                                        Qty
                                    </th>

                                    {/* Status - Fixed width for badges */}
                                    <th className="w-32 p-3 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-r border-gray-100 text-center">
                                        Status
                                    </th>

                                    {/* Actions - Fixed width */}
                                    <th className="w-28 p-3 text-[10px] font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {paginatedLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-[#f8faf9]/80 transition-colors group">
                                        <td className="p-3 text-center border-r border-gray-100">
                                            <input
                                                type="checkbox"
                                                className="accent-[#005d52] w-4 h-4 cursor-pointer"
                                                checked={selectedIds.includes(lead.id)}
                                                onChange={() => setSelectedIds(prev => prev.includes(lead.id) ? prev.filter(i => i !== lead.id) : [...prev, lead.id])}
                                            />
                                        </td>

                                        <td className="p-3 text-xs font-bold text-[#005d52] border-r border-gray-100">
                                            {lead.id}
                                        </td>

                                        <td className="p-3 text-xs text-gray-500 border-r border-gray-100 whitespace-nowrap">
                                            {lead.createdAt}
                                        </td>

                                        <td className="p-3 text-xs text-gray-800 border-r border-gray-100 truncate max-w-0" title={lead.company}>
                                            {lead.company}
                                        </td>

                                        <td className="p-3 text-xs text-gray-600 border-r border-gray-100 truncate max-w-0" title={lead.product}>
                                            {lead.product}
                                        </td>

                                        <td className="p-3 text-xs border-r border-gray-100 text-center">
                                            <span className="text-gray-900">{lead.quantity}</span>
                                            <span className="text-[10px] text-gray-400 ml-1 uppercase">{lead.unit}</span>
                                        </td>

                                        <td className="p-3 text-center border-r border-gray-100">
                                            <span className={getStatusStyle(lead.status)}>
                                                {lead.status}
                                            </span>
                                        </td>

                                        <td className="p-3">
                                            <div
                                            onClick={()=>navigate("/sales/lead-view/id")}
                                            className="flex gap-0.5 justify-end">
                                                <button title="View" className="p-1.5 hover:bg-teal-50 text-gray-400 hover:text-[#005d52] rounded-md transition-all">
                                                    <Eye size={15} />
                                                </button>
                                                <button title="Edit" className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-all">
                                                    <FileEdit size={15} />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    onClick={() => setLeads(prev => prev.filter(l => l.id !== lead.id))}
                                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-all"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {paginatedLeads.length === 0 && (
                            <div className="py-20 text-center border-b border-gray-100">
                                <div className="inline-flex p-5 bg-gray-50 rounded-full mb-3">
                                    <Filter className="text-gray-300" size={24} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800">No leads found</h3>
                                <p className="text-xs text-gray-400 font-normal mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Pagination */}
                    <footer className="p-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-900 font-bold">{paginatedLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> of <span className="text-gray-900 font-bold">{filteredLeads.length}</span> Results
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-gray-400 hover:text-[#005d52] disabled:opacity-20 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20" : "text-gray-400 hover:bg-gray-100"}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 text-gray-400 hover:text-[#005d52] disabled:opacity-20 transition-colors"
                            >
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