import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { deleteRFQEntry, getRFQEntry } from "../../ModuleStateFiles/RFQManagementSlice";
import {
    ChevronRight,
    // Package,
    Hash,
    Calendar,
    Users,
    Edit3,
    // ArrowLeft,
    // Printer,
    FileText,
    Activity,
    Trash2,
} from "lucide-react";

const ViewRFQ: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { rfq, loading } = useAppSelector((state) => state.rfqManagement);

    useEffect(() => {
        if (id) dispatch(getRFQEntry(id));
    }, [id, dispatch]);

    if (loading || !rfq)
        return (
            <div className="min-h-screen text-3xl flex items-center justify-center bg-[#f4f7f6] font-sans font-bold text-red-400">
                RFQ Not Found
            </div>
        );
    const formatDate = (date: string) => {
        if (!date) return "-";
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    };
    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/rfqs")}
                        className="hover:text-[#F59E0B] font-medium"
                    >
                        RFQ Management
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold tracking-tight">
                        {rfq.rfq_id}
                    </span>
                </div>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            RFQ Document
                        </h1>
                        <p className="text-slate-500 font-medium italic">
                            Sourcing summary and supplier engagement
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => dispatch(deleteRFQEntry(rfq.id,navigate))} className="outline-none flex items-center gap-2 px-4 py-2 text-rose-500 hover:text-rose-400 border rounded-xl font-bold text-sm transition-all"
                        >
                            <Trash2 size={20} /> Delete
                        </button>
                        <Link
                            to={`/purchase/rfqs/edit-rfq/${rfq.id}`}
                            className="outline-none flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#f67317] text-white rounded-xl font-black text-sm  transition-all"
                        >
                            <Edit3 size={18} /> Edit RFQ
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden h-fit">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <FileText size={120} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                                <FileText size={14} /> RFQ Details (Not-Editable)
                            </h3>
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Linked PR Ref
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        {rfq.pr_ref}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Material
                                    </label>
                                    <p className="text-slate-800 font-black text-base leading-tight">
                                        {rfq.material_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Requested Qty
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        {rfq.quantity} {rfq.unit}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <Hash className="text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Sourcing Status</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Timeline and invited vendor engagement
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                        <Calendar size={14} /> Deadline
                                    </label>
                                    <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800 text-lg">
                                        {formatDate(rfq.deadline)}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                        <Activity size={14} /> Current State
                                    </label>
                                    <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest text-center shadow-lg">
                                        {rfq.status}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 pt-10 border-t border-slate-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-6">
                                    <Users size={14} /> Invited Suppliers & Response Status
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {rfq.vendors.map((v) => (
                                        <div
                                            key={v.id}
                                            className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all"
                                        >
                                            <span className="font-black text-slate-800 text-sm tracking-tight">
                                                {v.name}
                                            </span>
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${v.status === "Received" ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-200"}`}
                                            >
                                                {v.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* <div className="mt-12 flex justify-end">
                                <button
                                    onClick={() => navigate("/purchase/rfqs")}
                                    className="outline-none px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft size={18} /> Return to Directory
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewRFQ;
