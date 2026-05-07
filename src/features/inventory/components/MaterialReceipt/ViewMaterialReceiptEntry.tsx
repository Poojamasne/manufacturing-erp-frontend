import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronRight, Package, Hash, Truck,
    Calendar, MapPin, User, Info, FileText,
    Layers
} from "lucide-react";

// Redux
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import { type RootState } from "../../../../app/store/store";
import { getReceiptEntry } from "../../ModuleStateFiles/MaterialReceiptSlice";

const ViewMaterialReceiptEntry: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Get receipt data from state
    const { receipt } = useAppSelector(
        (state: RootState) => state.inventoryMaterialReceipt
    );

    useEffect(() => {
        if (id) {
            dispatch(getReceiptEntry(id));
        }
    }, [id, dispatch]);

    if (!receipt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
                <div className="text-center">
                    <Info size={48} className="mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">Receipt Not Found</h2>
                    <button onClick={() => navigate(-1)} className="mt-4 text-[#F59E0B] font-bold">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* --- Header & Actions --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <button onClick={() => navigate("/inventory/material-receipts")}
                                className="hover:text-[#F59E0B] transition-colors font-medium">Material Receipts</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-bold">{receipt.receipt_id}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Receipt Details</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Transaction Log for Stock Inward</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* <button
                            onClick={() => window.print()}
                            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 flex items-center justify-center gap-2"
                        >
                            <Printer size={18} /> Print Slip
                        </button> */}
                        {/* <button
                            onClick={() => navigate("/inventory/material-receipts")}
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-800 shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Back to List
                        </button> */}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* --- Left Column: Primary Info --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Section 1: Material & Batch (SRS 3.3.2) */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <SectionTitle icon={<Package size={20} />} title="Material Specification" />
                                <span className="bg-[#f3f4e6] text-[#F59E0B] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                    Verified Entry
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <DetailLabel label="Material Name" />
                                    <p className="text-xl font-black text-slate-800 uppercase">{receipt.material_name}</p>
                                    <p className="text-xs font-bold text-[#F59E0B] tracking-widest mt-1">{receipt.material_code}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <DetailLabel label="Total Quantity Received" />
                                    <p className="text-4xl font-black text-slate-800">
                                        {receipt.quantity_received.toLocaleString()}
                                        <span className="text-lg font-bold text-[#F59E0B] ml-2 uppercase">{receipt.measure_unit}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Procurement & Logistics (SRS 3.3.2) */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <SectionTitle icon={<Truck size={20} />} title="Supply Chain Data" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                                <DataBlock icon={<Hash className="text-blue-500" />} label="Batch Number" value={receipt.batch_number} />
                                <DataBlock icon={<Truck className="text-amber-500" />} label="Supplier" value={receipt.supplier_name} />
                                <DataBlock icon={<Calendar className="text-purple-500" />} label="Date Received" value={receipt.received_date} />
                            </div>
                        </div>

                        {/* Section 3: Internal Notes */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <SectionTitle icon={<FileText size={20} />} title="Additional Remarks" />
                            <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-sm text-slate-600 leading-relaxed font-medium min-h-25">
                                {receipt.notes || "No additional internal notes recorded for this transaction."}
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Storage & Audit (SRS 3.4) --- */}
                    <div className="space-y-6">

                        {/* Storage Allocation Card */}
                        {/* <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-white/10 text-white rounded-xl">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="font-bold text-xl tracking-tight">Warehouse Slot</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-1">Assigned Warehouse</p>
                                    <p className="text-lg font-bold">{receipt.warehouse_location}</p>
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div>
                                    <p className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-1">Rack / Bin ID</p>
                                    <p className="text-lg font-bold">{receipt.rack_number}</p>
                                </div>

                                <div className="mt-8 pt-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Allocated & Secured</span>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Audit Log Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <SectionTitle icon={<User size={20} />} title="Transaction Audit" />
                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Created By</span>
                                    <span className="text-sm font-bold text-slate-800">{receipt.received_by}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">System ID</span>
                                    <span className="text-xs font-mono text-slate-500">#{receipt.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">COMMITTED</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="p-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-4xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                        <Layers size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Stock Ledger</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#f3f4e6] text-[#F59E0B] rounded-xl border border-[#f3f4e6] shadow-sm">
            {icon}
        </div>
        <h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
    </div>
);

const DetailLabel: React.FC<{ label: string }> = ({ label }) => (
    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">{label}</p>
);

const DataBlock: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-1.5 mb-1">
            {icon}
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{label}</p>
        </div>
        <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
);

export default ViewMaterialReceiptEntry;