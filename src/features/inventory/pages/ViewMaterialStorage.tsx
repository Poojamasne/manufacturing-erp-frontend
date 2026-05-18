import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronRight,
    // ArrowLeft,
    Package,
    Hash,
    MapPin,
    Warehouse,
    Layers,
    // Printer,
    Info,
    History,
    User,
    ShieldCheck,
    ClipboardList
} from "lucide-react";
import { useAppSelector } from "../../common/ReduxMainHooks";
import type { RootState } from "../../../app/store/store";
import { useAppDispatch } from "../../../app/store/hook";
import { getStorageAllocation } from "../ModuleStateFiles/WarehouseSlice";

const ViewMaterialStorage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { allocation } = useAppSelector((state: RootState) => state.inventoryWarehouse);

    useEffect(() => {
        if (id) {
            dispatch(getStorageAllocation(id))
        }
    }, [id]);
    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* --- Header Section (Matching Lead View) --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                            <button onClick={() => navigate("/inventory/warehouse")} className="hover:text-[#F59E0B] transition-colors font-medium">Warehouse</button>
                            <ChevronRight size={14} />
                            <span className="text-gray-800 font-bold">{allocation?.batch_number}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase">Storage Details</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium font-mono tracking-tighter">
                            SYSTEM ALLOCATION LOG
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* <button
                            onClick={() => window.print()}
                            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 flex items-center justify-center gap-2"
                        >
                            <Printer size={18} /> Print Label
                        </button> */}
                        <button
                            onClick={() => navigate("/inventory/warehouse/edit-material/" + allocation?.id)}
                            className="flex-1 md:flex-none px-4 py-2 rounded-xl font-bold text-sm text-white bg-[#F59E0B] shadow-lg hover:bg-[#f67317] transition-all flex items-center justify-center gap-2"
                        >
                            Edit
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* --- Left Column: Material & Location (2/3) --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Section 1: Material Identity */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <SectionTitle icon={<Package size={20} />} title="Material Identity" />
                                <span className="bg-[#f3f4e6] text-[#F59E0B] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                    Active Stock
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <DetailLabel label="Material Details" />
                                    <p className="text-xl font-black text-slate-800 uppercase">{allocation?.material_name}</p>
                                    <p className="text-xs font-bold text-[#F59E0B] tracking-widest mt-1">{allocation?.material_code}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <DetailLabel label="Current Stock Volume" />
                                    <p className="text-4xl font-black text-slate-800">
                                        {allocation?.quantity.toLocaleString()}
                                        <span className="text-lg font-bold text-[#F59E0B] ml-2 uppercase">{allocation?.measure_unit}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Physical Location Details */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <SectionTitle icon={<MapPin size={20} />} title="Location Mapping" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                                <DataBlock icon={<Warehouse className="text-blue-500" />} label="Warehouse" value={allocation?.warehouse_name || ""} />
                                <DataBlock icon={<Layers className="text-purple-500" />} label="Rack / Bin ID" value={allocation?.rack_number || ""} />
                                <DataBlock icon={<Info className="text-amber-500" />} label="Storage Zone" value={allocation?.storage_area || ""} />
                            </div>
                        </div>

                        {/* Section 3: Notes & Remarks */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <SectionTitle icon={<ClipboardList size={20} />} title="Allocation Remarks" />
                            <div className="mt-4 p-5 bg-slate-50 rounded-2xl text-sm text-slate-600 leading-relaxed font-medium min-h-25 italic">
                                "{allocation?.notes}"
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Audit & Reference (1/3) --- */}
                    <div className="space-y-6">

                        {/* Reference Tracking Card */}
                        <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-white/10 text-white rounded-xl">
                                    <Hash size={20} />
                                </div>
                                <h3 className="font-bold text-xl tracking-tight">Traceability</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-1">Batch Number</p>
                                    <p className="text-xl font-bold font-mono tracking-tighter">{allocation?.batch_number}</p>
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div>
                                    <p className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-1">Receipt Reference</p>
                                    <button onClick={() => navigate(`/inventory/material-receipts/view/${allocation?.receipt_id}`)} className="text-sm font-bold text-[#F59E0B] hover:underline flex items-center gap-2 group">
                                        {allocation?.receipt_id} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="mt-8 pt-4">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Inventory Secured</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Log Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <SectionTitle icon={<User size={20} />} title="Audit Info" />
                            <div className="mt-6 space-y-4">
                                {/* <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Allocated By</span>
                                    <span className="text-sm font-bold text-slate-800">{allocation.allocated_by}</span>
                                </div> */}
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date Moved</span>
                                    <span className="text-sm font-bold text-slate-800">{allocation?.allocated_at}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Compliance</span>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                        <ShieldCheck size={10} /> VERIFIED
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-4xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-[#F59E0B] rounded-lg">
                                        <History size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Movement History</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-[#F59E0B] transition-colors" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Atomic Helper Components ---

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

export default ViewMaterialStorage;