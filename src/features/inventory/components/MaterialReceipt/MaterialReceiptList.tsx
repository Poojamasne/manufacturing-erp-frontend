import { useState, useEffect, useMemo } from "react";
import {
    Package, Search, Filter,
    Plus, ChevronLeft, ChevronRight as ChevronRightIcon,
    Trash2, Eye, MapPin,
    Edit,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Redux Integration
import {
    getAllReceiptEntries,
    deleteReceiptEntry,
    getReceiptEntry
} from "../../ModuleStateFiles/MaterialReceiptSlice";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { type RootState } from "../../../../app/store/store";

const MaterialReceiptList = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux State
    const { receipts, loading } = useAppSelector(
        (state: RootState) => state.inventoryMaterialReceipt
    );

    // Filter & Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Load data on mount
    useEffect(() => {
        dispatch(getAllReceiptEntries());
        document.title = "Manufacturing ERP - Material Receipts";
    }, [dispatch]);

    // Filtering logic (Matching Lead Memo pattern)
    const filteredAndSortedReceipts = useMemo(() => {
        if (!receipts) return [];
        const filtered = receipts.filter((r: any) =>
            r.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.receipt_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Sort newest first by ID (as per LeadList logic)
        return [...filtered].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    }, [receipts, searchTerm]);

    // Pagination Helpers
    const totalPages = Math.ceil(filteredAndSortedReceipts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredAndSortedReceipts.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = (id: number | string) => {
        dispatch(deleteReceiptEntry(id));
    };

    const handleView = (id: number | string) => {
        dispatch(getReceiptEntry(id));
        navigate(`/inventory/material-receipts/view/${id}`);
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* --- Header Section (Matching Lead Theme) --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        {/* <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <button 
                                onClick={() => navigate("/inventory")}
                                className="hover:text-[#F59E0B] transition-colors font-medium"
                            >
                                Inventory
                            </button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-bold">Material Receipts</span>
                        </div> */}
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Material Receipts</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Tracking inward stock movements and batch allocations</p>
                    </div>

                    <button
                        onClick={() => {
                            navigate("/inventory/material-receipts/new-material-receipt");
                            document.title = "Manufacturing ERP - New Material Receipt";
                        }}
                        className="outline-none group flex items-center gap-1 bg-[#F59E0B] hover:bg-[#f67317] text-white px-2.5 py-2 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/5 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        <span>New Receipt Entry</span>
                    </button>
                </header>

                {/* --- Main Data Container --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-50">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                placeholder="Search by SKU, Batch, or Receipt ID..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/5 text-sm outline-none transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 text-[13px] font-bold flex items-center gap-2 transition-all">
                                <Filter size={16} className="text-[#F59E0B]" />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">ID</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Created</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Material Details</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Batch / Supplier</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Units</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Location</th>
                                    <th className="px-4 py-4 text-[13px] text-slate-800 uppercase tracking-widest border-b border-slate-100 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Inventory Logs...</td>
                                    </tr>
                                ) : paginatedData.length > 0 ? (
                                    paginatedData.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-[#f3f4e6]/20 transition-colors">
                                            <td className="px-4 py-4 text-[13px] text-slate-800 text-center font-mono font-bold">
                                                {item.receipt_id}
                                            </td>
                                            <td className="px-4 py-4 text-[13px] text-slate-800 whitespace-nowrap text-center font-medium">
                                                {item.received_date}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                   <Link to={`/inventory/material-receipts/view/${item.id}`} className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-xl text-[#F59E0B] group-hover:bg-white transition shadow-sm">
                                                        <Package size={16} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-extrabold text-slate-800 text-[13px] leading-tight">{item.material_name.slice(0, 12)}...</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.material_code}</p>
                                                    </div>
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-slate-700">{item.batch_number}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{item.supplier_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <p className="font-black text-slate-800 text-[13px]">{item.quantity_received.toLocaleString()}</p>
                                                <p className="text-[10px] text-[#F59E0B] font-black uppercase tracking-tighter">{item.measure_unit}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-bold">
                                                    <MapPin size={14} className="text-[#F59E0B]" />
                                                    {item.warehouse_location}
                                                </div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="flex justify-center gap-1">
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            title="View"
                                                            onClick={() => handleView(item.id)}
                                                            className="outline-none p-1 hover:bg-white text-slate-800 hover:text-[#F59E0B] rounded-xl transition-all"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            title="Edit"
                                                            onClick={() => navigate(`/inventory/material-receipts/edit/${item.id}`)}
                                                            className="outline-none p-1 hover:bg-white text-slate-800 hover:text-[#F59E0B] rounded-xl transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Delete"
                                                            className="outline-none p-1 hover:bg-white text-slate-800 hover:text-rose-600 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="text-center">
                                        <td colSpan={7} className="py-32 flex flex-col items-center justify-center text-center">
                                            <div className="p-6 bg-slate-50 rounded-full mb-4 mx-auto">
                                                <Package className="text-slate-200" size={40} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">No Logs Found</h3>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer (Identical to Lead Theme) */}
                    <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
                            Showing{" "}
                            <span className="text-slate-900">
                                {filteredAndSortedReceipts.length > 0 ? startIndex + 1 : 0}
                            </span>{" "}
                            to{" "}
                            <span className="text-slate-900">
                                {Math.min(startIndex + itemsPerPage, filteredAndSortedReceipts.length)}
                            </span>{" "}
                            of{" "}
                            <span className="text-slate-900">
                                {filteredAndSortedReceipts.length}
                            </span>{" "}
                            Receipts
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>

                            <div className="flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`min-w-10 h-10 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1
                                            ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-500/5 scale-105"
                                            : "bg-white text-slate-500 border border-slate-200"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#F59E0B] disabled:opacity-30 transition-all"
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