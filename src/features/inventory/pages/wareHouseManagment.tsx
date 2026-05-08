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
  Filter,
  Package,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/store/hook";
import type { RootState } from "../../../app/store/store";
import { useAppDispatch } from "../../common/ReduxMainHooks";
import { deleteAllocation, getAllAllocations } from "../ModuleStateFiles/WarehouseSlice";

// --- Types (Identical to LeadList) ---
type TimeTab =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly"
  | "All Time"
  | "Custom";

// interface StorageRecord {
//   id: number;
//   receipt_id: string;
//   material_name: string;
//   material_code: string;
//   batch_number: string;
//   warehouse_name: string;
//   rack_number: string;
//   storage_area: string;
//   quantity: number;
//   unit: string;
//   created_at: string;
// }

const WarehouseManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // --- States (Identical logic to LeadList) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
  const [batchFilter, setBatchFilter] = useState<string>("All");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [openBatchDropdown, setOpenBatchDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const batchRef = useRef<HTMLDivElement>(null);

  // --- Mock Data ---
  const { allocations: storageRecords } = useAppSelector((state: RootState) => state.inventoryWarehouse);

  // --- Handlers & Helpers (Mirroring LeadList) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
      if (batchRef.current && !batchRef.current.contains(event.target as Node)) setOpenBatchDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.title = "Manufacturing ERP - Warehouse Management";
    dispatch(getAllAllocations());
  }, []);

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
    if (!customRange.start || !customRange.end) return;
    setActiveTab("Custom");
    setIsCalendarOpen(false);
    setCurrentPage(1);
  };

  const getFilterDisplayText = () => {
    if (activeTab === "Custom" && customRange.start && customRange.end) {
      return `${customRange.start} to ${customRange.end}`;
    }
    return activeTab;
  };

  // --- Filtering Logic (Mirroring LeadList Memo) ---
  const filteredAndSorted = useMemo(() => {
    const filtered = storageRecords.filter((rec) => {
      const matchesSearch =
        rec.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.batch_number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBatch = batchFilter === "All" || rec.batch_number === batchFilter;

      return matchesSearch && matchesBatch;
    });

    return [...filtered].sort((a, b) => (b.id as number) - (a.id as number));
  }, [storageRecords, searchQuery, batchFilter, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* --- Header Section (Mirroring LeadList) --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            {/* <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <button className="hover:text-[#F59E0B] transition-colors font-medium">Inventory</button>
                <ChevronRight size={14} />
                <span className="text-gray-800 font-bold">Warehouse</span>
            </div> */}
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Warehouse Storage</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Physical stock location & batch mapping</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Time Filter Dropdown */}
            <section className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700 h-full"
              >
                <Filter size={16} className="text-[#F59E0B]" />
                <span>{getFilterDisplayText()}</span>
                <ChevronDown size={14} className={isDropdownOpen ? "rotate-180" : ""} />
              </button>

              {isDropdownOpen && !isCalendarOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-40">
                  {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleFilterChange(tab as TimeTab)}
                      className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${activeTab === tab ? "text-[#F59E0B] font-bold bg-[#f3f4e6]/50" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tab}
                    </button>
                  ))}
                  <button onClick={() => handleFilterChange("Custom")} className="w-full text-left px-4 py-2.5 text-[13px] text-slate-600 hover:bg-slate-50">Custom</button>
                </div>
              )}

              {isCalendarOpen && (
                <div ref={calendarRef} className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72">
                  <div className="space-y-3">
                    <input type="date" value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#F59E0B]/20" />
                    <input type="date" value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#F59E0B]/20" />
                    <button onClick={handleCustomApply} className="w-full bg-[#F59E0B] text-white py-2 rounded-lg text-sm font-bold">Apply Range</button>
                  </div>
                </div>
              )}
            </section>

            <button
              onClick={() => navigate("/inventory/warehouse/add-material")}
              className="group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/5 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Allocate Storage</span>
            </button>
          </div>
        </header>

        {/* --- Main Table Container (Mirroring LeadList) --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search by SKU, Batch, Material..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
              {/* Batch Filter (Mirroring Status/Priority dropdown style) */}
              <div className="relative min-w-40" ref={batchRef}>
                <button
                  onClick={() => setOpenBatchDropdown(!openBatchDropdown)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-[13px] font-bold transition-all ${batchFilter !== "All" ? "bg-[#f3f4e6] border-amber-400 text-[#F59E0B]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  <span className="truncate">{batchFilter === "All" ? "Filter by Batch" : batchFilter}</span>
                  <ChevronDown size={14} className={openBatchDropdown ? "rotate-180" : ""} />
                </button>
                {openBatchDropdown && (
                  <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2">
                    <button onClick={() => { setBatchFilter("All"); setOpenBatchDropdown(false); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${batchFilter === "All" ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}>All Batches</button>
                    {Array.from(new Set(storageRecords.map(r => r.batch_number))).map(b => (
                      <button key={b} onClick={() => { setBatchFilter(b); setOpenBatchDropdown(false); }} className={`w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${batchFilter === b ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}>{b}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Batch ID</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Allocated AT</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Material details</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Location</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Stock</th>
                  <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((rec) => (
                  <tr key={rec.id} className="group hover:bg-[#f3f4e6]/20 transition-colors">
                    <td className="px-4 py-4 text-[13px] text-slate-800 text-center font-mono font-bold">{rec.batch_number}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-800 text-center font-medium whitespace-nowrap">{formatDate(rec.allocated_at)}</td>
                    <td className="px-4 py-4 text-center">
                      <Link to={"/inventory/warehouse/view-storage/" + rec.id}>
                        <div className="flex items-center justify-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-xl text-[#F59E0B] group-hover:bg-white transition shadow-sm"><Package size={16} /></div>
                          <div className="text-left">
                            <p className="font-extrabold text-slate-800 text-[13px] leading-tight">{rec.material_name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{rec.material_code}</p>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[13px] font-bold text-slate-700 flex items-center gap-1"><MapPin size={14} className="text-[#F59E0B]" /> {rec.warehouse_name}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Rack: {rec.rack_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="font-black text-slate-800 text-[13px]">{rec.quantity.toLocaleString()}</p>
                      <p className="text-[10px] text-[#F59E0B] font-black uppercase tracking-tighter">{rec.measure_unit}</p>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-center">
                        <div className="relative group/tooltip">
                          <button
                            onClick={() => navigate("/inventory/warehouse/view-storage/" + rec.id)}
                            title="View" className="p-2 hover:bg-white text-slate-800 hover:text-[#F59E0B] rounded-xl transition-all"><Eye size={16} /></button>
                        </div>
                        <div className="relative group/tooltip">
                          <button
                            onClick={() => navigate("/inventory/warehouse/edit-material/" + rec.id)}
                            title="Edit" className="p-2 hover:bg-white text-slate-800 hover:text-blue-600 rounded-xl transition-all"><FileEdit size={16} /></button>
                        </div>
                        <div className="relative group/tooltip">
                          <button title="Delete"
                            onClick={() => dispatch(deleteAllocation(rec.id))}
                            className="p-2 hover:bg-white text-slate-800 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- Pagination Footer (Exact Match) --- */}
          <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              Showing <span className="text-slate-900">{startIndex + 1}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredAndSorted.length)}</span> of <span className="text-slate-900">{filteredAndSorted.length}</span> Records
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all">
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-[#F59E0B] text-white shadow-lg scale-105" : "bg-white text-slate-500 border border-slate-200"}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all">
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default WarehouseManagement;