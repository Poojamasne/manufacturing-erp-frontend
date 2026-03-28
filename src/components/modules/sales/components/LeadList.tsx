import React, { useState, useMemo } from "react";
import {
    Plus,
    ChevronDown,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Lead = {
    id: string;
    company: string;
    contact: string;
    number: string;
    email: string;
};

const INITIAL_LEADS: Lead[] = [
    { id: "L001", company: "Rajesh Electronics", contact: "Rakesh Patil", number: "9869226825", email: "rajesh@electro.com" },
    { id: "L002", company: "Modern Appliances", contact: "Rohit Sharma", number: "9869226825", email: "modern@appl.com" },
    { id: "L003", company: "Home Comfort Pvt Ltd", contact: "Lokesh Pathe", number: "9869226825", email: "homecomfort@mail.com" },
    { id: "L004", company: "City Electronics", contact: "Rakshit Shatty", number: "9869226825", email: "city@electronics.com" },
    { id: "L005", company: "Metro Dealers", contact: "Rhaul Deapande", number: "9869226825", email: "metro@dealers.com" },
];

const LeadList: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<string>("Weekly");
    const navigate = useNavigate();

    const filteredLeads = useMemo<Lead[]>(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return leads;
        return leads.filter((lead) =>
            Object.values(lead).some((val) =>
                String(val).toLowerCase().includes(q)
            )
        );
    }, [leads, searchQuery]);

    // Selection Logic
    const toggleSelectAll = (): void => {
        if (selectedIds.length === filteredLeads.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredLeads.map((l) => l.id));
        }
    };

    const toggleSelectOne = (id: string): void => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Action Logic
    const handleDelete = (): void => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Delete ${selectedIds.length} selected leads?`)) {
            setLeads((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
            setSelectedIds([]);
        }
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Lead</h1>
                    <p className="text-slate-500 mt-1">
                        Manage and track customer leads for electrical products, from inquiry to conversion.
                    </p>
                </div>
                <button
                    onClick={
                        () => navigate("/sales/new-lead")
                    }
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
                    <Plus size={20} />
                    New Lead
                </button>
            </div>

            {/* Time Range Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
                <div className="flex gap-2">
                    {["Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg border text-sm font-medium transition-all ${activeTab === tab
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="text-sm font-medium text-gray-600">
                    Week Of 17–23 Mar 2026
                </div>
            </div>

            {/* Table Container Wrapper */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                {/* Table Controls */}
                <div className="p-4 md:p-6 flex flex-col lg:flex-row justify-between gap-4 bg-white border-b border-gray-100">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Priorities <ChevronDown size={16} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Filter <ChevronDown size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={selectedIds.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${selectedIds.length > 0
                                    ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                </div>

                {/* The Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-black focus:ring-black h-4 w-4 cursor-pointer"
                                        checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                {[
                                    { label: "Lead ID", key: "id" },
                                    { label: "Company name", key: "company" },
                                    { label: "Contact person", key: "contact" },
                                    { label: "Number", key: "number" },
                                    { label: "Email ID", key: "email" }
                                ].map((col) => (
                                    <th key={col.key} className="p-4 text-sm font-semibold text-gray-600">
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-black">
                                            {col.label}
                                            <ChevronsUpDown size={14} className="text-gray-400" />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className={`hover:bg-gray-50/80 transition-colors ${selectedIds.includes(lead.id) ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-black focus:ring-black h-4 w-4 cursor-pointer"
                                                    checked={selectedIds.includes(lead.id)}
                                                    onChange={() => toggleSelectOne(lead.id)}
                                                />
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-900">{lead.id}</td>
                                        <td className="p-4 text-sm text-gray-600">{lead.company}</td>
                                        <td className="p-4 text-sm text-gray-600">{lead.contact}</td>
                                        <td className="p-4 text-sm text-gray-600">{lead.number}</td>
                                        <td className="p-4 text-sm text-gray-600 underline decoration-gray-300 hover:text-black cursor-pointer">
                                            {lead.email}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-400">
                                        No leads found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 md:p-6 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">1- {filteredLeads.length}</span> Out of <span className="font-semibold text-gray-900">233</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-100 text-blue-700 text-sm font-bold">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 text-sm">2</button>
                            <span className="w-8 h-8 flex items-center justify-center text-gray-400">—</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 text-sm">9</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 text-sm">10</button>
                        </div>
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadList;