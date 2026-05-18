import { useState, useEffect, useMemo, useRef } from "react";
import {
    Package,
    Search,
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Trash2,
    Eye,
    Edit,
    ChevronDown,
} from "lucide-react";
import {  useNavigate } from "react-router-dom";

// Redux Integration
import {
    getAllReceiptEntries,
    deleteReceiptEntry,
    getReceiptEntry,
} from "../../ModuleStateFiles/MaterialReceiptSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { type RootState } from "../../../../app/store/store";

// Types for Filter
type TimeTab =
    | "Weekly"
    | "Monthly"
    | "Quarterly"
    | "Yearly"
    | "All Time"
    | "Custom";

const MaterialReceiptList = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux State
    const { receipts, loading } = useAppSelector(
        (state: RootState) => state.inventoryMaterialReceipt,
    );

    // --- Filter & UI States ---
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [activeTab, setActiveTab] = useState<TimeTab>("All Time");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [customRange, setCustomRange] = useState({ start: "", end: "" });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Handle Outside Click for Dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            )
                setIsDropdownOpen(false);
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target as Node)
            )
                setIsCalendarOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load data on mount
    useEffect(() => {
        dispatch(getAllReceiptEntries());
        document.title = "Manufacturing ERP - Material Receipts";
    }, [dispatch]);

    // Time Filter Handler
    const handleFilterChange = (value: TimeTab) => {
        if (value === "Custom") {
            setIsCalendarOpen(true);
            setIsDropdownOpen(false);
        } else {
            setActiveTab(value);
            setIsDropdownOpen(false);
            setIsCalendarOpen(false);
            setCustomRange({ start: "", end: "" });
            setCurrentPage(1);
        }
    };

    const getFilterDisplayText = () => {
        if (activeTab === "Custom" && customRange.start && customRange.end) {
            return `${formatDate(customRange.start)} to ${formatDate(customRange.end)}`;
        }
        return activeTab;
    };

    // --- Filtering Logic (Search + Time Filter) ---
    const filteredAndSortedReceipts = useMemo(() => {
        if (!receipts) return [];

        return receipts
            .filter((r: any) => {
                // Search Match
                const matchesSearch =
                    r.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.receipt_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.batch_number.toLowerCase().includes(searchTerm.toLowerCase());

                // Time Filter Match
                if (!matchesSearch) return false;
                if (activeTab === "All Time") return true;

                const recordDate = new Date(r.received_date).getTime();
                const now = new Date().getTime();

                if (activeTab === "Weekly")
                    return recordDate > now - 7 * 24 * 60 * 60 * 1000;
                if (activeTab === "Monthly")
                    return recordDate > now - 30 * 24 * 60 * 60 * 1000;
                if (activeTab === "Quarterly")
                    return recordDate > now - 90 * 24 * 60 * 60 * 1000;
                if (activeTab === "Yearly")
                    return recordDate > now - 365 * 24 * 60 * 60 * 1000;
                if (activeTab === "Custom" && customRange.start && customRange.end) {
                    const start = new Date(customRange.start).getTime();
                    const end = new Date(customRange.end).getTime();
                    return recordDate >= start && recordDate <= end;
                }
                return true;
            })
            .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    }, [receipts, searchTerm, activeTab, customRange]);

    // Pagination Helpers
    const totalPages = Math.ceil(filteredAndSortedReceipts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredAndSortedReceipts.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const handleDelete = (id: number | string) => {
        dispatch(deleteReceiptEntry(id));
    };

    const handleView = (id: number | string) => {
        dispatch(getReceiptEntry(id));
        navigate(`/inventory/material-receipts/view/${id}`);
    };

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
                {/* --- Header Section --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Material Receipts
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium text-uppercase">
                            Tracking inward stock movements and batch allocations
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Time Filter Dropdown (Added as requested) */}
                        <div className="relative h-full" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="outline-none px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium shadow-sm flex items-center gap-2 text-gray-700"
                            >
                                <Filter size={16} className="text-[#F59E0B]" />
                                <span className="whitespace-nowrap">
                                    {getFilterDisplayText()}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={isDropdownOpen ? "rotate-180" : ""}
                                />
                            </button>

                            {isDropdownOpen && !isCalendarOpen && (
                                <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 min-w-44 overflow-hidden">
                                    {["All Time", "Weekly", "Monthly", "Quarterly", "Yearly"].map(
                                        (tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => handleFilterChange(tab as TimeTab)}
                                                className={`outline-none w-full text-left px-4 py-2 text-[13px] ${activeTab === tab ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                                            >
                                                {tab}
                                            </button>
                                        ),
                                    )}
                                    <button
                                        onClick={() => handleFilterChange("Custom")}
                                        className={`outline-none w-full text-left px-4 py-2 text-[13px] ${activeTab === "Custom" ? "text-amber-500 font-bold bg-orange-50/50" : "text-slate-600 hover:bg-slate-50"}`}
                                    >
                                        Custom
                                    </button>{" "}
                                </div>
                            )}

                            {isCalendarOpen && (
                                <div
                                    ref={calendarRef}
                                    className="absolute right-0 mt-3 bg-white p-6 rounded-2xl shadow-xl border z-50 w-72 animate-in fade-in zoom-in-95"
                                >
                                    <div className="space-y-3">
                                        <input
                                            type="date"
                                            value={customRange.start}
                                            onChange={(e) =>
                                                setCustomRange({
                                                    ...customRange,
                                                    start: e.target.value,
                                                })
                                            }
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none"
                                        />

                                        <input
                                            type="date"
                                            value={customRange.end}
                                            min={customRange.start}
                                            onChange={(e) =>
                                                setCustomRange({
                                                    ...customRange,
                                                    end: e.target.value,
                                                })
                                            }
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none"
                                        />

                                        <button
                                            onClick={() => {
                                                setIsCalendarOpen(false);
                                                setActiveTab("Custom");
                                                setCurrentPage(1);
                                            }}
                                            className="w-full bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#f67317]"
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                navigate("/inventory/material-receipts/new-material-receipt");
                                document.title = "Manufacturing ERP - New Material Receipt";
                            }}
                            className="outline-none group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-4 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-amber-500/5 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={18} />
                            <span>New Receipt Entry</span>
                        </button>
                    </div>
                </header>

                {/* --- Main Data Container --- */}
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
                                placeholder="Search by SKU, Batch, or Receipt ID..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none font-bold transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-4 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">
                                        ID
                                    </th>
                                    <th className="px-4 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">
                                        Received Date
                                    </th>
                                    <th className="px-4 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">
                                        Material Details
                                    </th>
                                    <th className="px-4 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">
                                        Batch / Supplier
                                    </th>
                                    <th className="px-4 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">
                                        Units
                                    </th>
                                    <th className="px-4 py-5 text-[11px] text-slate-800 uppercase font-black tracking-widest border-b border-slate-100 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs"
                                        >
                                            Loading Inventory Logs...
                                        </td>
                                    </tr>
                                ) : paginatedData.length > 0 ? (
                                    paginatedData.map((item: any) => (
                                        <tr
                                            key={item.id}
                                            className="group hover:bg-[#f3f4e6]/20 transition-colors"
                                        >
                                            <td className="px-4 py-6 text-[13px] text-slate-800 text-center font-mono font-bold">
                                                {item.receipt_id}
                                            </td>
                                            <td className="px-4 py-6 text-[13px] text-slate-800 whitespace-nowrap text-center font-bold">
                                                {formatDate(item.received_date)}
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-slate-100 rounded-xl text-[#F59E0B] group-hover:bg-white transition shadow-sm">
                                                            <Package size={16} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-extrabold text-slate-800 text-[13px] leading-tight uppercase">
                                                                {item.material_name.slice(0, 18)}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5">
                                                                {item.material_code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-slate-700">
                                                        {item.batch_number}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">
                                                        {item.supplier_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 text-center">
                                                <p className="font-black text-slate-800 text-[13px]">
                                                    {item.quantity_received.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-[#F59E0B] font-black uppercase tracking-tighter">
                                                    {item.measure_unit}
                                                </p>
                                            </td>
                                            <td className="px-2 py-6">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleView(item.id)}
                                                        className="p-2 text-slate-400 hover:text-[#F59E0B] hover:bg-white rounded-xl transition-all"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/inventory/material-receipts/edit/${item.id}`,
                                                            )
                                                        }
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="text-center">
                                        <td
                                            colSpan={7}
                                            className="py-32 flex flex-col items-center justify-center text-center"
                                        >
                                            <div className="p-8 bg-slate-50 rounded-full mb-4 mx-auto">
                                                <Package className="text-slate-200" size={48} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                                No Logs Found
                                            </h3>
                                            <p className="text-xs text-slate-400 font-bold mt-1">
                                                Try adjusting your filters or search term
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                            Showing{" "}
                            <span className="text-slate-900">
                                {filteredAndSortedReceipts.length > 0 ? startIndex + 1 : 0}
                            </span>{" "}
                            to{" "}
                            <span className="text-slate-900">
                                {Math.min(
                                    startIndex + itemsPerPage,
                                    filteredAndSortedReceipts.length,
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="text-slate-900">
                                {filteredAndSortedReceipts.length}
                            </span>{" "}
                            Receipts
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>

                            <div className="flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`min-w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                            ? "bg-[#F59E0B] text-white shadow-lg shadow-orange-100 scale-105"
                                            : "bg-white text-slate-500 border border-slate-200 hover:border-amber-200"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronRightIcon size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default MaterialReceiptList;
