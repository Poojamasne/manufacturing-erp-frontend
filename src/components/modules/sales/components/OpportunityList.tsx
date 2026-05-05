import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  MoreHorizontal,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getLeads,
  deleteLead,
  clearErrors,
  editLead,
} from "../ModuleStateFiles/LeadSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import type { RootState } from "../../../../ApplicationState/Store";

// --- Types ---
type TimeTab =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

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
  followup_date: string;
  expected_close_date: string;
}

const OPPORTUNITY_STATUSES = [
  "Qualified",
  "Won",
  "In Progress",
  "Converted",
  "Contacted",
];

const OpportunityList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Redux State
  const { leads, loading } = useAppSelector(
    (state: RootState) => state.SalesLeads,
  ) as { leads: Lead[]; loading: boolean };

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // --- NEW: Update Modal States ---
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLeadForUpdate, _setSelectedLeadForUpdate] = useState<Lead | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    priority: ""
  });
 
  const statusOptions = ["All", ...OPPORTUNITY_STATUSES];
     const filterDropdownRef = useRef<HTMLDivElement>(null);
 
  const fetchLeads = async () => {
    await dispatch(getLeads());
  };

  useEffect(() => {
    fetchLeads();
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Handle outside clicks for Dropdowns and the Modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Calendar/Filter dropdowns
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      // Update Modal outside click
      if (isUpdateModalOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsUpdateModalOpen(false);
      }
            if (
      filterDropdownRef.current &&
      !filterDropdownRef.current.contains(event.target as Node)
    ) {
      setIsStatusOpen(false);
    }

      
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUpdateModalOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab, customRange]);

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
    const formatDateStr = (dateStr: any) => {
      const date = new Date(dateStr);
      return `${date.getDate()} ${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    };
    if (activeTab === "Custom" && customRange.start && customRange.end) {
      return `${formatDateStr(customRange.start)} to ${formatDateStr(customRange.end)}`;
    }
    return activeTab;
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // --- Filtering Logic ---
  const opportunityLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => OPPORTUNITY_STATUSES.includes(lead.status));
  }, [leads]);

  const filteredOpportunities = useMemo(() => {
    if (!opportunityLeads) return [];
    return opportunityLeads.filter((lead) => {
      const matchesSearch =
        lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.lead_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact_person?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      let matchesTime = true;
      const leadDate = new Date(lead.created_at);
      const now = new Date();

      if (activeTab === "Custom") {
        const start = customRange.start ? new Date(customRange.start) : null;
        const end = customRange.end ? new Date(customRange.end) : null;
        if (start) {
          const startOfRange = new Date(start);
          startOfRange.setHours(0, 0, 0, 0);
          matchesTime = matchesTime && leadDate >= startOfRange;
        }
        if (end) {
          const endOfRange = new Date(end);
          endOfRange.setHours(23, 59, 59);
          matchesTime = matchesTime && leadDate <= endOfRange;
        }
      } else if (activeTab !== "All Time") {
        const diffInDays = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24);
        if (activeTab === "Weekly") matchesTime = diffInDays <= 7 && diffInDays >= 0;
        if (activeTab === "Monthly")
          matchesTime = leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
        if (activeTab === "Quarterly")
          matchesTime = Math.floor(leadDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) && leadDate.getFullYear() === now.getFullYear();
        if (activeTab === "Yearly") matchesTime = leadDate.getFullYear() === now.getFullYear();
      }
      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [opportunityLeads, searchQuery, statusFilter, activeTab, customRange]);

  // --- Pagination Helpers ---
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex);

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
      for (let i = start; i <= end; i++) { if (!pages.includes(i)) pages.push(i); }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const goToPage = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedOpportunities.length && paginatedOpportunities.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOpportunities.map((o) => o.id));
    }
  };

  const handleDelete = (id: number) => { dispatch(deleteLead(id)); };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => dispatch(deleteLead(id)));
    setSelectedIds([]);
  };

  const getOpportunityValue = (lead: Lead) => {
    if (lead.products && lead.products.length > 0) {
      return lead.products.reduce((total, product) =>
        total + (product.quantity * (product as any).unit_price || 0), 0);
    }
    return 0;
  };

  // --- NEW: Update Modal Handlers ---
  // const handleOpenUpdateModal = (lead: Lead) => {
  //   setSelectedLeadForUpdate(lead);
  //   setUpdateForm({
  //     status: lead.status,
  //     priority: lead.priority
  //   });
  //   setIsUpdateModalOpen(true);
  // };

  const handleUpdateOpportunity = async () => {
    if (!selectedLeadForUpdate) return;

    const payload = {
      ...selectedLeadForUpdate,
      status: updateForm.status,
      priority: updateForm.priority,

      expected_close_date: selectedLeadForUpdate
        ? new Date(selectedLeadForUpdate.expected_close_date).toISOString().split("T")[0]
        : null,

      followup_date: selectedLeadForUpdate.followup_date
        ? new Date(selectedLeadForUpdate.followup_date).toISOString().split("T")[0]
        : null
    };

    // Calling the updateOpportunity slice
    await dispatch(editLead(selectedLeadForUpdate.id, payload));

    // Close modal and refresh list
    setIsUpdateModalOpen(false);
    dispatch(getLeads());
  };

  // --- Styles ---
  const getStatusStyle = (status: string) => {
    const base = "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ";
    switch (status) {
      case "Won": return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Converted": return base + "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Lost": return base + "bg-rose-50 text-rose-600 border-rose-100";
      case "Qualified": return base + "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "In Progress": return base + "bg-blue-50 text-blue-600 border-blue-100";
      case "Contacted": return base + "bg-cyan-50 text-cyan-600 border-cyan-100";
      default: return base + "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  const getPriorityStyle = (priority: string) => {
    const base = "px-2 py-1 rounded text-[10px] font-black uppercase ";
    switch (priority) {
      case "High": return base + "text-red-600 bg-red-50";
      case "Medium": return base + "text-amber-600 bg-amber-50";
      case "Low": return base + "text-teal-600 bg-[#f3f4e6]";
      default: return base + "text-slate-500 bg-slate-50";
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Opportunities</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Qualified Leads & Sales Pipeline</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 flex items-center gap-2 text-gray-700 transition-all active:scale-95"
              >
                <Filter size={18} className="text-[#F59E0B]" />
                <span>{getFilterDisplayText()}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && !isCalendarOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                  {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleFilterChange(tab as TimeTab)}
                      className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${activeTab === tab ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tab}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFilterChange("Custom")}
                    className={`outline-none w-full text-left px-4 py-2.5 text-[13px] transition-colors ${activeTab === "Custom" ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50" : "text-slate-600 hover:bg-slate-50"}`}
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
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                    />
                    <input
                      type="date"
                      value={customRange.end}
                      min={customRange.start}
                      onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                    />
                    <button
                      onClick={handleCustomApply}
                      className="w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm hover:bg-[#f67317] transition-colors"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search opportunities by company..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
              <div  ref = {filterDropdownRef}className="relative min-w-35">
                <button
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`outline-none w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${statusFilter !== "All" ? "bg-[#f3f4e6] border-amber-400 text-[#F59E0B]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  <span className="truncate">{statusFilter === "All" ? "Status" : statusFilter}</span>
                  <ChevronDown size={14} className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
                </button>
                {isStatusOpen && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setStatusFilter(opt); setIsStatusOpen(false); setCurrentPage(1); }}
                        className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50" : "text-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={selectedIds.length === 0}
                onClick={handleBulkDelete}
                className={`p-3 rounded-xl transition-all ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="w-12 p-5 text-center border-b border-slate-100">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                      checked={paginatedOpportunities.length > 0 && selectedIds.length === paginatedOpportunities.length}
                      onChange={toggleSelectAll}
                    />
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
                    <tr key={lead.id} className="group hover:bg-[#f3f4e6]/20 transition-colors">
                      <td className="p-5 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => setSelectedIds((prev) => prev.includes(lead.id) ? prev.filter((i) => i !== lead.id) : [...prev, lead.id])}
                        />
                      </td>
                      <td className="px-4 py-4 text-[13px] font-medium text-slate-800 text-center">{lead.lead_id}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-600 text-center whitespace-nowrap">{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-4 text-[13px] font-medium text-slate-800 text-center">{lead.company_name}</td>
                      <td className="px-4 py-4 text-[13px] text-slate-600 text-center">
                        <div className="font-medium text-slate-800">{lead.contact_person || "-"}</div>
                        <div className="text-[15px] text-slate-600">{lead.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold ${getValueStyle(opportunityValue)}`}>₹ {opportunityValue.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={getStatusStyle(lead.status)}>{lead.status}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={getPriorityStyle(lead.priority)}>{lead.priority}</span>
                      </td>
                      <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                                                  {/* --- New Update Button ---
                          <button
                            onClick={() => handleOpenUpdateModal(lead)}
                            className="outline-none p-2 bg-amber-50 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white rounded-xl transition-all"
                            title="Update Status"
                          >
                            <RefreshCw size={16} />
                          </button> */}

                        <div className="relative group/tooltip">
                        <button
                          onClick={() =>
                            navigate("/sales/leads/view-lead/" + lead.id)
                          }
                          className="outline-none p-2 hover:bg-white text-slate-800 hover:text-[#F59E0B] rounded-xl transition-all"
                        >
                          <Eye size={16} />
                        </button>
                         <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">     
                            View
                        </span>
                        </div>
                        <div className="relative group/tooltip">
                        <button
                          onClick={() =>
                            navigate("/sales/leads/edit-lead/" + lead.id)
                          }
                          className="outline-none p-2 hover:bg-white text-slate-800 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <FileEdit size={16} />
                        </button>
                                                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">     
                            Edit 
                        </span>

                        </div>
                        <div className="relative group/tooltip">                      
                            <button
                          onClick={() => handleDelete(lead.id)}
                          className="outline-none p-2 hover:bg-white text-slate-800 hover:text-rose-600 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                                                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">     
                            Delete
                        </span>

                        </div>

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
                <p className="text-slate-400 text-sm max-w-xs">No qualified leads available. Opportunities are created when leads are marked as Qualified, Won, or In Progress.</p>
              </div>
            )}
          </div>

          {totalPages > 0 && (
            <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                  Showing <span className="text-slate-900">{filteredOpportunities.length > 0 ? startIndex + 1 : 0}</span> to <span className="text-slate-900">{Math.min(endIndex, filteredOpportunities.length)}</span> of <span className="text-slate-900">{filteredOpportunities.length}</span> Opportunities
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={i} className="px-2 text-slate-300"><MoreHorizontal size={14} /></span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => goToPage(page as number)}
                        className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === page ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-500/5 scale-105" : "bg-white text-slate-500 border border-slate-200"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* --- UPDATE OPPORTUNITY MODAL --- */}
      {isUpdateModalOpen && selectedLeadForUpdate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            {/* Modal Header */}
            <div className="bg-[#f3f4e6]/50 px-8 py-6 flex justify-between items-center border-b border-teal-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Update Opportunity</h3>
                <p className="text-[11px] text-[#F59E0B] font-bold uppercase tracking-[0.2em] mt-1">
                  ID: {selectedLeadForUpdate.lead_id} • {selectedLeadForUpdate.company_name}
                </p>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="outline-none p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              {/* Priority Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Select Priority
                </label>
                <select
                  value={updateForm.priority}
                  onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10 focus:border-[#F59E0B] outline-none transition-all text-sm font-bold text-slate-700"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Update Status
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#F59E0B]/10 focus:border-[#F59E0B] outline-none transition-all text-sm font-bold text-slate-700"
                >
                  <option value="Qualified">Qualified</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Converted">Converted</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 pt-0 flex gap-3">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="outline-none flex-1 px-4 py-2 rounded-xl text-[13px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOpportunity}
                className="outline-none flex-1 px-2.5 py-2 rounded-xl text-[13px] font-bold text-white bg-[#F59E0B] hover:bg-[#d98b06] shadow-sm shadow-amber-200 transition-all active:scale-95 uppercase tracking-widest"
              >
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityList;