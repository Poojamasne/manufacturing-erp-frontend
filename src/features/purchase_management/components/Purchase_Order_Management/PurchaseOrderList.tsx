import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronDown,
    Search,
    ChevronLeft,
    ChevronRight,
    Filter,
    Edit,
    Eye,
    Plus,
    Calendar,
    Trash2,
    SearchAlert,
    Download,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
    getAllPurchaseOrders,
    deletePurchaseOrderEntry,
    deletePurchaseOrderEntries,
    exportPOToPDF,
} from "../../ModuleStateFiles/PurchaseOrderSlice";
import type { RootState } from "../../../../app/store/store";

type TimeFilter =
    | "Weekly"
    | "Monthly"
    | "Quarterly"
    | "Yearly"
    | "All Time"
    | "Custom";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        Draft: "text-slate-500 bg-slate-50 border-slate-100",
        "Pending Approval": "text-amber-600 bg-amber-50 border-amber-100 font-bold",
        Approved: "text-emerald-600 bg-emerald-50 border-emerald-100 font-black",
        "Sent to Vendor": "text-blue-600 bg-blue-50 border-blue-100",
        Rejected: "text-rose-600 bg-rose-50 border-rose-100",
        Completed: "text-purple-600 bg-purple-50 border-purple-100",
    };
    return (
        <span
            className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${styles[status] || "text-slate-500 bg-slate-50"}`}
        >
            {status}
        </span>
    );
};

const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const PurchaseOrderList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const dropdownRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    const { pos } = useAppSelector((state: RootState) => state.purchaseOrders);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("All Time");
    const [customRange, setCustomRange] = useState({ start: "", end: "" });

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // UI States
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    useEffect(() => {
        dispatch(getAllPurchaseOrders());
    }, [dispatch]);

    // Handle Outside Click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            )
                setIsTimeDropdownOpen(false);
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target as Node)
            )
                setIsCalendarOpen(false);
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target as Node)
            )
                setActiveDropdown(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Complex Filter Logic
    const filteredPOs = useMemo(() => {
        let filtered = [...pos];

        // Search Filter
        if (searchQuery) {
            filtered = filtered.filter(
                (p) =>
                    p.po_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        // Status Filter
        if (statusFilter !== "All") {
            filtered = filtered.filter((p) => p.status === statusFilter);
        }

        // Time Filtering logic
        filtered = filtered.filter((p) => {
            const date = new Date(p.created_at);
            const now = new Date();
            if (timeFilter === "Weekly")
                return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
            if (timeFilter === "Monthly")
                return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                );
            if (timeFilter === "Quarterly")
                return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 90;
            if (timeFilter === "Yearly")
                return date.getFullYear() === now.getFullYear();
            if (timeFilter === "Custom" && customRange.start && customRange.end) {
                const start = new Date(customRange.start);
                const end = new Date(customRange.end);
                return date >= start && date <= end;
            }
            return true;
        });

        return filtered.sort(
            (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }, [pos, searchQuery, statusFilter, timeFilter, customRange]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
    const paginatedData = filteredPOs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedData.length && paginatedData.length > 0)
            setSelectedIds([]);
        else setSelectedIds(paginatedData.map((o) => o.id));
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Purchase Orders
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            Execute procurement contracts and manage approvals
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Time Filter Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700 active:scale-95 transition-all"
                            >
                                <Filter size={16} className="text-[#F59E0B]" />
                                <span>
                                    {timeFilter === "Custom" && customRange.start
                                        ? `${formatDate(customRange.start)}...`
                                        : timeFilter}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={isTimeDropdownOpen ? "rotate-180" : ""}
                                />
                            </button>

                            {isTimeDropdownOpen && (
                                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-30">
                                    {[
                                        "All Time",
                                        "Weekly",
                                        "Monthly",
                                        "Quarterly",
                                        "Yearly",
                                        "Custom",
                                    ].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                if (tab === "Custom") setIsCalendarOpen(true);
                                                else setTimeFilter(tab as TimeFilter);
                                                setIsTimeDropdownOpen(false);
                                            }}
                                            className={`outline-none w-full text-left px-4 py-2 text-[13px] ${timeFilter === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isCalendarOpen && (
                                <div
                                    ref={calendarRef}
                                    className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72"
                                >
                                    <div className="space-y-3">
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20"
                                            onChange={(e) =>
                                                setCustomRange({
                                                    ...customRange,
                                                    start: e.target.value,
                                                })
                                            }
                                        />
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20"
                                            onChange={(e) =>
                                                setCustomRange({ ...customRange, end: e.target.value })
                                            }
                                        />
                                        <button
                                            onClick={() => {
                                                setTimeFilter("Custom");
                                                setIsCalendarOpen(false);
                                            }}
                                            className="outline-none w-full bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() =>
                                navigate("/purchase/purchase-orders/create-purchase-order")
                            }
                            className="outline-none group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Create PO</span>
                        </button>
                    </div>
                </header>

                {/* Table Container */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
                        <div className="relative w-full lg:w-96">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search PO ID or Supplier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all"
                            />
                        </div>

                        <div className="flex gap-3" ref={filterRef}>
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setActiveDropdown(
                                            activeDropdown === "status" ? null : "status",
                                        )
                                    }
                                    className={`outline-none px-4 py-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 transition-all ${statusFilter !== "All" ? "bg-orange-50 border-orange-200 text-amber-500" : "bg-white border-slate-200 text-slate-600"}`}
                                >
                                    {statusFilter === "All" ? "Status" : statusFilter}
                                    <ChevronDown
                                        size={14}
                                        className={activeDropdown === "status" ? "rotate-180" : ""}
                                    />
                                </button>

                                {activeDropdown === "status" && (
                                    <div className="absolute right-0 mt-2 w-24 bg-white rounded-2xl shadow-2xl z-50 py-2 border border-slate-50">
                                        {[
                                            "All",
                                            "Pending Approval",
                                            "Approved",
                                            "Sent to Vendor",
                                            "Completed",
                                        ].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    setStatusFilter(opt);
                                                    setActiveDropdown(null);
                                                }}
                                                className={`outline-none w-full text-left px-4 py-2 text-[13px] hover:bg-slate-50 ${statusFilter === opt ? "bg-amber-50 text-[#F59E0B] font-bold" : ""}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                disabled={selectedIds.length === 0}
                                onClick={() =>
                                    dispatch(deletePurchaseOrderEntries(selectedIds))
                                }
                                className={`outline-none p-3 rounded-xl transition-all ${selectedIds.length === 0 ? "bg-gray-100 text-gray-400" : "bg-rose-600 text-white hover:bg-rose-700 shadow-lg"}`}
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
                                    <th className="w-12 p-5 text-center border-b border-slate-100">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                                            checked={
                                                selectedIds.length === paginatedData.length &&
                                                paginatedData.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                                        PO ID
                                    </th>
                                    <th className="px-6 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 font-bold">
                                        Supplier / References
                                    </th>
                                    <th className="px-6 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                                        Total (Inc. Tax)
                                    </th>
                                    <th className="px-6 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                                        Delivery By
                                    </th>
                                    <th className="px-4 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-[11px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center font-bold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((po) => (
                                        <tr
                                            key={po.id}
                                            className="group hover:bg-orange-50/20 transition-all"
                                        >
                                            <td className="p-5 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                                                    checked={selectedIds.includes(po.id)}
                                                    onChange={() =>
                                                        setSelectedIds((prev) =>
                                                            prev.includes(po.id)
                                                                ? prev.filter((id) => id !== po.id)
                                                                : [...prev, po.id],
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-[13px] font-mono font-black text-slate-800 text-center">
                                                {po.po_id}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-black text-slate-800 leading-tight group-hover:text-amber-600 transition-colors">
                                                        {po.vendor_name}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] text-slate-400 font-bold border border-slate-200 px-1.5 rounded bg-white uppercase">
                                                            RFQ: {po.rfq_ref}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-bold border border-slate-200 px-1.5 rounded bg-white uppercase">
                                                            PR: {po.pr_ref}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center font-black text-slate-800 text-sm decoration-2">
                                                ₹{po.total_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5 text-center font-bold text-slate-600">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Calendar size={12} className="text-slate-300" />
                                                    <span className="text-[12px]">
                                                        {formatDate(po.delivery_date)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <StatusBadge status={po.status} />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                "/purchase/purchase-orders/view-purchase-order/" +
                                                                po.id,
                                                            )
                                                        }
                                                        className="outline-none p-1.5 text-slate-400 hover:text-[#F59E0B] transition-all active:scale-90"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                "/purchase/purchase-orders/edit-purchase-order/" +
                                                                po.id,
                                                            )
                                                        }
                                                        className="outline-none p-1.5 text-slate-400 hover:text-green-500 transition-all active:scale-90"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            dispatch(deletePurchaseOrderEntry(po.id))
                                                        }
                                                        className="outline-none p-1.5 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            dispatch(exportPOToPDF(po.id))
                                                        }
                                                        className="outline-none p-1.5 text-slate-400 hover:text-indigo-500 transition-all active:scale-90"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <SearchAlert
                                                size={48}
                                                className="mx-auto mb-4 text-amber-600 opacity-20"
                                            />
                                            <p className="text-slate-400 font-bold tracking-tight">
                                                No Purchase Orders Found
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 0 && (
                        <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                                Showing{" "}
                                {Math.min(currentPage * itemsPerPage, filteredPOs.length)} of{" "}
                                {filteredPOs.length} Total Contracts
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="outline-none p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30 transition-all active:scale-95"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`outline-none min-w-10 h-10 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${currentPage === i + 1 ? "bg-[#F59E0B] text-white" : "bg-white text-slate-500 border border-slate-200"}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                    }
                                    disabled={currentPage === totalPages}
                                    className="outline-none p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 hover:border-amber-500 disabled:opacity-30 transition-all active:scale-95"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </footer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderList;
