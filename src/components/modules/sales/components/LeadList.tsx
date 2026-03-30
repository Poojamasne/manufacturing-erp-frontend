import React, { useState, useMemo } from "react";
import {
    Plus,
    ChevronDown,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Calendar,
    Filter,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Types ---
type Priority = "High" | "Medium" | "Low" | "All";

type Lead = {
    id: string;
    company: string;
    contact: string;
    number: string;
    email: string;
    priority: Exclude<Priority, "All">;
};

const INITIAL_LEADS: Lead[] = [
    { id: "L001", company: "Rajesh Electronics", contact: "Rakesh Patil", number: "9869226825", email: "rajesh@electro.com", priority: "High" },
    { id: "L002", company: "Modern Appliances", contact: "Rohit Sharma", number: "9869226825", email: "modern@appl.com", priority: "Medium" },
    { id: "L003", company: "Home Comfort Pvt Ltd", contact: "Lokesh Pathe", number: "9869226825", email: "homecomfort@mail.com", priority: "Low" },
    { id: "L004", company: "City Electronics", contact: "Rakshit Shatty", number: "9869226825", email: "city@electronics.com", priority: "High" },
    { id: "L005", company: "Metro Dealers", contact: "Rhaul Deapande", number: "9869226825", email: "metro@dealers.com", priority: "Medium" },
    { id: "L006", company: "Alpha Tech", contact: "Suresh Raina", number: "9123456789", email: "alpha@tech.com", priority: "Low" },
    { id: "L007", company: "Beta Systems", contact: "MS Dhoni", number: "9988776655", email: "beta@systems.com", priority: "High" },
    { id: "L008", company: "Gamma Corp", contact: "Virat Kohli", number: "9443322110", email: "gamma@corp.com", priority: "Medium" },
];

const LeadList: React.FC = () => {
    const navigate = useNavigate();
    
    // --- State ---
    const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<string>("Monthly");
    const [priorityFilter, setPriorityFilter] = useState<Priority>("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- Logic ---
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchesSearch = Object.values(lead).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            );
            const matchesPriority = priorityFilter === "All" || lead.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });
    }, [leads, searchQuery, priorityFilter]);

    // Pagination Math
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const paginatedLeads = filteredLeads.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedLeads.length) setSelectedIds([]);
        else setSelectedIds(paginatedLeads.map(l => l.id));
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDelete = () => {
        if (window.confirm(`Delete ${selectedIds.length} leads?`)) {
            setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
            setSelectedIds([]);
            setCurrentPage(1);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage and track your customer pipeline</p>
                    </div>
                    <button
                        onClick={() => navigate("/sales/new-lead")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#005d52] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-teal-900/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={18} strokeWidth={3} /> New Lead
                    </button>
                </div>

                {/* Tabs & Date */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-wrap gap-2 p-1 bg-white/60 rounded-2xl border border-white shadow-sm overflow-x-auto">
                        {["Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === tab ? "bg-[#d1e9e7] text-[#005d52]" : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-[#005d52] text-white px-4 py-2 rounded-full text-[11px] font-bold self-start">
                        <Calendar size={13} /> Mar 17 – Mar 23, 2026
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="p-6 flex flex-col xl:flex-row justify-between items-center gap-4 border-b border-gray-50">
                        <div className="relative w-full xl:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search by company or contact..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-11 pr-4 py-2.5 bg-[#f4f7f6] border-none rounded-full focus:ring-2 focus:ring-[#005d52]/20 text-sm outline-none"
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 w-full xl:w-auto">
                            {/* Priority Filter Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                                        priorityFilter !== "All" ? "border-[#005d52] bg-[#d1e9e7] text-[#005d52]" : "border-gray-100 text-gray-500 bg-white"
                                    }`}
                                >
                                    <Filter size={14} /> Priority: {priorityFilter} <ChevronDown size={14} />
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute top-full mt-2 left-0 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2">
                                        {(["All", "High", "Medium", "Low"] as Priority[]).map(p => (
                                            <button 
                                                key={p}
                                                onClick={() => { setPriorityFilter(p); setIsFilterOpen(false); setCurrentPage(1); }}
                                                className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-[#f4f7f6] rounded-xl transition-colors"
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleDelete}
                                disabled={selectedIds.length === 0}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                                    selectedIds.length > 0 ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" : "bg-gray-50 text-gray-300 border border-transparent cursor-not-allowed"
                                }`}
                            >
                                <Trash2 size={14} /> Delete Selected ({selectedIds.length})
                            </button>

                            {priorityFilter !== "All" && (
                                <button onClick={() => setPriorityFilter("All")} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/40 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="p-5 w-12"><input type="checkbox" className="accent-[#005d52] cursor-pointer" checked={selectedIds.length === paginatedLeads.length && paginatedLeads.length > 0} onChange={toggleSelectAll} /></th>
                                    <th className="p-5">Lead ID</th>
                                    <th className="p-5">Company</th>
                                    <th className="p-5">Contact</th>
                                    <th className="p-5">Priority</th>
                                    <th className="p-5">Email</th>
                                    <th className="p-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedLeads.length > 0 ? (
                                    paginatedLeads.map((lead) => (
                                        <tr key={lead.id} className={`hover:bg-[#f4f7f6]/50 transition-colors ${selectedIds.includes(lead.id) ? 'bg-[#d1e9e7]/10' : ''}`}>
                                            <td className="p-5"><input type="checkbox" className="accent-[#005d52] cursor-pointer" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelectOne(lead.id)} /></td>
                                            <td className="p-5 text-sm font-bold text-[#005d52]">{lead.id}</td>
                                            <td className="p-5 text-sm font-semibold text-gray-700">{lead.company}</td>
                                            <td className="p-5 text-sm text-gray-500">{lead.contact}</td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    lead.priority === 'High' ? 'bg-red-50 text-red-600' : lead.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                    {lead.priority}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm text-gray-400 underline underline-offset-4 hover:text-[#005d52] cursor-pointer transition-colors">{lead.email}</td>
                                            <td className="p-5">
                                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><ChevronsUpDown size={14}/></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center text-gray-300 font-medium italic">No leads found matching your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-800">{paginatedLeads.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLeads.length)}</span> out of <span className="text-gray-800">{filteredLeads.length}</span> results
                        </p>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#005d52] disabled:opacity-30 transition-all uppercase"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                                            currentPage === i + 1 ? "bg-[#005d52] text-white shadow-lg shadow-teal-900/20" : "text-gray-400 hover:bg-gray-100"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#005d52] disabled:opacity-30 transition-all uppercase"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadList;